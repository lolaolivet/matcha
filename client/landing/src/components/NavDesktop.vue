<template>
    <div class="nav-desktop">
      <router-link :to='{ name: "Home" }'>
        <div class='logo'>
        </div>
      </router-link>
      <nav>
        <router-link v-for='route in nav' :key='route.name' :to='{ name : route.name }' :class='{ "global__active-nav-link" : $route.name === route.name || $route.name === route.subname }' :name='$route.name === route.subname ? route.optname : ""' :title='route.title'>
          <div v-html="route.content"></div>
        </router-link>
      </nav>
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

.nav-desktop {
  font-size: 20pt;
  display: flex;
  align-items: center;
  background-color: var(--bg);
  color: var(--link-color);
  height: 2em;
  padding: .29em 1.2em .29em 1.2em;
  box-sizing: border-box;
}

.nav-desktop nav {
  display: inline-block;
  position: absolute;
  right: 1.2em;
}

.nav-desktop nav a {
  font-weight: bold;
  font-size: .9em;
  line-height: 1.8em;
  transition: filter 200ms, opacity 200ms;
}
.nav-desktop nav a div {
  display: inline-block;
  margin: 0 .6em;
  position: relative;
  bottom: .01em;
}

.logo {
  background-image: var(--accent-color-logo-url);
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  width: 1.4em;
  height: 2em;
  display: inline-block;
  margin: 0 .6em 0 0;
}

.nav-desktop nav a.global__active-nav-link {
  opacity: 1;
  cursor: default;
}
.nav-desktop nav a {
  opacity: .5;
}
.nav-desktop nav a:hover {
  opacity: 1;
}
</style>


