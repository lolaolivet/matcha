import { callAPI } from '../store-globals/callAPI.js';

export default {
  state: {
    matches: [],
    liked: [],
    likedBy: [],
    blocked: [],
    viewed: [],
    viewedFull: [],
    viewedBy: [],
    viewedByFull: [],
  },
  getters: {
    matches (state) {
      return (state.matches);
    },
    viewed (state) {
      return (state.viewed);
    },
    viewedFull (state) {
      return (state.viewedFull);
    },
    viewedBy (state) {
      return (state.viewedBy);
    },
    viewedByFull (state) {
      return (state.viewedByFull);
    },
    liked (state) {
      return (state.liked);
    },
    likedBy (state) {
      return (state.likedBy);
    },
    blocked (state) {
      return (state.blocked);
    },
  },
  mutations: {
    // SAVERS
    SAVE_LIST_OF_MATCHES (state, payload = []) {
      state.matches = payload;
    },
    SAVE_LIST_OF_BLOCKED (state, payload = []) {
      state.blocked = payload;
    },
    SAVE_LIST_OF_VIEWED_BY (state, payload = []) {
      for (let i in payload) {
        if (payload[i].fullprofile)
          state.viewedByFull.push(payload[i]);
        else
          state.viewedBy.push(payload[i]);
      }
    },
    SAVE_LIST_OF_VIEWED (state, payload = []) {
      for (let i in payload) {
        if (payload[i].fullprofile)
          state.viewedFull.push(payload[i]);
        else
          state.viewed.push(payload[i]);
      }
    },
    SAVE_LIKED (state, payload = []) {
      state.liked = payload;
    },
    SAVE_LIKED_BY (state, payload = []) {
      state.likedBy = payload;
    },

    // REMOVERS
    REMOVE_FROM_LIST_OF_MATCHES (state, userid) {
      const list = state.matches;
      var filtered = list.filter(function (value) {
        return value.userid !== userid;
      });
      state.matches = filtered;
    },
    REMOVE_FROM_BLOCKED (state, userid) {
      const list = state.blocked;
      var filtered = list.filter(function (value) {
        return value.userid !== userid;
      });
      state.blocked = filtered;
    },
    REMOVE_FROM_LIKES (state, userid) {
      const list = state.liked;
      var filtered = list.filter(function (value) {
        return value.userid !== userid;
      });
      state.liked = filtered;
    },
    REMOVE_FROM_LIKED (state, userid) {
      const list = state.likedBy;
      var filtered = list.filter(function (value) {
        return value.userid !== userid;
      });
      state.likedBy = filtered;
    },
    REMOVE_FROM_VIEWED (state, userid) {
      const list = state.viewed;
      var filtered = list.filter(function (value) {
        return value.userid !== userid;
      });
      state.viewed = filtered;
    },
    REMOVE_FROM_VIEWEDBY (state, userid) {
      const list = state.viewedBy;
      var filtered = list.filter(function (value) {
        return value.userid !== userid;
      });
      state.viewedBy = filtered;
    },
    REMOVE_FROM_VIEWEDFULL (state, userid) {
      const list = state.viewedFull;
      var filtered = list.filter(function (value) {
        return value.userid !== userid;
      });
      state.viewedFull = filtered;
    },
    REMOVE_FROM_VIEWEDBYFULL (state, userid) {
      const list = state.viewedByFull;
      var filtered = list.filter(function (value) {
        return value.userid !== userid;
      });
      state.viewedByFull = filtered;
    },

    // TRANSIT LIKEDBY TO LIST OF MATCHES
    ADD_TO_MATCHER (state, userid) {
      // Find user in likedBy
      var user = state.likedBy.find((value) => {
        return value.userid === userid;
      });
      // If user not already in listOfMatches, add it
      if (!state.matches.find(user => parseInt(user.userid) === parseInt(userid))) {
        state.matches.push(user);
      }
    },

    // CLEARER
    CLEAR_STATS (state) {
      state.matches = [];
      state.myListOfLike = new Map();
      state.listOfMyLikers = new Map();
      state.liked = [];
      state.likedBy = [];
      state.blocked = [];
      state.viewed = [];
      state.viewedFull = [];
      state.viewedBy = [];
      state.viewedByFull = [];
    },
    REINIT_LISTS_OF_DISPLAY (state) {
      state.viewed = [];
      state.viewedFull = [];
      state.viewedBy = [];
      state.viewedByFull = [];
    },
  },
  actions: {
    getAllStats ({ dispatch }) {
      return Promise.all([
        dispatch('getMatches'),
        dispatch('getLikes'),
        dispatch('getBlocks'),
        dispatch('getDisplays')
      ]);
    },
    async getMatches ({ dispatch, commit, getters }) {
      const uid = parseInt(getters.userid);
      try {
        commit('LOCAL_LOADING_ON');
        const response = await callAPI.get(`/matcher/matches?uid=${uid}`);
        commit('SAVE_LIST_OF_MATCHES', response.data);
        commit('LOCAL_LOADING_OFF');
        return (response.data);
      } catch (error) {
        commit('LOCAL_LOADING_OFF');
        dispatch('temporaryFlag', { message: 'Error loading your natchos', type: 'negative' });
        /* */
        if (error.response.status === 400)
          dispatch('temporaryFlag', { message: 'Bad Request', type: 'negative' });
        else if (error.response.status === 403)
          dispatch('temporaryFlag', { message: 'Unauthorized action', type: 'negative' });
        else if (error.response.status === 404)
          dispatch('temporaryFlag', { message: 'User not found', type: 'negative' });
        else if (error.response.status === 500)
          dispatch('temporaryFlag', { message: 'Internal Server Error', type: 'negative' });
        /* */
      }
    },
    async getLikes ({ dispatch, commit, getters }) {
      const uid = parseInt(getters.userid);
      commit('LOCAL_LOADING_ON');
      try {
        const response = await callAPI.post(`/matcher/likes?uid=${uid}`);
        commit('SAVE_LIKED', response.data.given);
        commit('SAVE_LIKED_BY', response.data.received);
        commit('LOCAL_LOADING_OFF');
        return (response.data);
      } catch (error) {
        commit('LOCAL_LOADING_OFF');
        dispatch('temporaryFlag', { message: 'Error loading your potential matches', type: 'negative' });
        /* */
        if (error.response.status === 400)
          dispatch('temporaryFlag', { message: 'Bad Request', type: 'negative' });
        else if (error.response.status === 403)
          dispatch('temporaryFlag', { message: 'Unauthorized action', type: 'negative' });
        else if (error.response.status === 404)
          dispatch('temporaryFlag', { message: 'User not found', type: 'negative' });
        else if (error.response.status === 500)
          dispatch('temporaryFlag', { message: 'Internal Server Error', type: 'negative' });
        /* */
      }
    },
    async getBlocks ({ dispatch, commit, getters }) {
      const uid = parseInt(getters.userid);
      commit('LOCAL_LOADING_ON');
      try {
        const response = await callAPI.get(`/matcher/blocks?uid=${uid}`);
        commit('SAVE_LIST_OF_BLOCKED', response.data);
        commit('LOCAL_LOADING_OFF');
        return (response.data);
      } catch (error) {
        commit('LOCAL_LOADING_OFF');
        dispatch('temporaryFlag', { message: 'Error thinking about the people you don\'t wanna see', type: 'negative' });
        /* */
        if (error.response.status === 400)
          dispatch('temporaryFlag', { message: 'Bad Request', type: 'negative' });
        else if (error.response.status === 403)
          dispatch('temporaryFlag', { message: 'Unauthorized action', type: 'negative' });
        else if (error.response.status === 404)
          dispatch('temporaryFlag', { message: 'User not found', type: 'negative' });
        else if (error.response.status === 500)
          dispatch('temporaryFlag', { message: 'Internal Server Error', type: 'negative' });
        /* */
      }
    },
    async getDisplays ({ dispatch, commit, getters }) {
      const uid = parseInt(getters.userid);
      commit('LOCAL_LOADING_ON');
      try {
        const response = await callAPI.get(`/matcher/displays?uid=${uid}`);
        commit('REINIT_LISTS_OF_DISPLAY');
        commit('SAVE_LIST_OF_VIEWED', response.data.viewed);
        commit('SAVE_LIST_OF_VIEWED_BY', response.data.viewedBy);
        commit('LOCAL_LOADING_OFF');
        return ({
          viewed: getters.viewed,
          viewedFull: getters.viewedFull,
          viewedBy: getters.viewedBy,
          viewedByFull: getters.viewedByFull
        });
      } catch (error) {
        commit('LOCAL_LOADING_OFF');
        dispatch('temporaryFlag', { message: 'Error loading stalkers', type: 'negative' });
        /* */
        if (error.response.status === 400)
          dispatch('temporaryFlag', { message: 'Bad Request', type: 'negative' });
        else if (error.response.status === 403)
          dispatch('temporaryFlag', { message: 'Unauthorized action', type: 'negative' });
        else if (error.response.status === 404)
          dispatch('temporaryFlag', { message: 'User not found', type: 'negative' });
        else if (error.response.status === 500)
          dispatch('temporaryFlag', { message: 'Internal Server Error', type: 'negative' });
        /* */
      }
    },
  },
};
