<template>
  <div>
    <div class='profile'>
      <!-- Loader -->
      <div class='profile__loader' v-if='!loaded'>
        <spin-loader></spin-loader>
      </div>
      <!-- Profile -->
      <full-profile
        v-if="id"
        :infos="infos"
        :paw="paw"
        :image-src="mainImageSource"
        :login="login"
        @report='$emit("report")'
        :score="score"
        :loading="!loaded"
      >
      </full-profile>
    </div>
  </div>
</template>

<script>
import FullProfile from './FullProfile';
import dateOfBirth from '../../../../_common/date-of-birth';
import Loader from '@/components/Loader';

export default {
  name: 'Profile',
  components: {
    'full-profile': FullProfile,
    'spin-loader': Loader,
  },
  props: {
    'userid': {
      type: Number,
    },
  },
  watch: {
    userid (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.reset(newVal);
        this.loadUser();
      }
    }
  },
  data () {
    return ({
      online: undefined,
      id: this.userid || this.$store.getters.userid,
      infos: {},
      paw: {
        place: {},
        attitude: {},
        weapon: {},
      },
      login: '',
      loaded: false,
      score: 0,
    });
  },
  computed: {
    mainImageSource () {
      if (this.id !== this.$store.getters.userid) {
        if (this.loaded) {
          return (this.infos.pictures.find(i => i.isMain).url);
        }
        return ('');
      } else {
        return (this.$store.getters.mainImageSource);
      }
    },
  },
  async beforeMount () {
    await this.loadUser();
  },
  methods: {
    reset (userid) {
      this.id = userid;
      this.loaded = false;
      this.infos = {};
      this.paw = {
        place: {},
        attitude: {},
        weapon: {},
      };
      this.login = '';
      this.bio = '';
      this.online = undefined;
      this.score = 0;
    },
    async loadUser () {
      this.$store.commit('LOCAL_LOADING_ON');
      const profile = await this.$store.dispatch('getProfileInfos', this.id);
      const paw = await this.$store.dispatch('getUserPaw', this.id);
      this.score = await this.$store.dispatch('getPopularityScore', this.id);
      this.$store.commit('LOCAL_LOADING_OFF');
      this.paw = paw;
      this.infos = { ...profile, age: dateOfBirth.ageFromDob(profile.birthDate) };
      this.login = this.infos.login;
      this.loaded = true;
    },
  }
};
</script>
<style scoped>
  .profile {
    user-select: none;
  }
  .profile__loader {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
  }
</style>
