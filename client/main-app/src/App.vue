<template>
  <div id="app" @click='closeNav'>
    <!-- FLAG -->
    <transition name='deploy'>
    <div
      class='alert-flag-container'
      v-if='$store.state.flag.active'
      :class='{"alert-flag-container--full" : $store.state.flag.fullscreen, "alert-flag-container--small" : !$store.state.flag.fullscreen}'
    >
      <alert-flag
        :timer-on='$store.state.flag.timerOn'
        :duration='$store.state.flag.duration'
        :message='$store.state.flag.message'
        :button='$store.state.flag.button'
        :dismiss-fn='$store.state.flag.dismissFn'
        :type='$store.state.flag.type'
        :fullscreen='$store.state.flag.fullscreen'
        @quit='$store.dispatch("dismissFlag")'
      ></alert-flag>
    </div>
    </transition>

    <!-- PROFILE WINDOW -->
    <div
      class='full-profile-window'
      @click='hideProfileWindow'
      :class='{"full-profile-window--hidden": !$store.getters.showProfileWindow}'
      v-if='appState === "app"'
      >
      <div @click.stop>
        <profile @report='hideProfileWindow' :userid="$store.state.profile.profileWindowId"></profile>
        <close-button class='full-profile-window__button' @close='hideProfileWindow'>close</close-button>
      </div>
    </div>

    <!-- BLOCKING SCREENS -->
    <set-up class='block-screen' v-if='appState === "set-up"'></set-up>
    <div class='block-screen' v-else-if='appState === "profile-edit"'>
      <h1>Your profile is not complete</h1>
      <profile-edit minimal></profile-edit>
    </div>
    <div class='block-screen' v-else-if="appState === 'set-paw'">
      <h1>More information</h1>
      <set-paw></set-paw>
    </div>

    <!-- APP -->
    <div v-else-if='appState === "app"'>

      <!-- Geolocator -->
      <geo-locator></geo-locator>
      <!-- Loader -->
      <spin-loader id='global-loader' v-if='$store.getters.isLoading'></spin-loader>
      <!-- app -->
      <div class="wrap">
        <nav-desktop class='nav-desktop' @click-paw="hideProfileWindow" :nav="nav" :show='$store.state.showNav'></nav-desktop>
        <main :class="{'hide-main': hideMain}">
          <!-- <button @click="() => { dummy = !dummy }">showflag</button> -->
          <router-view :socket="socket"></router-view>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
  import { loadingOnOff } from '@/components/mixins/loaderMethods';
  import NavDesktop from '@/components/NavDesktop';
  import GeoLocator from '@/components/GeoLocator';
  import Flag from '@/components/ui-elements/Flag';
  import Loader from '@/components/Loader';
  import SetUp from '@/components/ui-elements/SetUp';
  import ProfileEdit from '@/components/profile-edit/ProfileEdit';
  import SetPaw from '@/components/paw/SetPaw';
  import Profile from './components/profile/Profile';
  import CloseButtonVue from './components/ui-elements/CloseButton.vue';

  export default {
    name: 'app',
    mixins: [ loadingOnOff ],
    components: {
      'nav-desktop': NavDesktop,
      'geo-locator': GeoLocator,
      'alert-flag': Flag,
      'spin-loader': Loader,
      'set-up': SetUp,
      'set-paw': SetPaw,
      'profile-edit': ProfileEdit,
      'profile': Profile,
      'close-button': CloseButtonVue,
    },
    data () {
      return {
        socket: null,
        dummy: false,
        onlineIntervalRef: null,
      };
    },
    computed: {
      online () {
        return (this.$store.getters.online);
      },
      hideMain () {
        return (this.$route.name === 'Home');
      },
      profileLoading () {
        return (this.$store.getters.profileLoading);
      },
      profileImagesLoading () {
        return (this.$store.getters.profileImagesLoading);
      },
      showProfileEdit () {
        return (
          !this.profileLoading &&
          !this.profileImagesLoading &&
          (
            this.$store.state.images.images.length === 0 || this.$store.state.profile.incomplete
          )
        );
      },
      pawLoading () {
        return (!this.$store.state.paw.loaded);
      },
      showPaw () {
        return (!this.$store.getters.pawAllSet);
      },
      appState () {
        if (this.profileLoading || this.profileImagesLoading || this.pawLoading) return ('set-up');
        else if (this.showProfileEdit) return ('profile-edit');
        else if (this.showPaw) return ('set-paw');
        else return ('app');
      },
      nav () {
        return this.$store.state.nav.routes;
      },
    },
    methods: {
      whoIsOnline () {
        this.$socket.emit('online', (response, code) => {
          if (response === 'error') {
            if (code === 0) {
              if (this.onlineIntervalRef) {
                clearInterval(this.onlineIntervalRef);
                this.onlineIntervalRef = undefined;
              }
            }
            this.$store.dispatch('temporaryFlag', { message: code === 0 ? 'Socket error' : 'Too many devices connected to the chat', type: 'negative' });
          }
          var changed = response.length !== this.online.length;
          if (!changed) {
            for (let i in response) {
              changed = response[i] !== this.online[i];
              if (changed) break;
            }
          }
          if (changed) {
            this.$store.dispatch('saveOnline', response);
            return (response);
          }
        });
      },
      closeNav () {
        if (this.$store.state.showNav) {
          this.$store.dispatch('toggleNav');
        }
      },
      getNotif () {
        this.$store.dispatch('getNotifications');
      },
      hideProfileWindow () {
        this.$store.dispatch('hideFullProfile');
      },
    },
    async beforeMount () {
      await this.$store.dispatch('checkAuth');
      await this.$store.dispatch('getProfileInfos');
      await this.$store.dispatch('fetchImages');
      await this.$store.dispatch('getPawValues');
      await this.$store.dispatch('fetchPaw');
      await this.$store.dispatch('getLikes');
      await this.$store.dispatch('getMatches');
      // Get current notifications
      this.getNotif();
      this.whoIsOnline();
      this.onlineIntervalRef = setInterval(this.whoIsOnline, 5000);
      // Set up socket for notifications
      this.$socket.on('notification', (newNotif) => {
        if (!(newNotif.type === 'message' && this.$route.name === 'Chat')) {
          this.$store.dispatch('addNotif', newNotif);
        }
        switch (newNotif.type) {
        case 'match':
          this.$store.dispatch('filterFromNotif', 'unlike', newNotif.sender);
          this.$store.dispatch('getMatches');
          this.$store.dispatch('temporaryFlag', { message: 'You just got a new match!', type: 'positive' });
          break;
        case 'like':
          this.$store.dispatch('filterFromNotif', 'unlike', newNotif.sender);
          this.$store.dispatch('getLikes');
          this.$store.dispatch('getMatches');
          break;
        case 'unlike':
          this.$store.dispatch('filterFromNotif', 'match', newNotif.sender);
          this.$store.dispatch('filterFromNotif', 'message', newNotif.sender);
          this.$store.dispatch('filterFromNotif', 'like', newNotif.sender);
          this.$store.dispatch('getLikes');
          this.$store.dispatch('getMatches');
          this.$store.dispatch('removeUserFromChat', '');
          this.$store.dispatch('removeUserFromChat', newNotif.sender);
          break;
        case 'view':
          this.$store.dispatch('getDisplays');
          break;
        case 'block':
          this.$store.dispatch('filterFromNotif', 'view', newNotif.sender);
          this.$store.dispatch('filterFromNotif', 'unlike', newNotif.sender);
          this.$store.dispatch('filterFromNotif', 'match', newNotif.sender);
          this.$store.dispatch('filterFromNotif', 'message', newNotif.sender);
          this.$store.dispatch('filterFromNotif', 'like', newNotif.sender);
          // Refresh all lists
          this.$store.dispatch('getAllStats');
          this.$store.dispatch('removeUserFromChat', '');
          this.$store.dispatch('removeUserFromChat', newNotif.sender);
          break;
        case 'unblock':
          // Refresh all lists
          this.$store.dispatch('getAllStats');
          break;
        }
      });
      this.$socket.on('error', () => {
        this.$store.dispatch('temporaryFlag', { message: 'Socket error', type: 'negative' });
      });
      // darkMode ?
      await this.$store.dispatch('applyUiMode');
    },
  };
