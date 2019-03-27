<template>
<div class='full-profile window'>
  <div class='fp__info fp__info--top'>
    <h2 v-if="infos.age" class='fp__info__age'>
      age : {{infos.age}} y.o.
    </h2>
    <h1 v-if="infos.firstname" class='fp__info__fn'>
      {{infos.firstname || ""}}
    </h1>
    <h1 v-if="infos.lastname" class='fp__info__ln'>
      {{infos.lastname || ""}}
    </h1>
    <h3 class='fp__info__sep'>—</h3>
    <br>
  </div>
  <div @click="displayFullProfile" class='fp__ps'>
    <profile-summary :login="login" :image-src="imageSrc" :paw="paw">
    </profile-summary>
  </div>
  <div class='fp__info'>
    <div class='fp__info__images' v-for="url in pictures" :key="url">
      <img-loader width="500px" height="500px" :src="url" />
    </div>
    <div class='fp__info__statistics'>
      <h4>
        {{displayGender}} &nbsp;|&nbsp; {{displayScore}} &nbsp;|&nbsp; {{displayDistance}}
      </h4>
      <p class="fp__info__stat__log">
        {{lastConnected}}
      </p>
    </div>
    <div v-if='infos.bio' class='fp__info__bio'>
      <h3>
        More about {{infos.firstname}}:
      </h3>
      <p>
        {{infos.bio}}
      </p>
    </div>
  </div>
  <report-button @report='$emit("report")' class='fp__report-button' v-if="!loading && parseInt(infos.userid) !== parseInt($store.getters.userid)" :userid="parseInt(infos.userid)"></report-button>
</div>
</template>

<script>
import humanDate from '@/components/mixins/humanDate';
import ProfileSummaryVue from './ProfileSummary.vue';
import ImgLoaderVue from './ImgLoader.vue';
import ReportButton from '@/components/profile/ReportButton';

export default {
  name: 'FullProfile',
  components: {
    'profile-summary': ProfileSummaryVue,
    'img-loader': ImgLoaderVue,
    'report-button': ReportButton,
  },
  mixins: [ humanDate ],
  props: {
    infos: {
      type: Object,
      required: true
    },
    login: {
      type: String,
      required: true
    },
    paw: {
      type: Object,
      required: true
    },
    imageSrc: {
      required: true,
      type: String
    },
    full: {
      required: false,
      type: Boolean,
      default: false
    },
    score: {
      required: true,
      type: Number
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return ({
      fullProfile: this.full,
    });
  },
  methods: {
    displayFullProfile () {
      this.fullProfile = !this.fullProfile;
    },
  },
  computed: {
    lastConnected () {
      if (
        this.infos.lastIn === undefined &&
        this.infos.lastOut === undefined
      ) {
        return ('not connected');
      }
      return (this.infos.lastIn > this.infos.lastOut
              ? 'Online'
              : 'connected ' + this.humanDate(this.infos.lastOut));
    },
    pictures () {
      if (parseInt(this.infos.userid) === parseInt(this.$store.getters.userid)) {
        return (this.$store.getters.notMainImageSource);
      }
      if (this.infos.pictures) {
        return (this.infos.pictures.filter(p => !p.isMain).map(p => p.url));
      }
      return ([]);
    },
    displayScore () {
      return (
        this.$store.getters.isLightMode
          ? `${this.score}% likable`
          : `${100 - this.score}% repulsive`
      );
    },
    displayGender () {
      return (this.infos.gender === 'female' ? '♀' : this.infos.gender === 'male' ? '♂' : '⚲');
    },
    displayDistance () {
      if (this.infos.distance === undefined) return ('0 km away');
      return ((Math.round(this.infos.distance * 10) / 10) + 'km away');
    }
  },
};
</script>
<style scoped>
  .fp__info__images {
    margin-top: 2em;
  }
  .fp__info {
    max-width: 500px;
    box-sizing: content-box;
    margin: auto;
    text-align: left;
  }
  .fp__info--top {
    padding-top: 2em;
  }
  .fp__info__fn,
  .fp__info__ln {
    text-transform: capitalize;
  }
  .fp__info__sep {
    margin-bottom: .5em;
    margin-top: .5em;
  }
  .fp__info__age {
    position: absolute;
    text-align: right;
    right: 2em;
  }
  .fp__report-button {
    width: 100%;
    text-align: center;
    display: block;
    position: relative;
    top: 1.3em;
  }
  @media all and (max-width: 800px) {
    .fp__info__age {
      position: inherit;
    }
  }
  .fp__info__stat__log {
    text-align: left;
    font-size: 0.7em;
    position: relative;
    margin: 0;
  }
  .fp__info__statistics {
    position: absolute;
    top: 0;
  }
  .fp__info__statistics h4 {
    margin-bottom: 0;
  }
</style>