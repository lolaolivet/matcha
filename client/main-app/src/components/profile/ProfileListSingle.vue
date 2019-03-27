<template>
  <div class="profile-list-single">
    <div class="pls__image" @click="$store.dispatch('showFullProfile', userid)">
      <div :style="styleImg"></div>
    </div>
    <div class='pls__info'>
      <span class="pls__info__login" @click="displayFullProfile">{{login}}</span>
      <button
        class="pls__info__button"
        @click="button.action"
        :disabled='loading'
        >
        {{button.text}}
      </button>
    </div>
  </div>
</template>
<script>
import FullProfile from '@/components/profile/FullProfile';
import dateOfBirth from '../../../../_common/date-of-birth';

export default {
  name: 'ProfileListSingle',
  components: {
    'full-profile': FullProfile,
  },
  props: {
    userid: {
      type: Number,
      default: 0,
      required: true
    },
    login: {
      type: String,
      default: 'Jean-Jacques',
      required: true
    },
    picture: {
      type: String,
      default: 'https://smlycdn.akamaized.net/data/product2/2/9f58e4adc760ff9d26f359ee82db376a6569e3fb_sq.jpg',
      required: true
    },
  },
  data () {
    return ({
      display: false,
      infos: {},
      paw: {
        place: {},
        attitude: {},
        weapon: {},
      },
      loading: false,
    });
  },
  computed: {
    styleImg () {
      return 'background-image: url(' + this.picture + ')';
    },
    isLiked () {
      const userid = this.userid;
      const liked = this.$store.getters.liked;
      return (liked.find((e) => {
        return (parseInt(e.userid) === parseInt(userid));
      }));
    },
    isBlocked () {
      const userid = this.userid;
      const blocked = this.$store.getters.blocked;
      return (blocked.find((e) => {
        return (parseInt(e.userid) === parseInt(userid));
      }));
    },
    likesYou () {
      const userid = this.userid;
      const likedBy = this.$store.getters.likedBy;
      return (likedBy.find((e) => {
        return (parseInt(e.userid) === parseInt(userid));
      }));
    },
    button () {
      const lightMode = this.$store.getters.isLightMode;

      var button;
      if (this.isBlocked) {
        button = {
          text: 'Unblock',
          action: this.action('unblock'),
        };
      } else if (lightMode) {
        if (this.isLiked) {
          button = {
            text: 'Unlike',
            action: this.action('unlike'),
          };
        } else if (this.likesYou) {
          button = {
            text: 'Like Back !',
            action: this.action('like'),
          };
        } else {
          button = {
            text: 'Like',
            action: this.action('like'),
          };
        }
      } else {
        button = {
          text: 'Block',
          action: this.action('block'),
        };
      }
      return (button);
    },
  },
  async mounted () {
    await this.loadInfos();
  },
  methods: {
    async loadInfos () {
      const profile = await this.$store.dispatch('getProfileInfos', this.userid);
      this.infos = { ...profile, age: dateOfBirth.ageFromDob(profile.birthDate) };
      this.paw = await this.$store.dispatch('getUserPaw', this.userid);
    },
    action (type) {
      if (!(['like', 'unlike', 'block', 'unblock'].includes(type))) {
        throw new Error('Invalid action type');
      }
      return async () => {
        this.$emit('action');
        this.loading = true;
        const response = await this.$store.dispatch(type, this.userid);
        this.loading = false;
        return (response);
      };
    },
    displayFullProfile () {
      this.$store.dispatch('showFullProfile', this.userid);
    }
  }
};
</script>
<style>

.profile-list-single {
  /* border-bottom: 2px solid var(--accent-color); */
  display: flex;
  padding: .5em 0;
  margin: auto;
  justify-content: center;
  width: 18em;
  max-width: 90%;
}

.pls__image {
  width: 30%;
  cursor: pointer;
}
.pls__image > div {
  overflow: hidden;
  border-radius: 5em;
  width: 4em;
  height: 4em;
  padding-left: 0;
  transform: scale(1);
  background-size: contain;
  background-repeat: no-repeat;
  transition: transform 500ms;
}
.pls__image:hover > div {
  transform: scale(1.1);;
}
.pls__image:active > div {
  transform: scale(1);;
}

.pls__info {
  width: 70%;
  text-align: left;
  font-weight: bold;
  padding: .5em 0 .5em;
}

.pls__info__login {
  cursor: pointer;
  display: block;
  word-wrap: break-word;
  font-size: 1.2em;
  padding: 0 0 .2em;
}

.pls__info__button {
  cursor: pointer;
  display: block;
  font-size: 1em;
  padding: .1em .5em;
  border: 2px solid var(--accent-color);
  color: var(--accent-color);
  background-color: var(--bg);
  border-radius: 2em;
  outline: none;
}
.pls__info__button:hover {
  font-weight: bold;
  border: 2px solid var(--accent-color);
  color: white;
  background-color: var(--accent-color);
}
.pls__info__button:disabled {
  opacity: var(--op);
}
</style>