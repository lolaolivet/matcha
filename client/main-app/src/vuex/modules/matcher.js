import { callAPI } from '../store-globals/callAPI.js';

export default {
  state: {
    suggestions: [],
    matcher: [],
  },
  getters: {
    suggestions (state) {
      return (state.suggestions);
    },
    suggestionsAlmostEmpty (state) {
      return (state.suggestions.length <= 2);
    },
    matcher (state) {
      return (state.matcher);
    },
  },
  mutations: {
    SAVE_MATCHER (state, suggestions) {
      state.matcher = state.matcher.concat(suggestions);
    },
    SAVE_SUGGESTIONS (state, suggestions) {
      state.suggestions = state.suggestions.concat(suggestions);
    },
    NEXT_SUGGESTION (state) {
      state.suggestions.splice(0, 1);
    },
    CLEAR_SUGGESTIONS (state) {
      state.suggestions = [];
    },
    CLEAR_MATCHER (state) {
      state.matcher = [];
    },
    REMOVE_FROM_SUGGESTIONS (state, userid) {
      const list = state.suggestions;
      var filtered = list.filter(function (value) {
        return parseInt(value.userid) !== parseInt(userid);
      });
      state.suggestions = filtered;
    },
    REMOVE_FROM_MATCHER (state, userid) {
      const list = state.matcher;
      var filtered = list.filter(function (value) {
        return parseInt(value.userid) !== parseInt(userid);
      });
      state.matcher = filtered;
    },
  },
  actions: {
    async reloadSuggestions ({ dispatch, commit }) {
      commit('CLEAR_SUGGESTIONS');
      commit('CLEAR_MATCHER');
      await dispatch('loadSuggestions');
      await dispatch('loadMatcherSuggestions');
    },
    loadMatcherSuggestions ({ dispatch }) {
      const options = {
        nbr: '30',
        score: true,
        age: true,
        dist: true,
        like: false,
        view: false,
        matcher: true,
      };
      return (dispatch('loadSuggestions', options));
    },
    async loadSuggestions ({ dispatch, commit, state }, options = {}) {
      options = {
        nbr: '30',
        score: true,
        age: true,
        dist: true,
        like: true,
        view: true,
        matcher: false,
        ...options
      };

      const uid = parseInt(this.getters.userid);
      if (!uid) {
        return [];
      }

      const url = `/matcher/suggestions?uid=${uid}&n=${options.nbr}&filterView=${!!options.view}&filterLike=${!!options.like}&filterDist=${!!options.dist}&filterAge=${!!options.age}&filterScore=${!!options.score}&except=[${options.matcher ? state.matcher.map(s => s.userid) : state.suggestions.map(s => s.userid)}]`;
      try {
        commit('LOCAL_LOADING_ON');
        const response = await callAPI.get(url);
        const listOfSuggestions = response.data;
        if (options.matcher) {
          commit('SAVE_MATCHER', listOfSuggestions);
        } else {
          commit('SAVE_SUGGESTIONS', listOfSuggestions);
        }
        commit('LOCAL_LOADING_OFF');
        return (listOfSuggestions);
      } catch (error) {
        commit('LOCAL_LOADING_OFF');
        if (error.response === undefined || error.response.status === 500) {
          dispatch('temporaryFlag', { message: 'Internal Server Error', type: 'negative' });
        } else if (error.response.status === 400)
          dispatch('temporaryFlag', { message: 'Bad Request', type: 'negative' });
        else if (error.response.status === 403)
          dispatch('temporaryFlag', { message: 'Unauthorized action', type: 'negative' });
        else if (error.response.status === 404)
          dispatch('temporaryFlag', { message: 'User not found', type: 'negative' });
        return [];
      }
    },
    async like ({ dispatch, commit }, receiverID) {
      const uid = parseInt(this.getters.userid);
      var creds = {
        sender: uid,
        receiver: receiverID
      };
      commit('LOCAL_LOADING_ON');
      try {
        const response = await callAPI.post('/matcher/like', creds);
        if (response.status === 200) {
          dispatch('temporaryFlag', { message: 'It\'s a match ! 💖', type: 'positive' });
          await dispatch('getMatches');
        }
        await dispatch('getLikes');
        commit('LOCAL_LOADING_OFF');
        return response;
      } catch (error) {
        commit('LOCAL_LOADING_OFF');
        if (error.response === undefined || error.response.status === 500)
          dispatch('temporaryFlag', { message: 'Internal Server Error', type: 'negative' });
        else if (error.response.status === 400) {
          dispatch('temporaryFlag', { message: 'Bad Request', type: 'negative' });
          if (error.response.data.code === 4002)
            dispatch('temporaryFlag', { message: 'Cannot like self', type: 'negative' });
        } else if (error.response.status === 403)
          dispatch('temporaryFlag', { message: 'Unauthorized action', type: 'negative' });
        else if (error.response.status === 404)
          dispatch('temporaryFlag', { message: 'User not found', type: 'negative' });
      }
    },
    async unlike ({ dispatch, commit }, receiverID) {
      const uid = parseInt(this.getters.userid);
      var creds = {
        sender: uid,
        receiver: receiverID
      };
      commit('LOCAL_LOADING_ON');
      try {
        const response = await callAPI.put('/matcher/unlike', creds);
        await dispatch('getAllStats');
        commit('LOCAL_LOADING_OFF');
        return response;
      } catch (error) {
        commit('LOCAL_LOADING_OFF');
        if (error.response === undefined || error.response.status === 500)
          dispatch('temporaryFlag', { message: 'Internal Server Error', type: 'negative' });
        else if (error.response.status === 400) {
          dispatch('temporaryFlag', { message: 'Bad Request', type: 'negative' });
          if (error.response.data.code === 4001)
            dispatch('temporaryFlag', { message: 'Missing Id', type: 'negative' });
          if (error.response.data.code === 4002)
            dispatch('temporaryFlag', { message: 'Cannot unlike self', type: 'negative' });
          if (error.response.data.code === 4003)
            dispatch('temporaryFlag', { message: 'Cannot unlike someone you never liked or already unliked', type: 'negative' });
        } else if (error.response.status === 403)
          dispatch('temporaryFlag', { message: 'Unauthorized action', type: 'negative' });
        else if (error.response.status === 404) {
          if (error.response.data.code === 4041 ||
            error.response.data.code === 4042 ||
            error.response.data.code === 4043)
            dispatch('temporaryFlag', { message: 'Fake User', type: 'negative' }); // a revoir pour plus de precision ?
          else
            dispatch('temporaryFlag', { message: 'User not found', type: 'negative' });
        }
      }
    },
    async block ({ dispatch, commit }, receiverID) {
      const uid = parseInt(this.getters.userid);
      var creds = {
        uid: uid,
        blocked_uid: receiverID
      };
      commit('LOCAL_LOADING_ON');
      try {
        const response = await callAPI.post('/matcher/block', creds);
        await dispatch('getAllStats');
        commit('REMOVE_FROM_SUGGESTIONS', receiverID);
        commit('REMOVE_FROM_MATCHER', receiverID);
        commit('LOCAL_LOADING_OFF');
        return response;
      } catch (error) {
        commit('LOCAL_LOADING_OFF');
        if (error.response === undefined || error.response.status === 500) {
          dispatch('temporaryFlag', { message: 'Internal Server Error', type: 'negative' });
        } else if (error.response.status === 400) {
          if (error.response.data.code === 4009)
            dispatch('temporaryFlag', { message: 'Cannot block a currently blocked person', type: 'negative' });
          else
            dispatch('temporaryFlag', { message: 'Bad Request', type: 'negative' }); // Cannot block self (neat isn\'t it ?)
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
    async unblock ({ dispatch, commit }, receiverID) {
      const uid = parseInt(this.getters.userid);
      var creds = {
        uid: uid,
        unblock_uid: receiverID
      };
      commit('LOCAL_LOADING_ON');
      try {
        const response = await callAPI.put('/matcher/unblock', creds);
        await dispatch('getAllStats');
        commit('LOCAL_LOADING_OFF');
        return response;
      } catch (error) {
        commit('LOCAL_LOADING_OFF');
        if (error.response === undefined || error.response.status === 500)
          dispatch('temporaryFlag', { message: 'Internal Server Error', type: 'negative' });
        else if (error.response.status === 400) {
          if (error.response.data.code === 4003)
            dispatch('temporaryFlag', { message: 'Cannot unblock a person you didn\'t block or already unblocked', type: 'negative' });
          else
            dispatch('temporaryFlag', { message: 'Bad Request', type: 'negative' });
        } else if (error.response.status === 403)
          dispatch('temporaryFlag', { message: 'Unauthorized action', type: 'negative' });
        else if (error.response.status === 404) {
          dispatch('temporaryFlag', { message: 'User not found', type: 'negative' });
          if (error.response.data.code === 4041 ||
            error.response.data.code === 4042 ||
            error.response.data.code === 4043)
            dispatch('temporaryFlag', { message: 'Fake User' }); // a revoir pour plus de preci, type: 'negative'
        }
      }
    },
    async logProfileDisplay ({ dispatch, commit }, { viewedUid, full }) {
      const uid = parseInt(this.getters.userid);
      const creds = {
        uid,
        viewedUid,
        full
      };
      commit('LOCAL_LOADING_ON');
      try {
        await callAPI.post('/matcher/display', creds);
        await dispatch('getAllStats');
        commit('LOCAL_LOADING_OFF');
      } catch (error) {
        commit('LOCAL_LOADING_OFF');
        if (error.response === undefined || error.response.status === 500)
          dispatch('temporaryFlag', { message: 'Internal Server Error', type: 'negative' });
        else if (error.response.status === 400)
          dispatch('temporaryFlag', { message: 'Bad Request', type: 'negative' });
        else if (error.response.status === 401)
          dispatch('temporaryFlag', { message: 'Forbidden', type: 'negative' });
        else if (error.response.status === 404)
          dispatch('temporaryFlag', { message: 'User not found', type: 'negative' });
      }
    },
    async getPopularityScore ({ dispatch, getters }, uid) {
      // If no uid specified
      if (uid === undefined) {
        // uid is the current user's uid
        uid = getters.userid;
      }
      try {
        const score = await callAPI.get(`/matcher/score?uid=${uid}`);
        return score.data;
      } catch (error) {
        if (error.response === undefined || error.response.status === 500)
          dispatch('temporaryFlag', { message: 'Internal Server Error', type: 'negative' });
        else if (error.response.status === 400)
          dispatch('temporaryFlag', { message: 'Bad Request', type: 'negative' });
        else if (error.response.status === 404)
          dispatch('temporaryFlag', { message: 'User not found', type: 'negative' });
      }
    },
  },
};
