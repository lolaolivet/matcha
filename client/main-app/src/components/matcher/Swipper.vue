<template>
  <transition name='fade'>
  <div
    v-if='infos !== undefined && $store.getters.suggestions.length'
    class='swipper window'
    @click="diplayFullProfile"
  >
    <div class='action-buttons'>
      <button class='ignore' :disabled='loading' @click.stop="loadNext">🤷</button>
      <button class='like' v-if='this.$store.getters.isLightMode' :disabled='loading' @click.stop='like'>❤️</button>
      <button class='block' v-else :disabled='loading' @click.stop='block'>🔪</button>
    </div>
    <profile-summary
      class='profile-summary'
      :login="profile.login"
      :image-src="profile.imgSrc"
      :paw="profile.paw"
    >
    </profile-summary>
    <div v-if='likesYou' class="pastille"><ui-logo></ui-logo><span>liked you</span></div>
  </div>
  <div class='swipper' v-else>
    <h1>No suggestion for you right now</h1>
    <h2>Come back later</h2>
  </div>
  </transition>
</template>

<script>
import ProfileSummary from '@/components/profile/ProfileSummary';
import Logo from '@/components/ui-elements/Logo';

export default {
  name: 'Swipper',
  components: {
    'profile-summary': ProfileSummary,
    'ui-logo': Logo,
  },
  props: ['socket'],
  data () {
    return ({
      loading: false,
      infos: {},
      paw: {
        place: {},
        attitude: {},
        weapon: {},
      },
      login: '',
      imgSrc: '',
    });
  },
  async created () {
    // initialiser dans le store la liste des liked
    if (this.$store.getters.liked.length === 0)
      await this.loadLikes();
    // peut se faire ailleurs, avant - comme dans chat initialisation des matchs ?
    if (this.$store.getters.suggestionsAlmostEmpty) {
      await this.loadSuggestions();
    }
    await this.updateSuggestion();
    // if (this.infos !== undefined) {
    //   await this.loadProfile(this.infos.userid);
    // }
  },
  watch: {
    infos (viewed) {
      this.logView(viewed.userid);
    }
  },
  computed: {
    likesYou () {
      const userid = this.userid;
      const likedBy = this.$store.getters.likedBy;
      return (likedBy.find((e) => {
        return (parseInt(e.userid) === parseInt(userid));
      }));
    },
    profile () {
      /*
        {
          "paw": {
            "place": {
              "id": 2,
              "name": "Cinema",
              "darkName": "Behind the cinema screen"
            },
            "attitude": {
              "id": 1,
              "name": "Bullish",
              "darkName": "Loud and effective, TAC TAC TAC"
            },
            "weapon": {
              "id": 2,
              "name": "Brain",
              "darkName": "Humiliation"
            }
          },
          "location": {
            "latitude": "-22.9773065",
            "longitude": "-43.1898984"
          },
          "userid": 262,
          "lastIn": 1552784070016,
          "profileSummary": {
            "userid": 262,
            "login": "silverfrog362",
            "birthDate": 538167111000,
            "gender": "male",
            "lastIn": 1552784062500,
            "lastOut": 1552784067500,
            "picture": {
              "id": 465,
              "url": "https://randomuser.me/api/portraits/men/67.jpg",
              "ownerID": 262,
              "dateAdded": 1552784066929,
              "encoding": null,
              "mimetype": null,
              "size": null,
              "isMain": true
            }
          }
        }
       */
      // Added this as a substitute for the other variables, but did not clean up
      if (this.$store.state.matcher.suggestions[0]) {
        const sug = { ...this.$store.state.matcher.suggestions[0] };
        return ({
          login: sug.profileSummary.login,
          imgSrc: sug.profileSummary.picture ? sug.profileSummary.picture.url : '',
          paw: sug.paw,
        });
      }
      return ({
        login: '',
        imgSrc: '',
        paw: {
          place: {},
          attitude: {},
          weapon: {},
        },
      });
    },
  },
  async beforeMount () {
    if (this.$store.getters.suggestionsAlmostEmpty) {
      await this.loadSuggestions();
    }
  },
  methods: {
    diplayFullProfile () {
      this.$store.dispatch('showFullProfile', this.infos.userid);
    },
    report () {
      this.$store.commit('NEXT_SUGGESTION');
      this.updateSuggestion();
    },
    async loadUserPaw () {
      this.$store.commit('LOCAL_LOADING_ON');
      const paw = await this.$store.dispatch('getUserPaw', this.infos.userid);
      this.$store.commit('LOCAL_LOADING_OFF');
      this.paw = paw;
    },
    loadLikes () {
      this.$store.dispatch('getLikes');
    },
    async block () {
      this.loading = true;
      if (await this.$store.dispatch('block', this.infos.userid)) {
        // modify state myListOfLikes
        await this.loadLikes();
        // modify state matches
        await this.$store.dispatch('getMatches');
        // next
        await this.loadNext();
      }
      this.loading = false;
    },
    async like () {
      this.loading = true;
      const response = await this.$store.dispatch('like', this.infos.userid);
      if (response) {
        // modify state myListOfLikes
        await this.loadLikes();
        // modify state matches
        await this.$store.dispatch('getMatches');
        // next
        await this.loadNext();
      }
      this.loading = false;
    },
    async loadNext () {
      this.loading = true;
      if (
        this.$store.getters.suggestionsAlmostEmpty
      ) {
        await this.loadSuggestions();
      }
      this.$store.commit('NEXT_SUGGESTION');
      await this.updateSuggestion();
      this.loading = false;
    },
    async updateSuggestion () {
      this.infos = this.$store.getters.suggestions[0] || {};
    },
    async loadSuggestions () {
      // load new profiles if no more in queue state.suggestion
      await this.$store.dispatch('loadSuggestions', {
        nbr: '30',
        except: true,
        score: true,
        age: true,
        dist: true,
        like: true,
        view: true,
      });
    },
    logView (userid) {
      if (userid) {
        this.$store.dispatch('logProfileDisplay', { viewedUid: userid, full: false });
      }
    }
  }
};
</script>

