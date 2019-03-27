<template>
  <div class="main-nav" ref="container">
    <router-link :to='{ name: "Home" }'>
      <ui-logo class='logo'></ui-logo>
    </router-link>
    <div @click.stop>
      <ui-switch class='switch' v-model="light"></ui-switch>
      <div class='caption'>
        <div class="caption-content">
          <h1>🔪 🤷 ❤️</h1>
        </div>
      </div>
    </div>
    <div class='soft-little-dolphin' v-if='$store.getters.isLightMode' @click="$store.dispatch('switchSoft')">🐬</div>
    <router-link class='paw-button' :to='{ name: "PawPage" }'><span @click='$emit("click-paw")'>📍</span>&nbsp;<span class='paw-button__name' v-if='$store.getters.userPaw.place'>{{$store.getters.isLightMode ? $store.getters.userPaw.place.name : $store.getters.userPaw.place.darkName}}</span></router-link>
    <router-link class='medal' :class="{ 'medal--shiny' : $route.name === 'Stats' }" :to='{ name : $route.name === "Stats" ? "Home" : "Stats" }'>🏅</router-link>
    <div class="burger" :class="{ 'burger--iddle' : $store.state.showNav }" @click.stop='toggle'>🍔</div>
    <notification :content='$store.getters.notifSum'></notification>

    <nav :class="{ 'nav--show' : $store.state.showNav }">
      <router-link
        v-for='route in nav.filter(r => {
          return !(r.routeName === "Chat" && $store.getters.matches.length === 0);
        })'
        :key='route.routeName'
        :to='{ name : route.routeName }'
        :class='{
          "main-nav__nav-link--current" : ($route.name === route.routeName)
        }'
        :name='$route.routeName === route.subname ? route.optname : ""'
        :title='route.title'
        @click='deleteNotif(route.routeName)'>
        <div>
          <div v-html="route.menuName"></div>
          <notification v-if='route.routeName === "Chat" && $route.name !== "Chat"' :content='parseInt(chatNotifCount)'></notification>
          <notification v-if='route.routeName === "Stats"' :content='parseInt(statsNotifCount)'></notification>
        </div>
      </router-link>
      <a class='main-nav__nav-link--logout'><div @click='$store.dispatch("logout")'>logout</div></a>
    </nav>
  </div>
</template>

<script>
  import Switch from '@/components/ui-elements/Switch';
  import Logo from '@/components/ui-elements/Logo';
  import Notif from '@/components/Notification-patch';

  export default {
    components: {
      'ui-switch': Switch,
      'ui-logo': Logo,
      'notification': Notif,
    },
    props: {
      nav: {
        type: [Array],
        required: true
      },
    },
    data () {
      return {
        navHidden: true,
        light: this.$store.state.uiMode.isLight,
      };
    },
    computed: {
      chatNotifCount () {
        return (
          this.$store.state.notif.message.length
        );
      },
      statsNotifCount () {
        return (
          this.$store.state.notif.like.length +
          this.$store.state.notif.unlike.length +
          this.$store.state.notif.match.length +
          this.$store.state.notif.view.length
        );
      },
    },
    methods: {
      toggle () {
        this.$store.dispatch('toggleNav');
      },
      hideNav () {
        this.navHidden = true;
      },
      showNav () {
        this.navHidden = false;
      },
    },
    watch: {
      light (newVal) {
        this.$store.dispatch('switchUiMode', newVal);
      }
    },
  };
</script>

