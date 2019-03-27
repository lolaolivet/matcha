import Vue from 'vue';
import Vuex from 'vuex';
import $cookies from 'js-cookie';

import { callAPI } from './store-globals/callAPI.js';

Vue.use(Vuex);

/**
 * STOCKED
 *
 * LocalStorage:
 *    userid: used to load the right informations
 *    location: used by profile
 *    email: used by contact form
 *    login
 *
 * Cookies:
 *    jwt: used for authentication
 *    paw: is a BOOLEAN describing is paw was set at least once during the current session
 *    dm: is a BOOLEAN describing the state light or dark mode
 */

/* LIGHT OR DARK */
import uiMode from './modules/ui-mode';

/* FLAG */
import flag from './modules/alert-flag.js';

/* LOCATION */
import location from './modules/location';

/* MATCHER */
import matcher from './modules/matcher';

/* PREFERENCES */
import preferences from './modules/preferences';

/* PROFILE */
import profile from './modules/profile';

/* CHAT */
import chat from './modules/chat';

/* STATS */
import stats from './modules/stats';

/* IMAGES */
import images from './modules/images';

/* NOTIFICATIONS */
import notif from './modules/notif';

/* NAV */
import nav from './modules/nav';

/* PAW */
import paw from './modules/paw';

export const store = new Vuex.Store({
  strict: true,
  modules: {
    uiMode,
    flag,
    location,
    matcher,
    profile,
    preferences,
    chat,
    stats,
    images,
    notif,
    nav,
    paw,
  },
  state: {
    triggerCleanChat: false,
    loading: false,
    localLoading: false,
    isLoggedIn: true,
    showNav: false,
    alert: {
      message: '',
      active: false,
    },
    online: [], // list of ids
  },
  getters: {
    isLoading (state) {
      return (state.loading || state.localLoading);
    },
    token () {
      return $cookies.get('jwt');
    },
    email () {
      return localStorage.getItem('email');
    },
    userid () {
      return localStorage.getItem('userid');
    },
    triggerCleanChat (state) {
      return (state.triggerCleanChat);
    },
    online (state) {
      return (state.online);
    },
  },
  mutations: {
    LOADING_ON (state) {
      state.loading = true;
    },
    LOADING_OFF (state) {
      state.loading = false;
    },
    LOCAL_LOADING_ON (state) {
      state.localLoading = true;
    },
    LOCAL_LOADING_OFF (state) {
      state.localLoading = false;
    },
    // Alert
    SET_ALERT_MESSAGE (state, message) {
      state.alert.message = message;
    },
    SHOW_ALERT (state) {
      state.alert.active = true;
    },
    DISMISS_ALERT (state) {
      state.alert.active = false;
    },
    SET_FLAG_MESSAGE (state, message) {
      state.flag.message = message;
    },
    SHOW_FLAG (state) {
      state.flag.active = true;
    },
    DISMISS_FLAG (state) {
      state.flag.active = false;
    },
    TOGGLE_NAV (state) {
      state.showNav = !state.showNav;
    },
    REMOVE_USER_FROM_CHAT (state, userid) {
      state.triggerCleanChat = userid;
    },
    SAVE_ONLINE (state, online) {
      state.online = online;
    },
  },
  actions: {
    removeUserFromChat ({ commit }, userid) {
      commit('REMOVE_USER_FROM_CHAT', userid);
    },
    saveOnline ({ commit }, online) {
      commit('SAVE_ONLINE', online);
    },
    async report ({ dispatch, commit }, receiverID) {
      const uid = parseInt(this.getters.userid);
      var creds = {
        uid: uid,
        reported_uid: receiverID
      };
      commit('LOCAL_LOADING_ON');
      try {
        let response = await callAPI.post('/matcher/report', creds);
        dispatch('filterUser', receiverID);
        commit('LOCAL_LOADING_OFF');
        return (response);
      } catch (error) {
        commit('LOCAL_LOADING_OFF');
        if (error.response === undefined || error.response.status === 500) {
          dispatch('temporaryFlag', { message: 'Internal Server Error', type: 'negative' });
        } else if (error.response.status === 400) {
          if (error.response.data.code === 4009)
            dispatch('temporaryFlag', { message: 'Cannot report a currently reported person', type: 'negative' });
          else
            dispatch('temporaryFlag', { message: 'Bad Request', type: 'negative' }); // Cannot report self (neat isn\'t it ?)
        } else if (error.response.status === 403)
          dispatch('temporaryFlag', { message: 'Unauthorized action', type: 'negative' });
        else if (error.response.status === 404) {
          dispatch('temporaryFlag', { message: 'User not found', type: 'negative' });
          if (error.response.data.code === 4041 ||
            error.response.data.code === 4042 ||
            error.response.data.code === 4043)
            dispatch('temporaryFlag', { message: 'Fake User', type: 'negative' }); // a revoir pour plus de precision ?
        }
      }
    },
    filterUser ({ dispatch, commit }, userid) {
      commit('REMOVE_FROM_SUGGESTIONS', userid);
      commit('REMOVE_FROM_MATCHER', userid);
      commit('REMOVE_FROM_BLOCKED', userid);
      commit('REMOVE_FROM_LIST_OF_MATCHES', userid);
      commit('REMOVE_FROM_LIKES', userid);
      commit('REMOVE_FROM_LIKED', userid);
      commit('REMOVE_FROM_VIEWED', userid);
      commit('REMOVE_FROM_VIEWEDBY', userid);
      commit('REMOVE_FROM_VIEWEDFULL', userid);
      commit('REMOVE_FROM_VIEWEDBYFULL', userid);
      commit('REMOVE_USER_FROM_CHAT', userid);
    },
    toggleNav ({ commit }) {
      commit('TOGGLE_NAV');
    },
    logout ({ commit }) {
      localStorage.clear();
      commit('CLEAR_IMAGE');
      commit('CLEAR_SUGGESTIONS');
      commit('CLEAR_PREFERENCES');
      commit('CLEAR_PROFILE');
      commit('CLEAR_STATS');
      $cookies.remove('paw');
      $cookies.remove('jwt');
      window.location = '/';
    },
    /**
     * Ask server if the token is legal and, if so,
     * resolves passing its translation.
     */
    async checkAuth ({ dispatch, commit, getters }) {
      // Get token
      let token = getters.token;
      if (token === undefined) {
        // If token undefined
        // Commit logout
        // Force out of app (-> window.location = '/');
        dispatch('logout');
        return;
      } else {
        // Else
        try {
          // Check token from back -> if ok should return latest email, login etc.
          const response = await callAPI.get('/check-token');
          // If ok
          const profile = response.data.profile;
          localStorage.setItem('login', profile.login);
          localStorage.setItem('email', profile.email);
          localStorage.setItem('userid', profile.userid);
          // Update saved credentials
          commit('SAVE_PROFILE', profile);
          return;
        } catch (error) {
          // Else
          // Commit logout
          // Force out of app (-> window.location = '/');
          dispatch('logout');
          return;
        }
      }
    },
    temporaryAlert ({ commit }, { message, duration }) {
      if (!duration) {
        duration = 5000;
      }
      commit('SET_ALERT_MESSAGE', message);
      commit('SHOW_ALERT');
      setTimeout(() => {
        commit('SET_ALERT_MESSAGE', '');
        commit('DISMISS_ALERT');
      }, duration);
    },
    /**
     * Ask for a NEW PASSWORD
     */
    newPasswordRequest ({ dispatch, commit }, { email }) {
      commit('LOCAL_LOADING_ON');
      try {
        const reponse = callAPI.post('/forgot-password', { email });
        commit('LOCAL_LOADING_OFF');
        return (reponse);
      } catch (error) {
        commit('LOCAL_LOADING_OFF');
        if (error.response.data === undefined)
          dispatch('temporaryFlag', { message: 'Network Error', type: 'negative' });
        else if (error.response.status === 500)
          dispatch('temporaryFlag', { message: 'Internal Server Error', type: 'negative' });
      }
    },
    async reinitializePwd ({ dispatch, commit }, {old, passw1, passw2, userid, tokenMail}) {
      var creds = {
        old: old,
        password: passw1,
        passwRepeat: passw2,
        uid: userid,
        tid: tokenMail
      };
      commit('LOCAL_LOADING_ON');
      try {
        const response = await callAPI.post('/new-pwd', creds);
        commit('LOCAL_LOADING_OFF');
        dispatch('temporaryFlag', { message: 'Your password has been updated', type: 'positive' });
        return (response);
      } catch (error) {
        commit('LOCAL_LOADING_OFF');
        if (error.response === undefined)
          dispatch('temporaryFlag', { message: 'Network Error', type: 'negative' });
        else if (error.response.data.code === 4001)
          dispatch('temporaryFlag', { message: 'Your password is misspelled', type: 'negative' });
        else if (error.response.data.code === 4002)
          dispatch('temporaryFlag', { message: 'Password is not valid', type: 'negative' });
        else if (error.response.data.code === 4003)
          dispatch('temporaryFlag', { message: 'Passwords don\'t match', type: 'negative' });
        else if (error.response.data.code === 401)
          dispatch('temporaryFlag', { message: 'Missing Parameters', type: 'negative' });
        else if (error.response.data.code === 403)
          dispatch('temporaryFlag', { message: 'Forbidden', type: 'negative' });
        else if (error.response.data.code === 404)
          dispatch('temporaryFlag', { message: 'User not Found', type: 'negative' });
        else if (error.response.data.code === 500)
          dispatch('temporaryFlag', { message: 'Internal Server Error', type: 'negative' });
      }
    }
  }
});
