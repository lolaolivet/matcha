import $cookies from 'js-cookie';

const uiMode = {
  state: {
    isLight: ($cookies.get('dm') !== 'true'),
    isSoft: false
  },
  getters: {
    isLightMode (state) {
      return (state.isLight);
    },
  },
  mutations: {
    SWITCH_MODE (state, isLight) {
      state.isLight = isLight;
      $cookies.set('dm', !isLight);
    },
    SWITCH_SOFT (state) {
      state.isSoft = !state.isSoft;
    },
  },
  actions: {
    switchUiMode ({ commit, dispatch }, isLight) {
      commit('SWITCH_MODE', isLight);
      dispatch('applyUiMode');
    },
    applyUiMode ({ state }) {
      if (state.isLight) {
        document.body.classList.remove('dark');
        document.body.classList.add('light');
      } else {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
      }
    },
    //
    switchSoft ({ commit, dispatch }) {
      commit('SWITCH_SOFT');
      dispatch('applySoft');
    },
    applySoft ({ state }) {
      if (state.isSoft) {
        document.body.classList.add('soft');
      } else {
        document.body.classList.remove('soft');
      }
    },
  }
};

export default uiMode;