</script>

<style>

@import url('https://fonts.googleapis.com/css?family=Roboto');

:root {
  --form-grey: rgba(0,0,0,.3);

  --head-h: 3rem;
  --head-pv: .29rem;
  --head-ph: 1.2rem;
  --head-total-h: calc(var(--head-h) + var(--head-ph));

  --footer-h: 30px;
  --footer-pad: 20px;
  --footer-total-h: 1rem;

  --text-color: white;
  --link-color: white;

  --font-fam: Roboto, arial, sans-serif;

  --pink: #ffa7c4;
  --green: #458B00;
  --small-text-size: small;
  --op: .5;
  --cross-image-white: url(/app/static/img/icons/cross.svg);
  --cross-image-black: url(/app/static/img/icons/cross-black.svg);

  --win-max: 800px;
}

/* light vs darkness */
body.light {
  --bg: white;
  --contrast-color: white;
  --accent-color: var(--pink);
  --success: var(--accent-color);
  --cross-image: var(--cross-image-black);
  /* text */
  --text-color: black;
  --link-color: red;
  /* header */
  --head-img: linear-gradient(to bottom right, var(--bg), var(--accent-color));
  --head-img-soft: url(/app/static/img/dol.gif);
  --em: green;
  --third-color: lightblue;
}

body.dark {
  --bg: #232323;
  --contrast-color: black;
  --accent-color: #666;
  --success: var(--accent-color);
  --cross-image: var(--cross-image-white);
  /* text */
  --text-color: #ccc;
  --link-color: white;
  /* header */
  --head-img: url(/app/static/img/psycho-loop-once.gif);
  --em: orange;
  --third-color: black;
}
/* */

