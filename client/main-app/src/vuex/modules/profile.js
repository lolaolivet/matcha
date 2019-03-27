import { callAPI } from '../store-globals/callAPI';

const incomplete = (profile) => {
  const empty = Object.keys(profile).length === 0;
  if (empty) {
    return (true);
  }
  const noFirstName = !profile.firstname;
  const noLastName = !profile.lastname;
  const emptyBio = !profile.bio;
  return (noFirstName || noLastName || emptyBio);
};

const profile = {
  state: {
    loaded: false,
    incomplete: true,
    profile: {},
    profileSummary: {},
    // Profile pop up
    profileWindowId: null,
    showProfileWindow: false,
  },
  getters: {
    firstname (state) { return (state.profile.firstname); },
    profileEmpty (state) {
      return (Object.keys(state.profile).length === 0);
    },
    profileSummaryEmpty (state) {
      return (Object.keys(state.profileSummary).length === 0);
    },
    getProfileSummary (state) {
      return (state.profileSummary);
    },
    profileLoading (state) {
      return (!state.loaded);
    },
    showProfileWindow (state) {
      return (state.showProfileWindow);
    },
  },
  mutations: {
    SAVE_PROFILE (state, data) {
      state.profile = data;
      state.incomplete = incomplete(data);
      state.loaded = true;
    },
    SAVE_PROFILE_SUMMARY (state, data) {
      state.profileSummary = data;
    },
    CLEAR_PROFILE (state) {
      state.loaded = false;
      state.profile = {};
      state.profileSummary = {};
    },
    // Profile window
    SET_PROFILE_WINDOW_ID (state, userid) {
      state.profileWindowId = parseInt(userid);
    },
    SHOW_PROFILE_WINDOW (state) {
      state.showProfileWindow = true;
    },
    HIDE_PROFILE_WINDOW (state) {
      state.showProfileWindow = false;
    },
  },
  actions: {
    async getProfileSummary ({ dispatch, state, commit, getters }, uid) {
      // If no uid specified
      if (uid === undefined) {
        // uid is the current user's uid
        uid = getters.userid;
      }

      // If uid is the current user's or profile already full
      if (uid === getters.userid && !getters.profileSummaryEmpty) {
        return (state.profileSummary);
      } else {
        try {
          const response = await callAPI.get(`/users/${uid}/profile-summary`);
          const profileSummary = { ...response.data };
          // If uid is the current user's
          if (uid === getters.userid) {
            // Save the profileSummary
            commit('SAVE_PROFILE_SUMMARY', profileSummary);
          }
          return (profileSummary);
        } catch (error) {
          dispatch('temporaryFlag', { message: 'Error fetching user profile', type: 'negative' });
        }
      }
    },
    async getProfileInfos ({ state, getters, commit }, uid, refresh) {
      // If no uid specified
      if (uid === undefined) {
        // uid is the current user's uid
        uid = getters.userid;
      }

      // If uid is the current user's or profile already full
      if (uid === getters.userid && !getters.profileEmpty && !refresh) {
        // Return the current profile
        return (state.profile);
      } else {
        const response = await callAPI.get(`/users/${uid}/profile`);
        const profile = { ...response.data };
        // If uid is the current user's
        if (uid === getters.userid) {
          // Save the profile'
          commit('SAVE_PROFILE', profile);
        }
        return (profile);
      }
    },
    // - Idea for a function
    // refreshProfile ({ dispatch, getters }) {
    //   return dispatch('getProfileInfos', getters.userid, true);
    // },
    showFullProfile ({ dispatch, commit, getters }, userid) {
      if (userid !== getters.userid) {
        dispatch('logProfileDisplay', { viewedUid: userid, full: true });
      }
      commit('SET_PROFILE_WINDOW_ID', userid);
      commit('SHOW_PROFILE_WINDOW');
    },
    hideFullProfile ({ commit }) {
      commit('HIDE_PROFILE_WINDOW');
    },
    async putProfileInfos ({ dispatch, commit, getters }, userInfos) {
      let uid = getters.userid;
      commit('LOCAL_LOADING_ON');
      try {
        const response = await callAPI.put(`/users/${uid}/profile`, userInfos);
        const profile = { ...response.data.profile };
        commit('SAVE_PROFILE', profile);
        dispatch('reloadSuggestions');
        commit('LOCAL_LOADING_OFF');
        dispatch('temporaryFlag', { message: 'Your profile has been updated', type: 'positive' });
        return (profile);
      } catch (error) {
        commit('LOCAL_LOADING_OFF');
        if (error.response === undefined)
          dispatch('temporaryFlag', { message: 'Network Error', type: 'negative' });
        else if (error.response.status === 400)
          dispatch('temporaryFlag', { message: 'Bad Request', type: 'negative' });
        else if (error.response.status === 404)
          dispatch('temporaryFlag', { message: 'User not Found', type: 'negative' });
        else if (error.response.status === 500)
          dispatch('temporaryFlag', { message: 'Internal Server Error', type: 'negative' });
      }
    },
    async deleteAccount ({ dispatch, commit, getters }, pwd) {
      let uid = getters.userid;
      commit('LOCAL_LOADING_ON');
      try {
        const creds = {
          password: pwd
        };
        await callAPI.post(`/delete-user?uid=${uid}`, creds);
        commit('LOCAL_LOADING_OFF');
        // if ok logout
        dispatch('logout');
      } catch (error) {
        commit('LOCAL_LOADING_OFF');
        if (error.response === undefined)
          dispatch('temporaryFlag', { message: 'Network Error', type: 'negative' });
        else if (error.response.status === 400) {
          if (error.response.data.code === 400)
            dispatch('temporaryFlag', { message: 'Bad Request', type: 'negative' });
          else if (error.response.data.code === 4001)
            dispatch('temporaryFlag', { message: 'Wrong password', type: 'negative' });
          else if (error.response.data.code === 4002)
            dispatch('temporaryFlag', { message: 'Password is not valid', type: 'negative' });
        } else if (error.response.status === 403)
          dispatch('temporaryFlag', { message: 'Mind your own business', type: 'negative' });
        else if (error.response.status === 404)
          dispatch('temporaryFlag', { message: 'User not Found', type: 'negative' });
        else if (error.response.status === 500)
          dispatch('temporaryFlag', { message: 'Internal Server Error', type: 'negative' });
      }
    }
  },
};

export default profile;
