<template>
  <transition name='fade'>
  <div class='preferences window window--wide'>
    <div>
      <h1>Define your preferences</h1>
    </div>
    <div>
      <br>
      <h3>Age:</h3>
      <br>
      <vue-slider
        class='preferences__vue-slider'
        v-model="ageRange"
        ref="age-range"
        :min="18"
        :max="80"
        :use-keyboard="true"
        :disabled='$store.state.localLoading'
      >
      </vue-slider>
    </div>
    <div>
      <br>
      <h3>Maximum distance in km</h3>
      <br>
      <vue-slider
        v-model="distMax"
        ref="dist-max"
        :min="1"
        :max="50"
        :use-keyboard="true"
        formatter="{value}km"
        :disabled='$store.state.localLoading'
        >
      </vue-slider>
    </div>
    <div>
      <br>
      <h3>Likable:</h3>
      <br>
      <vue-slider
        class='preferences__vue-slider'
        v-model="scoreRange"
        ref="score-range"
        :min="0"
        :max="100"
        formatter="{value}%"
        :use-keyboard="true"
        :disabled='$store.state.localLoading'
      >
      </vue-slider>
    </div>
    <br>
    <h3 for="">Looking for</h3>
    <div
      class='preferences__lf'>
      <p-check
        class="p-icon p-plain"
        color="success-o"
        toggle
        type="checkbox"
        id="female"
        v-model="lookfor.female"
        :disabled='$store.state.localLoading || (lovesOnlyOne && lookfor.female)'
      >
        <i class="icon mdi mdi-eye" slot="extra"></i>
        Female
        <i class="icon mdi mdi-eye-off" slot="off-extra"></i>
        <label slot="off-label">Female</label>
      </p-check>
      <br>
      <br>
      <p-check
        class="p-icon p-plain"
        color="success-o"
        toggle
        type="checkbox"
        id="male"
        v-model="lookfor.male"
        :disabled='$store.state.localLoading || (lovesOnlyOne && lookfor.male)'
      >
        <i class="icon mdi mdi-eye" slot="extra"></i>
        Male
        <i class="icon mdi mdi-eye-off" slot="off-extra"></i>
        <label slot="off-label">Male</label>
      </p-check>
      <br>
      <br>
      <p-check
        class="p-icon p-plain"
        color="success-o"
        toggle
        type="checkbox"
        id="other"
        v-model="lookfor.other"
        :disabled='$store.state.localLoading || (lovesOnlyOne && lookfor.other)'
      >
        <i class="icon mdi mdi-eye" slot="extra"></i>
        Other
        <i class="icon mdi mdi-eye-off" slot="off-extra"></i>
        <label slot="off-label">Other</label>
      </p-check>
    </div>
    <br>
    <ui-button class="preferences__bt" :disabled='disableButton || $store.state.localLoading' @click="savePref">Save</ui-button>
  </div>
  </transition>
</template>

<script>
  import InputWrapper from '@/components/ui-elements/InputWrapper';
  import VueSlider from 'vue-slider-component';
  import '@/../static/css/vue-slider-custom-theme.css';
  import PrettyCheck from 'pretty-checkbox-vue/check';
  import Button from '@/components/ui-elements/Button';

  export default {
    name: 'Preferences',
    components: {
      'input-wrapper': InputWrapper,
      'p-check': PrettyCheck,
      'vue-slider': VueSlider,
      'ui-button': Button,
    },
    data () {
      return ({
        ageRange: [...this.$store.state.preferences.ageRange],
        distMax: this.$store.state.preferences.distMax,
        lookfor: {...this.$store.state.preferences.lookfor},
        scoreRange: [...this.$store.state.preferences.scoreRange],
      });
    },
    computed: {
      lovesOnlyOne () {
        return ((this.lookfor.female + this.lookfor.male + this.lookfor.other) === 1);
      },
      disableButton () {
        return (
          this.ageRange[0] === this.$store.state.preferences.ageRange[0] &&
          this.ageRange[1] === this.$store.state.preferences.ageRange[1] &&
          this.scoreRange[0] === this.$store.state.preferences.scoreRange[0] &&
          this.scoreRange[1] === this.$store.state.preferences.scoreRange[1] &&
          this.distMax === this.$store.state.preferences.distMax &&
          this.lookfor.female === this.$store.state.preferences.lookfor.female &&
          this.lookfor.male === this.$store.state.preferences.lookfor.male &&
          this.lookfor.other === this.$store.state.preferences.lookfor.other
        );
      }
    },
    async mounted () {
      try {
        this.$store.commit('LOCAL_LOADING_ON');
        // Get the preferences (thus updating in the store)
        await this.$store.dispatch('getPreferences');
        // Update the preference per the store
        this.setDataToStoreValues();

        this.$store.commit('LOCAL_LOADING_OFF');
      } catch (err) {
        this.$store.commit('LOCAL_LOADING_OFF');
      }
    },
    methods: {
      setDataToStoreValues () {
        this.ageRange = [...this.$store.state.preferences.ageRange];
        this.scoreRange = [...this.$store.state.preferences.scoreRange];
        this.distMax = this.$store.state.preferences.distMax;
        this.lookfor = {...this.$store.state.preferences.lookfor};
      },
      async savePref () {
        this.$store.commit('LOCAL_LOADING_ON');
        try {
          // Update the prefs
          await this.$store.dispatch('updatePrefs', this._data);
          this.$emit('reload');
          this.$store.commit('LOCAL_LOADING_OFF');
        } catch (err) {
          this.$store.dispatch('temporaryFlag', { message: 'Network error', type: 'negative' });

          // Restore data to store values
          this.setDataToStoreValues();
          this.$store.commit('LOCAL_LOADING_OFF');
        }
      },
    }
  };
</script>

<style scoped>
  .preferences {
    padding: 3em;
  }

  .preferences__bt {
    font-size: .8rem;
  }

  .preferences__lf {
    font-size: 2rem;
    text-align: left;
  }

  .preferences h3 {
    text-align: left;
  }

  /* FIX FOR SLIDER COMPONENT */
  .vue-slider-component {
    z-index: 0;
  }
</style>
