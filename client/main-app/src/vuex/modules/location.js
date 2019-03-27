import { callAPI } from '../store-globals/callAPI';

export default {
  state: {
    location: JSON.parse(sessionStorage.getItem('location')),
  },
  getters: {
    location (state) {
      return (state.location);
    },
  },
  mutations: {
    SAVE_LOCATION (state, location) {
      state.location = location;
      sessionStorage.setItem('location', JSON.stringify(location));
    },
  },
  actions: {
    async getIPLocation ({ dispatch }) {
      try {
        const response = await callAPI.get('/location');
        return (response);
      } catch (error) {
        if (error.response === undefined || error.response.status === 500)
          dispatch('temporaryFlag', { message: 'Internal Server Error', type: 'negative' });
      }
    },
    saveLocation ({ commit }, location = {}) {
      commit('SAVE_LOCATION', location);
    },
    // Post location log if location is accepted
    async postLocationLog ({ commit, dispatch }, creds) {
      try {
        commit('LOCAL_LOADING_ON');
        await callAPI.post('/location', creds);
        dispatch('temporaryFlag', { message: 'Your new location has been saved', type: 'positive' });
        commit('LOCAL_LOADING_OFF');
        return dispatch('reloadSuggestions');
      } catch (error) {
        commit('LOCAL_LOADING_OFF');
        if (error.response === undefined || error.response.data.code === 500)
          dispatch('temporaryFlag', { message: 'Internal Server Error', type: 'negative' });
        else if (error.response.status === 400) {
          dispatch('temporaryFlag', { message: 'Bad Request', type: 'negative' });
          if (error.response.data.code === 401)
            dispatch('temporaryFlag', { message: 'Error with the geolocation', type: 'negative' });
        } else if (error.response.status === 404) {
          if (error.response.data.code === 4041)
            dispatch('temporaryFlag', { message: 'User Not Found', type: 'negative' });
        }
      }
    },
  },
};
