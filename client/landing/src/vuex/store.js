import Vue from 'vue';
import Vuex from 'vuex';
import { callAPI } from './store-globals/callAPI.js';
import $cookies from 'js-cookie';
import * as regex from '../../../_common/regex.js';

Vue.use(Vuex);

export const store = new Vuex.Store({
  strict: true,
  state: {
    loading: false, // This is for data loading events
    localLoading: false,
    pending: false, // While this is for login
    // The reason to distinguish the two above is that I want
    // to protect against the event that one of the two would
    // terminate the other too early.
    isLoggedIn: true,
    alert: { message: '', active: false },
    flag: { message: '', active: false },
  },
  getters: {
    isLoading (state) {
      return (state.loading || state.pending);
    },
    token (state) {
      return $cookies.get('jwt');
    },
    email (state) {
      return localStorage.getItem('email');
    },
    userid (state) {
      return localStorage.getItem('userid');
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
    LOGING_IN (state) {
      state.pending = true;
    },
    SET_NAME (state, name) {
      localStorage.setItem('name', name);
    },
    SET_EMAIL (state, email) {
      localStorage.setItem('email', email);
    },
    LOGIN_SUCCESS (state, logData) {
      // Add token to profile
      logData.profile.token = logData.jwt;
      // Add token to all api calls
      callAPI.defaults.headers.common['Authorization'] = logData.profile.token;
      // Save the jwt in cookies
      document.cookie = 'jwt=' + logData.jwt;
      state.pending = false;
    },
    LOGIN_FAILURE (state) {
      state.pending = false;
    },
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
  },
  actions: {
    async register ({ state }, creds) {
      try {
        const response = await callAPI.post('/register', creds);
        return (response);
      } catch (err) {
        if (err.response === undefined) {
          return ({ error: 'Network Error' });
        } else {
          return ({ error: err.response.data.message });
        }
      }
    },
    async confirm ({ state }, creds) {
      try {
        const response = await callAPI.get(`/confirm?uid=${creds.uid}&tid=${creds.tid}`);
        return (response);
      } catch (error) {
        return (error.response);
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
    temporaryFlag ({ commit }, { message, duration }) {
      if (!duration) {
        duration = 5000;
      }
      commit('SET_FLAG_MESSAGE', message);
      commit('SHOW_FLAG');
      setTimeout(() => {
        commit('SET_FLAG_MESSAGE', '');
        commit('DISMISS_FLAG');
      }, duration);
    },
    async login ({ commit, dispatch }, creds) {
      // Change app state
      commit('LOGING_IN');
      $cookies.remove('paw');
      $cookies.remove('jwt');
      // Check weither the identifier is an email
      let trimEmail = creds.identifier.trim();
      let isEmail = !!trimEmail.match(regex.email);
      if (isEmail) {
        // If so create "email" credentials
        creds = { email: creds.identifier.trim(), password: creds.password };
      } else {
        // Otherwise create "login" credentials
        creds = { login: creds.identifier.trim(), password: creds.password };
      }
      commit('LOCAL_LOADING_ON');
      try {
        const response = await callAPI.post('/login', creds);
        commit('LOGIN_SUCCESS', response.data);
        commit('LOCAL_LOADING_OFF');
        window.location = '/app';
        return (response.data);
      } catch (err) {
        commit('LOGIN_FAILURE');
        commit('LOCAL_LOADING_OFF');
        if (err.response === undefined) {
          return ({ error: 'Network Error' });
        } else if (err.response.status === 500) {
          return ({ error: 'Internal Server Error' });
        } else if (err.response.status === 401) {
          return ({ error: 'Wrong password' });
        } else if (err.response.status === 404) {
          return ({ error: 'User not Found' });
        } else if (err.response.status === 403) {
          return ({ error: 'You need to confirm your email address before loging in' });
        }
      }
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
    reinitializePwd ({ dispatch, commit, getters }, {old, passw1, passw2, userid, tokenMail}) {
      var creds = {
        old: old,
        password: passw1,
        passwRepeat: passw2,
        uid: userid,
        tid: tokenMail,
      };
      commit('LOCAL_LOADING_ON');
      try {
        const response = callAPI.post('/new-pwd', creds);
        commit('LOCAL_LOADING_OFF');
        return (response);
      } catch (error) {
        commit('LOCAL_LOADING_OFF');
        if (error.response === undefined)
          dispatch('temporaryFlag', { message: 'Network Error', type: 'negative' });
        else if (error.response.data.code === 500)
          dispatch('temporaryFlag', { message: 'Internal Server Error', type: 'negative' });
      }
    }
  }
});