html {
  font-size: 14pt;
  line-height: 130%;
  height: 100%;
  width: 100%;
}

body {
  background-image: var(--head-img);
  background-size: cover;
  background-position: center 30%;
  background-color: var(--bg);
  height: 100%;
  width: 100%;
  margin: 0;
  color: var(--text-color);
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
}
body.light.soft {
  background-image: var(--head-img-soft);
}

h1 {
  color: var(--text-color);
}
h1, h2, h3, h4 {
  word-break: break-word;
  line-height: .8em;
}

a {
  color: var(--link-color);
  text-decoration: none;
  font-family: sans-serif;
  font-weight: 200;
  cursor: pointer;
}
a:visited {
  color: var(--link-color);
}
a:focus {
  color: var(--link-color);
}

#app {
  width: 100%;
  min-height: 100vh;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.wrap {
  min-height: 100vh;
  overflow: hidden;
}

main {
  text-align: center;
  overflow: auto;
  padding-bottom: var(--footer-total-h);
  position: absolute;
  padding-top: calc(2*var(--head-h));
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
main.hide-main {
  visibility: hidden;
}

.window {
  background-color: var(--bg);
  max-width: 90%;
  width: 34em;
  padding: 2em 1em;
  margin: auto;
  box-sizing: border-box;
  border-radius: .5em;
  position: relative;
}
.window--wide {
  width: 42em;
  padding: 2em 3em 3em;
}
.window--full {
  width: 100%;
  padding: 2em;
}

@media all and (max-width: 800px) {
  main {
    padding-bottom: 0;
  }
  .window {
    margin: 0;
    max-width: 100%;
    width: 100%;
  }
}

header {
  display: none;
  position: relative;
  height: 150px;
  padding-top: 20px;
}

#global-loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

button::-moz-focus-inner {
  border: 0;
}

header {
  display: block;
}


/* FORMS */
form input, form textarea, form button, form select {
  border: 0;
  background: white;
  border-radius: 2px;
  padding: 10px;
  margin: 5px;
}
form textarea {
  resize: none;
  box-sizing: border-box;
}
form select {
  appearance: none;
}
form button {
  cursor: pointer;
}
/**/

footer.main-footer {
  -webkit-font-smoothing: auto;
  -moz-osx-font-smoothing: auto;
  font-family: Roboto, sans-serif;
  padding: var(--footer-pad);
  position: relative;
  text-align: center;
  font-size: .6rem;
  height: var(--footer-h);
  margin-top: calc(-1 * var(--footer-total-h));
  color: var(--text-color);
  background-color: var(--bg);
  border-top: 1px solid #ccc;
}
footer.main-footer .content {
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  padding: .6rem 0;
}

#copyright {
  font-size: 1em;
  margin: 0;
}

