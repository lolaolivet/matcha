<template>
</template>

<script>
export default {
  data: function () {
    return ({});
  },
  beforeMount () {
    const location = this.$store.getters.location;
    if (!location || Object.keys(location).length === 0) {
      const message = 'We need to know where you are 🔪';
      this.$store.dispatch('showFlag', {
        type: 'positive',
        message,
        button: {
          message: 'Locate me',
          fn: this.askGeolocation,
        },
        dismissFn: this.fallBackToAPI,
        fullscreen: true,
      });
    }
  },
  methods: {
    async askGeolocation (done) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => { await this.geolocationSuccess(position); done(); },
          async () => { this.fallBackToAPI(); done(); }
        );
      } else {
        this.fallBackToAPI();
        done();
      }
    },
    async geolocationSuccess (position) {
      let creds = {
        userid: this.$store.getters.userid,
        coordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
      };
      this.$store.dispatch('saveLocation', creds.coordinates);
      this.$store.dispatch('postLocationLog', creds);
    },
    async fallBackToAPI () {
      this.$store.dispatch('showFlag', {
        type: 'negative',
        message: 'Geolocation did not work',
        duration: 3000,
        fullscreen: true,
      });
      this.$store.dispatch('showFlag', {
        type: 'negative',
        message: '⚠️ The app can\'t work without geolocation',
        duration: 5000,
        fullscreen: true,
      });
      this.$store.dispatch('showFlag', {
        type: 'negative',
        message: 'Falling back to illegal, non-GDPR, hacky geolocation 🖕',
        duration: 5000,
        fullscreen: true,
      });
      const location = await this.$store.dispatch('getIPLocation');
      this.$store.dispatch('showFlag', {
        type: 'negative',
        message: 'We put you in ' + (location.data.city),
        duration: 2000,
        fullscreen: true,
      });
      this.$store.dispatch('showFlag', {
        type: 'negative',
        message: '🖕',
        duration: 2000,
        fullscreen: true,
      });
      let creds = {
        userid: this.$store.getters.userid,
        coordinates: {
          latitude: location.data.latitude,
          longitude: location.data.longitude
        }
      };
      this.$store.dispatch('saveLocation', creds.coordinates);
      this.$store.dispatch('postLocationLog', creds);
    }
  }
};
</script>
<style>
</style>