<style scoped>
  .soft-little-dolphin {
    cursor: pointer;
  }
  .burger,
  .medal {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    user-select: none;
  }
  .burger {
    right: var(--head-ph);
    z-index: 2;
    transition: font-size 200ms ease, transform 200ms ease;
  }
  .medal {
    right: calc(var(--head-ph) + 1.5em);
  }

  .medal.medal--shiny {
    background-color: var(--accent-color);
    border-radius: 100%;
    cursor: default;
  }
  .burger.burger--iddle {
    font-size: 3em;
    transform: translate(-10%, 100%);
  }

  .paw-button {
    position: absolute;
    color: var(--text-color);
    top: var(--head-h);
    left: var(--head-ph);
    transform: translate(5px, 5px);
  }
  .paw-button__name {
    opacity: var(--op);
    text-shadow: 0 0 1em var(--bg);
    font-size: .8em;
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    font-weight: bold;
    position: relative;
    bottom: .1em;
    transition: opacity 200ms;
  }
  .paw-button__name:hover {
    opacity: 1;
  }
  .paw-button__name::before {
    content: '#place ';
    font-weight: normal;
    color: var(--em);
  }

  .switch {
    position: absolute;
    left: 50%;
    top: 13px;
    transform: translate(-50%, 0);
  }

  .main-nav {
    position: relative;
    font-size: 20pt;
    display: flex;
    align-items: center;
    color: var(--text-color);
    height: var(--head-h);
    padding: var(--head-pv) var(--head-ph);
    box-sizing: border-box;
    user-select: none;
  }

  .main-nav__gradient, .main-nav__cover {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }
  .main-nav__cover {
    background-color: transparent;
  }

  .main-nav nav {
    --wid: 400px;
    width: var(--wid);
    max-width: 100%;
    text-align: right;
    position: absolute;
    top: 0;
    right: 0;
    height: 100vh;
    background-image: radial-gradient(ellipse 100% 100% at bottom right, var(--bg) 0%, transparent 90%);
    font-size: 2em;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    transform: translateX(100%);
    transition: transform 200ms;
    pointer-events: none;
    background-color: var(--accent-color);
  }
  .main-nav nav.nav--show {
    pointer-events: initial;
    transform: translateX(0);
  }
  .main-nav nav a > div {
    transition: transform 400ms ease-out;
    transform: translateX(.5em);
  }
  .main-nav nav.nav--show a > div {
    transform: translateX(0);
  }

  .main-nav nav a {
    font-weight: 500;
    font-size: .9em;
    line-height: 1.8em;
    transition: filter 200ms, opacity 200ms;
  }
  .main-nav nav a > div {
    display: block;
    position: relative;
    padding-right: var(--head-ph);
    bottom: .01em;
    color: var(--text-color);
  }
  .main-nav nav a:hover > div {
    background-color: rgba(0,0,0,.1);
  }

  .logo {
    position: relative;
    width: 1.4em;
    height: 2em;
    display: inline-block;
    margin: 0 .6em 0 0;
  }

  .main-nav nav a.main-nav__nav-link--logout {
    cursor: default;
  }
  .main-nav nav a.main-nav__nav-link--logout > div {
    color: #b00;
    background: inherit;
    cursor: pointer;
    width: 3em;
    margin-left: auto;
    transition: color 200ms;
  }
  .main-nav nav a.main-nav__nav-link--logout > div:hover {
    color: red;
  }
  .main-nav nav .main-nav__nav-link--current {
    opacity: 1;
    cursor: default;
    pointer-events: none;
  }
  /* .main-nav nav .main-nav__nav-link--current > div {
    background-color: rgba(0,0,0,.1);
  } */
  .main-nav nav a {
    opacity: .5;
  }
  .main-nav nav a:hover {
    opacity: 1;
  }
  .caption {
    font-size: .8em;
    text-align: center;
    position: absolute;
    top: var(--head-h);
    left: 0;
    right: 0;
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
    transition: opacity 200ms, visibility 200ms;
  }
  .caption-content {
    position: relative;
    top: -.7em;
  }
  .switch:hover ~ .caption {
    visibility: visible;
    opacity: 1;
  }

  .notif {
    position: absolute;
    right: 1em;
    top: .5em;
  }

  @media all and (max-width: 800px) {
    .main-nav nav {
      text-align: left;
      font-size: 1.7em;
      display: block;
    }
    .main-nav nav a > div {
      padding-left: var(--head-ph);
    }
    .paw-button {
      opacity: var(--op);
    }
    .paw-button__name {
      opacity: 1;
      display: none;
    }
  }
</style>
