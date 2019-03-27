<template>
  <div id="app">

    <!-- Loader -->
    <transition name='load-fade'>
      <div class='loading' v-if='$store.getters.isLoading'>
        <div class='planet'>
          <div class='dot'></div>
        </div>
      </div>
    </transition>

    <!-- Flag -->
    <transition name='deploy'>
      <div class='flag' v-if='$store.state.flag.active'>
        {{$store.state.flag.message}}
      </div>
    </transition>

    <!-- Alert -->
    <transition name='fade'>
      <div  v-if='$store.state.alert.active' @click='closeAlert()' class='alert-container'>
        <transition name='fade-up'>
        <div class='alert' v-if='$store.state.alert.active'>
          {{$store.state.alert.message}}
        </div>
        </transition>
      </div>
    </transition>

    <div class="wrap">
      <nav-desktop class='nav-desktop' :nav="nav"></nav-desktop>
      <nav-mobile class='nav-mobile' :nav="nav"></nav-mobile>
      <main>
        <router-view></router-view>
      </main>
    </div>

    <footer class='main-footer'>
      <div class='content'>
        <router-link :to='{ name: "Contact" }'>
          💌
        </router-link>
        <p id="copyright">Copyright © PAMITEAM 2018 - Tous droits réservés.</p>
      </div>
    </footer>

  </div>


</template>

<script>
  import { loadingOnOff } from '@/components/mixins/loaderMethods';
  import NavMobile from '@/components/NavMobile';
  import NavDesktop from '@/components/NavDesktop';

  export default {
    name: 'app',
    mixins: [loadingOnOff],
    components: {
      'nav-mobile': NavMobile,
      'nav-desktop': NavDesktop
    },
    data () {
      return {
        nav: [
          {
            name: 'Login',
            title: 'Login',
            content: 'login'
          },
          {
            name: 'Register',
            title: 'Register',
            content: 'register'
          },
        ],
      };
    },
    methods: {
      closeAlert () {
        this.$store.commit('DISMISS_ALERT');
      }
    }
  };
</script>

<!--  -->
<!--  -->
<!--  -->

<style>

@import url('https://fonts.googleapis.com/css?family=Roboto');

:root {
  --blue-1: black;
  --blue-1-light: black;
  --blue-1-dark: black;
  --orange: #FF4200;
  --form-grey: rgba(0,0,0,.3);

  --head-h: 2em;

  --footer-h: 30px;
  --footer-pad: 20px;
  --footer-total-h: calc(var(--footer-h) + var(--footer-pad) + var(--footer-pad));
  --bg-image: url(/static/img/matchas.jpg);
  --bg-image-2: url(/static/img/zoo.jpg);

  --loader-size: 2rem;
  --loader-rotation-time: 4s;

  --text-color: white;
  --link-color: white;
  /* --bg: #FEB825;  */
  --bg: red;
  --pink: #ffa7c4;

  --font-fam: Roboto, arial, sans-serif;
  --accent-color-logo-url: url(/static/img/logos/heart-no-padding.svg);
}


html {
  font-size: 14pt;
  line-height: 130%;
  height: 100%;
  width: 100%;
}
body {
  background-color: var(--bg);
  height: 100%;
  width: 100%;
  margin: 0;
}

h1 {
  color: black;
  line-height: 120%;
}

a {
  color: var(--link-color);
  text-decoration: none;
  font-family: sans-serif;
  font-weight: 200;
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
  background-color: var(--bg);
}

.wrap {
  min-height: 100vh;
}

main {
  text-align: center;
  overflow: auto;
  padding-bottom: var(--footer-total-h);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

header {
  display: none;
  position: relative;
  height: 150px;
  padding-top: 20px;
}

button::-moz-focus-inner {
  border: 0;
}

@media all and (min-width: 30em) {
  header {
    display: block;
  }
  #app {
    background-image: var(--bg-image);
    background-size: cover;
    background-position: center;
  }
}

@media all and (min-width: 53em) {
  main {
    top: 10%;
  }
  .logo {
    background-image: url(/static/img/logos/heart.svg);
  }
}


/* FORMS */
form * {
  font-family: Roboto, sans-serif;
  font-weight: 300;
  font-size: .8rem;
}
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


@media all and (min-width: 53em) {
  .nav-mobile {
    display: none;
  }
  .nav-desktop {
    display: block;
  }
}

@media all and (max-width: 53em) {
  .wrap .nav-desktop.nav-desktop {
    display: none;
  }
}

