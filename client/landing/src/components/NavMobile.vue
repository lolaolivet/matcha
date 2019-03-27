<template>
  <div :class='{"nav-mobile--hidden" : navHidden}'>
    <a href="/">
      <div class='logo logo--nav' @click='hideNav()'></div>
    </a>
    <nav>
      <router-link v-for='route in nav' :key='route.name' :to='{ name : route.name }' :class='{ "global__active-nav-link" : $route.name === route.name || $route.name === route.subname }' :name='$route.name === route.subname ? route.optname : ""' :title='route.title'>
        <span @click="hideNav()" v-html="route.content"></span>
        <hr>
      </router-link>
    </nav>
    <button class='nav-mobile__show-nav-mobile-button global-fix__outline' type='button' name='button' title='ouvrir le menu' @click='showNav()'>&#9776;</button>
    <button class='nav-mobile__hide-nav-mobile-button global-fix__outline' type='button' name='button' title='fermer le menu' @click='hideNav()'></button>
  </div>
</template>

<script>
  export default {
    props: {
      nav: {
        type: [Array],
        required: true
      },
    },
    data () {
      return {
        navHidden: true,
      };
    },
    methods: {
      hideNav () {
        this.navHidden = true;
      },
      showNav () {
        this.navHidden = false;
      },
    }
  };
</script>

<style scoped>
  .nav-mobile {
    overflow-y: scroll;
    font-size: 1.2em;
    line-height: 120%;
    font-family: sans-serif;
    font-weight: 300;
    position: fixed;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background-color: var(--orange);
    z-index: 4;
    transition: all 100ms;
    padding-top: 20px;
    box-shadow: -3px 5px 10px rgba(0, 0, 0, .2);
    transform: translate3d(0,0,0);
  }

  .nav-mobile.nav-mobile--hidden {
    position: fixed;
    width: 60px;
    height: 60px;
    padding: 0;
    max-height: 40%;
    border-radius: 100%;
    right: 15px;
    bottom: 15px;
    font-size: .3em;
    line-height: 120%;
    /*background: none;*/
    /*transition: none;*/
    /*transition: all 100ms;*/

  }

  .nav-mobile nav {
    /*position: absolute;*/
    /*left: 50%;*/
    /*top: 100px;*/
    /*width: 80%;*/
    height: 100vh;
    border-bottom: 5px solid red;
    /*transform: translate(-50%, 0);*/
    color: white;
    text-align: center;
    /*padding: 40px;*/
    /*z-index: -1;*/
  }

  .nav-mobile nav a {
    color: white;
    text-decoration: none;
    font-size: 2em;
    line-height: 120%;
    display: block;
    width: 100%;
    margin-top: 10%;
    margin-bottom: 10%;
    font-weight: 300;
  }

  @media all and (orientation: landscape) {
    .nav-mobile nav a {
      margin: 0;
    }
    .nav-mobile {
      overflow-y: scroll;
    }
  }

  .nav-mobile nav a:visited {
    color: white;
  }
  .nav-mobile nav ul {
    list-style: none;
    padding: 0;
  }
  .nav-mobile nav hr {
    width: 30%;
    border: 1px solid white;
    max-width: 300px;
  }

  .nav-mobile .logo-link {
    z-index: 2;
  }

  .nav-mobile.nav-mobile--hidden nav, .nav-mobile.nav-mobile--hidden .logo, .nav-mobile.nav-mobile--hidden .nav-mobile__hide-nav-mobile-button  {
    display: none;
  }

  .nav-mobile .nav-mobile__show-nav-mobile-button {
    color: white;
    font-family: sans-serif;
    font-size: 18px;
    display: none;
    width: 100%;
    height: 100%;
    background: none;
    border: none;
    position: relative;
    /*top: -25px;*/
    /* outline: 0; */
  }
  .nav-mobile.nav-mobile--hidden .nav-mobile__show-nav-mobile-button {
    display: block;
    /* transform: rotate(90deg); */
  }
  .nav-mobile__hide-nav-mobile-button, .nav-mobile__show-nav-mobile-button {
    cursor: pointer;
  }

  .nav-mobile__hide-nav-mobile-button {
    background-image: url(/static/img/icons/cross.svg);
    width: 30px;
    height: 30px;
    background-color: inherit;
    border: none;
    position: absolute;
    right: 10px;
    top: 30px;
    /* outline: none; */
  }

  .nav-mobile__fiktiva {
    max-width: 200px;
  }
</style>
