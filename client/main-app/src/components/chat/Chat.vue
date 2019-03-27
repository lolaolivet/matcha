<template>
  <div class="full-chat window window--full">
    <conv-list
      :previews='previews'
      :current='currentInterlocutorId'
      @select='switchConv'
    >
    </conv-list>
    <conv-window
      v-if="currentInterlocutorId !== null"
      :loading='loadingConv'
      :user='user'
      :interlocutor='interlocutor'
      :messages="messages"
      @close="closeConv"
      @send='sendMessage'
      @seen='setAsSeen'
    >
    </conv-window>
  </div>
</template>

<script>
import Conversation from './Conversation';
import ConvList from './ConvList';

export default {
  components: { 'conv-window': Conversation, 'conv-list': ConvList },
  data () {
    return {
      messages: [], // All messages of currently open conv
      previews: [], // All last messages of all conversations
      currentInterlocutorId: null, // Whose conv is open
      user: null,
      loadingConv: false,
      lastMessages: [],
    };
  },
  watch: {
    async currentInterlocutorId (newVal) {
      if (newVal) {
        this.loadingConv = true;
        await this.fetchConversation(newVal);
        this.currentPreviewUp(newVal);
        this.loadingConv = false;
      }
    },
    cleanChat (userid) {
      if (userid) {
        if (parseInt(userid) === parseInt(this.currentInterlocutorId)) {
          this.currentInterlocutorId = null;
        }
        this.lastMessages = this.lastMessages.filter(m => parseInt(m.userid) !== userid);
        if (this.lastMessages.length === 0) this.redirectIfNoMatch();
        this.refreshPreviews(this.lastMessages);
      }
    },
    online (newVal) {
      this.refreshPreviews(this.lastMessages);
    },
  },
  computed: {
    interlocutor () {
      if (this.previews && this.previews instanceof Array && this.currentInterlocutorId) {
        let rec = this.previews.find((p) => p.userid === this.currentInterlocutorId);
        if (rec) {
          // Filter out lastMsg
          rec = {
            profile: rec.profile,
            userid: rec.userid,
          };
        }
        return (rec);
      }
    },
    cleanChat () {
      return (this.$store.getters.triggerCleanChat);
    },
    online () { // list of ids
      return (this.$store.getters.online);
    }
  },
  beforeMount () {
    this.redirectIfNoMatch();
  },
  async mounted () {
    // load self profile summary
    try {
      const profile = await this.$store.dispatch('getProfileSummary');
      const me = profile;
      const uid = this.$store.getters.userid;

      this.user = {
        userid: uid,
        login: me.login,
        picture: me.picture.url,
      };

      await this.fetchPreviews(uid);
      this.previewsFirstSort();

      /* SET UP THE SOCKET */

      this.$socket.on('message', this.onMessage);

      this.$socket.on('seen', (data) => {
        const { id, from, to } = data;
        this.setConvAsSeen(id, from, to);
        this.setPreviewsAsSeen(id, from, to);
      });

      this.$socket.on('error', () => {
        this.$store.dispatch('temporaryFlag', { message: 'Server error', type: 'negative' });
      });

      this.$store.dispatch('deleteNotifications', 'message');
    } catch (error) {
      this.$store.dispatch('temporaryFlag', { message: 'Error fetching user profile', type: 'negative' });
    }
  },
  beforeDestroy () {
    this.$socket.removeListener('message', this.onMessage);
    this.$store.dispatch('eraseMessageNotif');
    this.$store.dispatch('deleteNotifications', 'message');
    this.$socket.emit('offline');
  },
  methods: {
    redirectIfNoMatch () {
      if (this.$store.getters.matches.length === 0) {
        this.$router.push({name: 'Matcher'});
      }
    },
    async onMessage (newMessage) {
      // If message part of current conversation
      // update the conversation (this.messages)
      if (newMessage.from === this.currentInterlocutorId || newMessage.to === this.currentInterlocutorId) {
        this.fetchConversation(this.currentInterlocutorId);
      }

      await this.fetchPreviews(this.user.userid);
    },
    isThisMe (userid) {
      return (parseInt(userid) === parseInt(this.user.userid));
    },
    setConvAsSeen (id, from, to) {
      const incomming = from === this.currentInterlocutorId;
      const outgoing = to === this.currentInterlocutorId;
      if (incomming || outgoing) {
        const notSeen = this.messages.filter((m) => !m.seen);
        const outMess = notSeen.filter((m) => this.isThisMe(from));
        const inMess = notSeen.filter((m) => this.isThisMe(to));
        // If no message in the conv is unseen, ignore
        if ((incomming && inMess.length === 0) || (outgoing && outMess.length === 0)) {
          return;
        } else {
          const messages = incomming ? inMess : outMess;
          const lastSeen = messages.find((m) => m.id === id);
          messages.map(m => {
            if (m.time <= lastSeen.time) {
              m.seen = true;
            }
          });
          this.fetchPreviews();
        }
      }
    },
    setPreviewsAsSeen (id, from, to) {},
    setAsSeen (msg) {
      // this.$store.dispatch('setConvSeen', msg);
      if (!msg.seen) {
        this.$socket.emit('seen', { id: msg.id });
      }
    },
    /*
      current is meant to be the current interlocutor (defaults to this.currentInterlocutor)
    */
    currentPreviewUp (current) {
      if (!current) {
        current = this.currentInterlocutorId;
      }
      // const sorter = (a, b) => ((b.userid === current) - (a.userid === current)); // Push current up

      const sorter = (a, b) => {
        let aCurrent = a.userid === current;
        let bCurrent = b.userid === current;
        return (bCurrent - aCurrent);
      };
      if (current) {
        this.previews = this.previews.sort(sorter);
      }
    },
    previewsFirstSort () {
      // sort by date
      // push "new contacts" up (by pretending their date is +Infinity)
      const sorter = (a, b) => {
        let dateA = a.lastMsg.date;
        let dateB = b.lastMsg.date;
        return ((dateB === undefined ? +Infinity : dateB) - (dateA === undefined ? +Infinity : dateA));
      };
      this.previews = this.previews.sort(sorter);
    },
    // Iterator : creates one preview object from one message object
    createPreview (m) {
      /*
        {
          userid,     <- Id of the other user
          online,     <- Boolean for "is the user online"
          newContact, <- Haven't talked yet
          profile: {
            login,
            picture,    <- String : url of the user's img
          },
          lastMsg: {
            incomming,
            seen,           <- Boolean for "has the conv been seen"
            txt: m.txt,
            date: m.time,
          },
        }
      */
      const to = m.to;
      const incomming = parseInt(to) === parseInt(this.$store.getters.userid);
      const userid = m.userid;
      const online = this.online.includes(userid);
      return ({
        userid,
        newContact: to === undefined, // "to === undefined" meaning "no last message" meaning "new contact"
        profile: {
          picture: m.profile.picture.url,
          login: m.profile.login,
        },
        lastMsg: {
          incomming,
          seen: m.seen,
          txt: m.txt,
          date: m.time,
        },
        online,
      });
    },
    /**
     * refreshPreviews updates this.previews but keeps the current order of the array
     */
    refreshPreviews (lastMessages) {
      const newPreviews = lastMessages.map(this.createPreview);
      // Shallow copy to avoid problems if the order of this.previews is mutated somewhere else
      let previews = [...this.previews];
      // if newPreviews is shorter than this.previews
      if (previews.length > newPreviews.length) {
        // filter out those that don't exist anymore
        previews = previews.filter(prev => newPreviews.find((el) => el.userid === prev.userid));
      } else {
        // Add a few empty slots at the end of previews
        previews = previews.concat(Array(newPreviews.length - previews.length));
      }
      // Update previews
      for (let i = 0; i < previews.length; i++) {
        // Find the equivalent element in newPreviews
        let newElem = newPreviews.find(p => previews[i] && previews[i].userid === p.userid);
        if (!newElem) {
          // If it does not exist, just pop the last element
          newElem = newPreviews.pop();
        } else {
          // If it does
          // Remove the element from newPreviews
          const index = newPreviews.indexOf(newElem);
          newPreviews.splice(index, 1);
        }
        // Insert the element in place of the one that was at that index
        previews[i] = newElem;
      }
      this.previews = previews;
    },
    async fetchPreviews (uid) {
      // Perform call
      try {
        // Fetch last messages
        const lastMessages = await this.$store.dispatch('getLastMessages', uid);
        // If response
        if (lastMessages) {
          // Memoize
          this.lastMessages = lastMessages;
          // Create previews
          this.refreshPreviews(lastMessages);
        }
      } catch (error) {
        this.$store.dispatch('temporaryFlag', { message: 'Error fetching messages', type: 'negative' });
      }
    },
    switchConv (id) {
      if (this.currentInterlocutorId === id) {
        this.closeConv();
      } else {
        this.currentInterlocutorId = id;
      }
    },
    closeConv () {
      this.currentInterlocutorId = null;
    },
    async fetchConversation (interlocutorId) {
      const conv = await this.$store.dispatch('getFullChatConversation', interlocutorId);
      this.messages = conv;
    },
    sendMessage ({ message, to }) {
      if (message) {
        this.$socket.emit('message', { message, to });
      }
    },
  },
};
</script>

<style>
.full-chat {
  --msg-color: white;
  --incomming-msg-color: var(--accent-color);
  display: flex;
  margin: auto;
  height: 100%;
  box-sizing: border-box;
}
</style>
