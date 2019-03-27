import { callAPI } from '../store-globals/callAPI.js';
import $cookies from 'js-cookie';

export default {
  state: {
    loaded: false,
    choices: {}, // User's choices
    values: {}, // Questions and possible values
  },
  getters: {
    pawValues (state) {
      return (state.values);
    },
    pawNeedReset () {
      return (!$cookies.get('paw'));
    },
    pawEmpty (state) {
      return (Object.keys(state.choices).length === 0);
    },
    pawAllSet (state) {
      return (
        Object.keys(state.choices).length &&
        state.choices.place && Object.keys(state.choices.place).length &&
        state.choices.attitude && Object.keys(state.choices.attitude).length &&
        state.choices.weapon && Object.keys(state.choices.weapon).length
      );
    },
    userPaw (state) {
      return (state.choices);
    }
  },
  mutations: {
    LOADED (state) {
      state.loaded = true;
    },
    SAVE_CHOICES (state, data) {
      state.choices = {
        ...state.choices,
        ...data,
      };
    },
    SET_COOKIE_PAW () {
      $cookies.set('paw', 'true', 60 * 60 * 6);
    },
    SAVE_VALUES (state, data) {
      state.values = {
        ...data,
      };
    },
  },
  actions: {
    async fetchPaw ({getters, commit, state}, userid) {
      if (!userid) userid = getters.userid;
      // Don't fetch if need reset
      if (userid === getters.userid && getters.pawNeedReset) {
        commit('LOADED');
        return ({});
      }
      const response = await callAPI.get(`/matcher/paw?uid=${userid}`);
      const paw = { ...response.data };
      // If userid is the current user's
      if (userid === getters.userid) {
        // Save the result
        commit('SAVE_CHOICES', paw);
        if (getters.pawAllSet) {
          commit('SET_COOKIE_PAW');
        }
      }
      commit('LOADED');
      return (paw);
    },
    async getUserPaw ({ state, getters, dispatch }, userid) {
      // If no userid specified
      if (userid === undefined) {
        // userid is the current user's userid
        userid = getters.userid;
      }
      // If userid is the current user's and paw already full and no need to reset
      if (userid === getters.userid && !getters.pawEmpty) {
        // Return the current profile
        return (state.choices);
      } else {
        return await dispatch('fetchPaw', userid);
      }
    },
    async getPawValues ({ dispatch, commit }) {
      try {
        const response = await callAPI.get('/matcher/paw/available');
        commit('SAVE_VALUES', response.data);
        return (response.data);
      } catch (error) {
        dispatch('temporaryFlag', { message: 'Problem loading PAW', type: 'negative' });
      }
    },
    async postPaw ({ getters, dispatch, commit, state }, selected) {
      try {
        switch (selected.paw) {
        case 'place':
          await callAPI.post('/matcher/paw/choose-p', { 'id': selected.id });
          dispatch('reloadSuggestions');
          break;
        case 'attitude':
          await callAPI.post('/matcher/paw/choose-a', { 'id': selected.id });
          break;
        case 'weapon':
          await callAPI.post('/matcher/paw/choose-w', { 'id': selected.id });
          break;
        }
        // Save the choice
        const newChoice = (type, id) => {
          const pawValue = state.values[type].choices.find(c => c.id === id);
          const newChoice = {};
          newChoice[selected.paw] = { ...pawValue };
          return (newChoice);
        };
        commit('SAVE_CHOICES', newChoice(selected.paw, selected.id));
        if (getters.pawAllSet) {
          commit('SET_COOKIE_PAW');
        }
      } catch (error) {
        dispatch('temporaryFlag', { message: 'An error occured while loading your selection' });
      }
    },
  },
};