.asteroids {
  width: 60%;
  max-width: 250px;
}


.nav-desktop {
  display: block;
  position: relative;
  z-index: 1;
}

/* GLOBAL STYLE ELEMENTS */
.global__superscript {
  vertical-align: super;
}

.global__contact-link {
  margin: 50px auto 0px;
  text-align: center;
}
.global__contact-link button {
  /* font-weight: 200;/ */
  font-size: large;
  cursor: pointer;
  color: white;
  font-family: sans-serif;
  border: 0;
  border-radius: 100px;
  padding: 15px;
  /* outline: none; */
  background: var(--orange);
  border: 2px solid black;
  color: black;
  background-color: white;
  font-weight: 300;
  transition: background-color 100ms, color 100ms;
}
.global__contact-link button:focus,
.global__contact-link button:hover {
  background-color: black;
  color: white;
}

.global__title {
  width: 80%;
  margin: auto;
  line-height: 120%;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: sans-serif;
  text-align: left;
  color: black;
}

h1.global__title {
  font-size: 2rem;
}
h2.global__title {
  font-size: 1.5rem;
}
@media (min-width: 800px) {
  h1.global__title {
    font-size: 2.5rem;
  }
  h2.global__title {
    font-size: 2rem;
  }
}

.global__alert {
  text-align: center;
  position: absolute;
  top: 50%;
  transform: translate(0, -50%);
  left: 0;
  /* bottom: 0; */
  right: 0;
  visibility: hidden;
  opacity: 0;
  transition: visibility 200ms, opacity 200ms;
  overflow-x: hidden;
  padding: 10px;
  margin: 3px;
  border-radius: 5px;
}
.global__alert--good {
  background: black;
}
.global__alert--bad {
  background: var(--orange);
}
.global__alert--good .global__alert__button--no {
  color: black;
}
.global__alert--bad .global__alert__button--no {
  color: var(--orange);
}
.global__alert p {
  color: white;
  font-weight: bold;
}
.global__alert--on {
  visibility: visible;
  opacity: .95;
}
.global__alert__button {
  display: block;
  margin: 5px auto;
  cursor: pointer;
  /* outline: 0; */
}
.global__alert__button.global__alert__button--yes {
  border: none;
  background: none;
  color: white;
  font-weight: bold;
}
.global__alert__button--yes:hover span {
  border-bottom: 1px solid white;
}
.global__alert__button--no {
  border: none;
  background: white;
  border-radius: 50px;
  width: 140px;
  height: 30px;
  font-weight: bold;
  font-size: medium;
}

