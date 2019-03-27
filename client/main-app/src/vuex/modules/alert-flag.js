export default {
  state: {
    message: '',
    active: false,
    duration: undefined,
    timerOn: undefined,
    queu: [],
    quitFn: undefined,
    fullscreen: undefined,
  },
  mutations: {
    SET_FLAG (state, opts = {}) {
      state.message = opts.message;
      state.button = opts.button;
      state.duration = opts.duration;
      state.dismissFn = opts.dismissFn;
      state.type = opts.type;
      state.fullscreen = opts.fullscreen;
      if (opts.duration) state.timerOn = true;
    },
    SHOW_FLAG (state) {
      state.active = true;
    },
    CLOSE_CURRENT_FLAG (state) {
      if (state.active) {
        state.message = '';
        state.active = false;
        state.duration = undefined;
        state.timerOn = undefined;
        if (state.currentTimeout) {
          clearTimeout(state.currentTimeout);
          state.currentTimeout = undefined;
        }
        if (state.quitFn) {
          state.quitFn();
          state.quitFn = undefined;
        }
        // Next in queu
        if (state.queu.length) {
          const fn = state.queu.pop();
          fn();
        }
      }
    },
    ADD_TO_FLAG_QUEU (state, fn) {
      state.queu = [fn].concat(state.queu);
    },
  },
  actions: {
    showFlag ({ state, commit }, flagOptions) {
      const displayFlag = () => {
        commit('SET_FLAG', flagOptions);
        commit('SHOW_FLAG');
      };
      if (state.active) {
        commit('ADD_TO_FLAG_QUEU', displayFlag);
      } else {
        displayFlag();
      }
    },
    temporaryFlag ({ state, commit }, flagOptions) {
      const displayTemporaryFlag = () => {
        if (!flagOptions.duration) {
          flagOptions.duration = 5000;
        }
        commit('SET_FLAG', flagOptions);
        commit('SHOW_FLAG');
      };
      if (state.active) {
        commit('ADD_TO_FLAG_QUEU', displayTemporaryFlag);
      } else {
        displayTemporaryFlag();
      }
    },
    dismissFlag ({ state, commit }) {
      commit('CLOSE_CURRENT_FLAG');
    },
  },
};
