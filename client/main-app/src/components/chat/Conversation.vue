<template>
    <div class="conv-win">
      <!-- Container -->
      <div ref="container" class="conv-win__inside" @scroll="scrollHandler">
        <ul>
          <div
            v-if="lastSeen.in === undefined && lastSeen.out === undefined"
            class='last-seen last-seen--none'
          >
            Talk to {{interlocutor.profile.login}}
          </div>
          <li v-for="msg in messages" :key="msg.id">
            <chat-msg
              :txt='msg.txt'
              :user='isThisMe(msg.from) ? user : interlocutor'
              :time='msg.time'
              :incomming='isThisMe(msg.to)'
              class='conv-win__msg'
            >
            </chat-msg>
            <div v-if="parseInt(lastSeen.in) === parseInt(msg.id)" class='last-seen last-seen--in'></div>
            <div v-if="parseInt(lastSeen.out) === parseInt(msg.id)" class='last-seen last-seen--out'></div>
          </li>
        </ul>
      </div>
      <!-- Input -->
      <div class='message-input__container' @keyup='keyupHandler' @keydown='keydownHandler'>
        <div class="conv-win__profile-pic" @click="$store.dispatch('showFullProfile', interlocutor.userid);" :style="`background-image: url(${interlocutor.profile.picture})`"></div>
        <custom-textarea class='message-input' v-model="message"></custom-textarea><div class="conv-win__send-button" @click='sendMessage'>{{ $store.getters.isLightMode ? "🎈" : "🖕" }}</div>
        <!-- <div class="conv-win__profile-pic" @click="$store.dispatch('showFullProfile', user.userid);" :style="`background-image: url(${user.picture})`"></div> -->
      </div>
      <!-- Close button -->
      <close-button class="conv-win__close-chat" :class="{'conv-win__close-chat--open': open}" @close="$emit('close')"></close-button>
    </div>
</template>

<script>

/*

  -------------------------------------------------------------------

  PROPS

  - 1 -
  :user

    {
      userid,
      login,
      picture,
    }

  - 2 -
  :interlocutor

    {
      userid,   <- Id of the other user
      online,   <- Boolean for "is the user online"
      profile: {
        login,
        picture,  <- String : url of the user's img
      },
    },

  - 3 -
  :messages

    [
      {
        from,
        to,
        id,
        txt,
        date,
        seen,
      }
    ]

  -------------------------------------------------------------------

  EVENTS

  - close -

    Ask the parent to close this conversation window

  - send -
    args : txt from to

    Send a message

  - seen -

    Set all messages as seen

  -------------------------------------------------------------------

 */

import Message from './Message';
import TextareaAutoResize from '@/components/TextareaAutoResize';
import HumanDate from '@/components/mixins/humanDate';
import CloseButton from '../ui-elements/CloseButton';