<style scoped>

  .swipper {
    position: relative;
    user-select: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 80%;
  }
  @media all and (max-width: 800px) {
    .swipper {
      position: relative;
      display: block;
      height: auto;
      font-size: .8em;
    }
  }
  .swipper.window {
    background-color: transparent;
  }

  .swipper .profile-summary {
    cursor: pointer;
    transform: perspective(30em) translateZ(0);
    transition: transform 200ms;
  }
  .swipper .profile-summary:hover {
    transform: perspective(30em) translateZ(.5em);
    cursor: pointer;
  }
  .swipper .profile-summary:active {
    transform: perspective(30em) translateZ(0);
    cursor: pointer;
  }

  .action-buttons {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
  }
  .action-buttons button {
    cursor: pointer;
    font-size: 4em;
    background-color: transparent;
    border: 0;
    border-radius: 10em;
    width: 1.5em;
    height: 1.5em;
    outline: 0;
  }
  .action-buttons button:disabled {
    pointer-events: none;
    opacity: var(--op);
  }
  .action-buttons button.ignore {
    position: absolute;
    left: -1em;
  }
  .action-buttons button.like,
  .action-buttons button.block {
    position: absolute;
    right: -1em;
  }

  @media all and (max-width: 800px) {
    .action-buttons button.ignore {
      position: absolute;
      left: .5em;
      bottom: -1.5em;
    }
    .action-buttons button.like,
    .action-buttons button.block {
      position: absolute;
      right: .5em;
      bottom: -1.5em;
    }
  }
  @media all and (max-height: 700px) {
    .swipper {
      padding-top: 0;
      padding-bottom: 0;
    }
    .action-buttons button.ignore {
      position: absolute;
      left: .5em;
      bottom: 20%;
    }
    .action-buttons button.like,
    .action-buttons button.block {
      position: absolute;
      right: .5em;
      bottom: 20%;
    }
  }
  .action-buttons button.ignore::after {
    color: var(--text-color);
    content: 'Ignore';
  }
  .action-buttons button.like::after {
    color: var(--text-color);
    content: 'Like';
  }
  .action-buttons button.block::after {
    content: 'Never see again...';
    color: var(--em);
  }
  .action-buttons button.ignore::after,
  .action-buttons button.like::after,
  .action-buttons button.block::after {
    opacity: 0;
    font-size: .23em;
    font-weight: bold;
    border-radius: .2em;
    padding: .3em .5em .5em;
    position: absolute;
    bottom: 100%;
    left: 50%;
    text-align: right;
    transform: translateX(-40%);
    background-color: var(--bg);
    transition: opacity 200ms, transform 200ms;
  }
  .action-buttons button.like::after,
  .action-buttons button.block::after {
    text-align: left;
    transform: translateX(-60%);
  }
  .action-buttons button.ignore:hover::after,
  .action-buttons button.like:hover::after,
  .action-buttons button.block:hover::after {
    opacity: 1;
    transform: translateX(-50%);
  }

  .pastille {
    font-size: 2em;
    width: 4em;
    height: 4em;
    padding: 0;
    line-height: 1em;
    color: #fff;
    font-weight: bold;
    background-image: url(/app/static/img/logos/heart-no-padding.svg);
    background-size: contain;
    background-repeat: no-repeat;
    position: absolute;
    left: 1em;
    bottom: -.5em;
  }
  .pastille span {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 0.7em 0.5em;
  }
</style>