.alert-flag-container.alert-flag-container--full {

}
.alert-flag-container.alert-flag-container--small {
  max-height: 30em;
  overflow: hidden;
  position: fixed;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

/* TRANSITIONS */

/* Admin Nav transition */
.deploy-enter-active {
  transition: all .4s ease-out;
}
.deploy-leave-active {
  transition: all .4s ease-out;
}
.deploy-enter, .deploy-leave-to {
  max-height: 0;
  height: 0;
}

/* Hello transition */
.fade-enter-active {
  transition: all .2s ease-out;
}
.fade-enter {
  transform: translateY(10px);
  opacity: 0;
}

/* Star background transition */
.star-enter-active {
  transition: all .4s ease;
}
.star-enter, .star-leave-to {
  transform: translateY(-10px);
  opacity: 0;
  max-height: 0px;
}

/* Fade up */
.fade-up-enter-active {
  transition: all .2s ease;
}
.fade-up-leave-active {
  transition: all .4s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.fade-up-enter, .fade-up-leave-to {
  transform: translateY(10px);
  opacity: 0;
  /* max-height: 0px; */
}

/*
  This below serves as an assurance that is the loading is shorter than 50ms
  the loader isn't displayed.
*/
.load-fade-enter-active {
  transition: all 50ms .1s;
}
/*
  And this is to make sure that if the loader is displayed, it stays at least
  50ms.
*/
.load-fade-leave-active {
  transition: all 50ms .4s;
}
.load-fade-enter, .load-fade-leave-to {
  opacity: 0;
}

/* quick fade */
.quick-fade-enter-active {
  transition: all .5s;
}
.quick-fade-leave-active {
  display: none;
}
.quick-fade-enter, .quick-fade-leave-to {
  opacity: 0;
}

.hello-slide-top-enter-active {
  transition: all .4s ease;
}
.hello-slide-top-leave-active {
  transition: all .4s ease;
}
.hello-slide-top-enter, .hello-slide-top-leave-to {
  transform: translateX(-110vw);
}

/* ANIMATIONS */
@keyframes blink {
  0% {
    opacity: .4;
  }
  100% {
    opacity: 0;
  }
}

.global-fix__outline,
.global__contact-link button,
.global__alert__button {
  outline: 0;
}
.global-fix__outline::-moz-focus-inner,
.global__contact-link button::-moz-focus-inner,
.global__alert__button::-moz-focus-inner {
  border: 0;
}

.vdp-datepicker header {
  all: initial;
  background-color: rgba(0, 0, 0, 0);
  box-shadow: none;
  box-sizing: border-box;
  color: rgb(0, 0, 0);
  display: block;
  font-family: var(--font-fam);
  font-size: 14.9333px;
  font-weight: 400;
  height: 0px;
  line-height: 51px;
  margin-bottom: 0px;
  margin-top: 0px;
  padding-top: 0px;
  position: static;
  text-align: left;
  width: 298px;
  z-index: auto;
  -webkit-font-smoothing: antialiased;
}

.app__loading {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background-color: rgba(109,108,105, 0.5);
  z-index: 10;
}
.block-screen {
  position: absolute;
  background-color: var(--bg);
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.block-screen h1 {
  margin: 2em auto 3em;
  text-align: center;
}

.full-profile-window {
  visibility: visible;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  max-width: 100%;
  display: flex;
  justify-content: left;
  align-items: center;
  transition: background-color 200ms, visibility 200ms;
  overflow: scroll;
  background-color: rgba(0,0,0,.2);
}
.full-profile-window.full-profile-window--hidden {
  visibility: hidden;
  background-color: rgba(0,0,0,0);
}
.full-profile-window > div {
  max-height: calc(100% - 2 * var(--head-h));
  width: auto;
  max-width: 100%;
  transform: scale(1);
  transition: transform 300ms ease-in-out;
}
.full-profile-window.full-profile-window--hidden > div {
  transform: scale(.95);
}
.full-profile-window__button {
  position: absolute;
  top: .3em;
  right: 1.9em;
}

@media all and (max-width: 800px) {
  .full-profile-window {
    padding-top: var(--head-h);
    max-width: 100%;
    display: block;
  }
  .full-profile-window__button {
    right: .3em;
  }
  .full-profile-window > div {
    transform: scale(1) translateY(0%);
  }
  .full-profile-window.full-profile-window--hidden > div {
    transform: scale(1) translateY(100%);
  }
}
</style>