export default {
  name: 'ChatConv',
  mixins: [HumanDate],
  components: { 'close-button': CloseButton, 'chat-msg': Message, 'custom-textarea': TextareaAutoResize },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Object,
      required: true,
    },
    interlocutor: {
      type: Object,
      required: true,
    },
    messages: {
      type: Array,
    },
  },
  data () {
    return ({
      message: '',
      data: {},
      autoScroll: false,
      shiftDown: false,
      // close button
      open: false
    });
  },
  mounted () {
    setTimeout(() => { this.open = true; }, 100);
    this.scrollToLast();
  },
  computed: {
    lastSeen () {
      const onlySeen = this.messages.filter((m) => m.seen);
      const incommingSeen = onlySeen.filter((m) => this.isThisMe(m.to));
      const outgoingSeen = onlySeen.filter((m) => this.isThisMe(m.from));
      const inLastSeen = (incommingSeen.length || undefined) && incommingSeen[incommingSeen.length - 1].id;
      const outLastSeen = (outgoingSeen.length || undefined) && outgoingSeen[outgoingSeen.length - 1].id;
      return ({
        in: inLastSeen,
        out: outLastSeen
      });
    }
  },
  watch: {
    messages (newVal) {
      const messages = newVal;
      this.setLastIncommingSeen(messages);
      if (this.autoScroll) {
        this.$nextTick(this.scrollToLast);
      }
    },
    interlocutor () {
      this.autoScroll = true;
    },
  },
  methods: {
    setLastIncommingSeen (messages) {
      if (messages instanceof Array) {
        const incomming = messages.filter((m) => this.isThisMe(m.to));
        if (incomming.length) {
          const last = incomming[incomming.length - 1];
          if (last && last.to && this.isThisMe(last.to) && !last.seen && this.autoScroll) {
            this.$emit('seen', last);
          }
        }
      }
    },
    isThisMe (userid) {
      return (parseInt(userid) === parseInt(this.user.userid));
    },
    scrollToLast () {
      this.autoScroll = true;
      // Get last message element
      const messages = document.querySelectorAll('.conv-win__msg');
      const lastMessage = messages[messages.length - 1];
      // Scroll last message into view
      if (lastMessage) {
        lastMessage.scrollIntoView();
      }
    },
    scrollHandler (e) {
      const container = this.$refs.container;
      if (container.scrollTop === container.scrollHeight - container.clientHeight) {
        this.autoScroll = true;
        this.setLastIncommingSeen(this.messages);
      } else {
        this.autoScroll = false;
      }
    },
    // Text input
    keydownHandler (event) {
      this.shiftDown = this.shiftDown || event.key === 'Shift';
      if (event.key === 'Enter' && !this.shiftDown) {
        event.stopPropagation();
        event.preventDefault();
        this.sendMessage();
      }
    },
    keyupHandler (event) {
      this.shiftDown = this.shiftDown && event.key !== 'Shift';
    },
    sendMessage () {
      this.scrollToLast();
      let text = this.message.trim();
      this.$emit('send', { message: text, to: this.interlocutor.userid });
      this.message = '';
    },
  }
};
</script>

<style>
.conv-win {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  max-width: 1100px;
  width: 100%;
  border-top-right-radius: 1em;
  background-color: rgba(0,0,0,.1);
}
.conv-win__close-chat {
  position: absolute;
  top: 0;
  right: 0;
  transition: transform 200ms ease-in-out;
  transform: translate(.2em, -.2em);
}
.conv-win__close-chat--open {
  transform: translate(.7em, -.7em);
}

.conv-win__profile-pic {
  font-size: 1.2em;
  cursor: pointer;
  min-width: 3em;
  width: 3em;
  height: 3em;
  border-radius: 20em;
  background-position: center;
  background-size: contain;
  transform: scale(1);
  transition: transform 200ms;
}
.conv-win__profile-pic:hover {
  transform: scale(1.05);
}
.conv-win__profile-pic:active {
  transform: scale(1);
}

.conv-win__inside ul {
  list-style-type: none;
  margin: 0;
  padding: .5em 1em;
  box-sizing: border-box;
}

.last-seen::before,
.last-seen::after {
  opacity: var(--op);
  top: -.2em;
  position: relative;
}
.last-seen--in::after,
.last-seen--out::before {
  font-size: .7em;
  content: 'seen';
  font-weight: bold;
  top: -.55em;
  position: relative;
}
.last-seen--in::before,
.last-seen--out::after {
  padding: 0 .2em;
  font: normal normal normal 1em/1 "Material Design Icons";
  content: '\F208';
}
.last-seen--in {
  text-align: left;
}
.last-seen--out {
  text-align: right;
}
.last-seen--none {
  font-weight: bold;
}

.message-input__container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5em 1em;
}
.message-input {
  font-size: 1em;
  border: 0;
  background-color: var(--msg-color);
  margin: .5em;
  border-radius: 2em;
  padding: 1em 2em;
  text-align: right;
  width: 100%;
  height: 4em;
  box-sizing: border-box;
  color: black;
  outline: none;
}

.conv-win__inside {
  width: 100%;
  height: 100%;
  display: flex;
  flex: 1;
  justify-content: flex-start;
  flex-direction: column;
  overflow: scroll;
}
.conv-win__inside > :first-child {
  margin-top: auto;
}
.conv-win__send-button {
  font-size: 3em;
  cursor: pointer;
}
@media all and (max-width: 800px) {
  .conv-win {
    position: absolute;
    top: var(--head-h);
    left: 0;
    bottom: 0;
    right: 0;
    background-color: var(--third-color);
  }
  .conv-win__close-chat {
    top: 1em;
    right: 1em;
  }
}
</style>