/* Loader */

.loading {
  width: calc(var(--loader-size) * 1.8);
  height: calc(var(--loader-size) * 1.8);
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate3D(-50%, -50%, 0);
  border-radius: 100%;
  background: rgba(0, 0, 0, .3);
  z-index: 10;
  opacity: 1;
}

.loading .planet {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-image: url(/static/img/logos/heart.svg);
  background-repeat: no-repeat;
  /*background-attachment: fixed;*/
  background-position: center;
  background-size: contain;
  width: var(--loader-size);
  height: var(--loader-size);
}

.dot {
  position: absolute;
  bottom: -5%;
  left: -5%;
  -webkit-animation: xAxis var(--loader-rotation-time) infinite cubic-bezier(.15,-0.21,1,1);
  animation: xAxis var(--loader-rotation-time) infinite cubic-bezier(.15,-0.21,1,1);
  width: 10%;
  height: 10%;
}

.dot::after {
  content: '';
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 100%;
  background-color: #fff;
  -webkit-animation: yAxis var(--loader-rotation-time) infinite cubic-bezier(0,0,.82,1.16);
  animation: yAxis var(--loader-rotation-time) infinite cubic-bezier(0,0,.82,1.16);
}

@-webkit-keyframes yAxis {
  50% {
    -webkit-animation-timing-function: cubic-bezier(0,0,.82,1.16);
    animation-timing-function: cubic-bezier(0,0,.82,1.16);
    -webkit-transform: translateY(calc(var(--loader-size) * -1));
    transform: translateY(calc(var(--loader-size) * -1));
  }
}

@keyframes yAxis {
  50% {
    -webkit-animation-timing-function: cubic-bezier(0,0,.82,1.16);
    animation-timing-function: cubic-bezier(0,0,.82,1.16);
    -webkit-transform: translateY(calc(var(--loader-size) * -1));
    transform: translateY(calc(var(--loader-size) * -1));
  }
}

@-webkit-keyframes xAxis {
  50% {
    -webkit-animation-timing-function: cubic-bezier(.15,-0.21,1,1);
    animation-timing-function: cubic-bezier(.15,-0.21,1,1);
    -webkit-transform: translateX(var(--loader-size));
    transform: translateX(var(--loader-size));
  }
}

@keyframes xAxis {
  50% {
    -webkit-animation-timing-function: cubic-bezier(.15,-0.21,1,1);
    animation-timing-function: cubic-bezier(.15,-0.21,1,1);
    -webkit-transform: translateX(var(--loader-size));
    transform: translateX(var(--loader-size));
  }
}

.header-admin, .flag {
  position: relative;
  max-height: 74px;
  height: 74px;
  width: 100%;
  background-color: white;
  z-index: 100;
  color: black;
  text-align: right;
  padding: 5px 20px;
  box-sizing: border-box;
  overflow: hidden;
}

@media all and (min-width: 500px) {
  .header-admin, .flag {
    max-height: 37px;
    height: 37px;
  }
}

.header-admin, .header-admin a, .flag, .flag a {
  font-size: .6rem;
  /* margin: 0 5px; */
  font-family: Helvetica;
  text-transform: uppercase;
}

.header-admin, .header-admin a {
  color: black;
  font-weight: 400;
}

.flag {
  background-color: red;
  color: white;
  font-weight: 600;
}

.header-admin a {
  color: black;
  border-right: 1px solid black;
  padding: 0 5px;
  cursor: pointer;
}
.header-admin a:last-child {
  border-right: 0;
}

a.header-admin__link--on {
  background: black;
  color: white;
  font-weight: 600;
}
.header-admin a.header-admin__link--logout span {
  border-bottom: 1px solid var(--orange);
  margin: 0 5px;
  color: var(--orange);
}

.alert-container {
  position: fixed;
  background: rgba(0, 0, 0, .12);
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 100;
}

.alert {
  padding: 30px 40px;
  position: fixed;
  text-align: center;
  font-size: .8em;
  line-height: 120%;
  border: 0;
  background: white;
  font-family: Roboto, sans-serif;
  color: black;
  z-index: 100;
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 400px;
  box-sizing: border-box;
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
}

/* Hello transition */
.hello-fade-enter-active {
  transition: all .7s ease-out;
}
.hello-fade-leave-active {
  transition: all .4s ease-in;
}
.hello-fade-enter, .hello-fade-leave-to {
  transform: translateX(-10px);
  opacity: 0;
  max-height: 0px;
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

</style>
