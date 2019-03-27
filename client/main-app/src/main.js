// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import axios from 'axios';
import VueAxios from 'vue-axios';
import { store } from './vuex/store';
import { config } from './config';
import io from 'socket.io-client';

Vue.use(VueAxios, axios);
Vue.use({
  install: (Vue) => {
    Vue.prototype.$socket = io(config.socketURL, {
      // autoConnect: false,
      query: { token: store.getters.token }
    });
  }
});

import * as VueGoogleMaps from 'vue2-google-maps';
Vue.use(VueGoogleMaps, {
  load: {
    key: config.googleKey,
    libraries: 'places'
  }
});

// /* do not remove */ console.log('%cWELCOME 👋  ', 'font-weight: bold; font-size: 50px; line-height: 100px; color: red; text-shadow: 3px 3px 0 rgb(217,31,38) , 6px 6px 0 rgb(226,91,14) , 9px 9px 0 rgb(245,221,8) , 12px 12px 0 rgb(5,148,68) , 15px 15px 0 rgb(2,135,206) , 18px 18px 0 rgb(4,77,145) , 21px 21px 0 rgb(42,21,113)');

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App },
  store,
});
