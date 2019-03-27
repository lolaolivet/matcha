import { callAPI } from '../store-globals/callAPI.js';

export default {
  state: {
    message: [],
    like: [],
    match: [],
    view: [],
    unlike: [],
  },
  mutations: {
    SAVE_NOTIF (state, notif) {
      // Remove user doubles in same notif type
      for (let type in notif) {
        notif[type] = notif[type].reduce((acc, not) => {
          // If can't find notif from same user
          if (!acc.find((el) => el.sender === not.sender)) {
            // Keep the notif
            acc.push(not);
          }
          return acc;
        }, []);
      }
      state.message = notif.message;
      state.like = notif.like;
      state.match = notif.match;
      state.view = notif.view;
      state.unlike = notif.unlike;
    },
    ADD_NOTIF (state, data) {
      const type = data.type;
      const typeExists = state[type] !== undefined;
      const noDouble = !state[type].find((not) => parseInt(not.sender) === parseInt(data.sender));
      if (typeExists && noDouble) state[type].push(data);
    },
    RESET_NOTIF (state, type) {
      if (state[type] !== undefined) state[type] = [];
    },
    FILTER_FROM_NOTIF (state, type, sender) {
      const typeExists = state[type] !== undefined;
      if (typeExists) state[type] = state[type].filter((not) => {
        parseInt(not.sender) === parseInt(sender);
      });
    },
  },
  getters: {
    allNotifSums (state) {
      return ({
        message: state.message.length,
        like: state.like.length,
        match: state.match.length,
        view: state.view.length,
        unlike: state.unlike.length,
      });
    },
    notifSum (state) {
      return (
        parseInt(state.message.length) +
        parseInt(state.like.length) +
        parseInt(state.match.length) +
        parseInt(state.view.length) +
        parseInt(state.unlike.length)
      );
    },
  },
  actions: {
    filterFromNotif ({ commit }, type, sender) {
      commit('FILTER_FROM_NOTIF', type, sender);
    },
    eraseMessageNotif ({ commit, state }) {
      const notif = {
        ...state,
        message: [],
      };
      commit('SAVE_NOTIF', notif);
    },
    async getNotifications ({ commit }) {
      const res = await callAPI.get('/notif/all-seen');

      const notif = {
        message: [],
        like: [],
        unlike: [],
        view: [],
        match: [],
      };

      const addNotif = (storeNotifArray, serverNotif) => {
        storeNotifArray.push({
          ...serverNotif,
          type: serverNotif.notif,
        });
      };

      const data = res.data;
      for (let i = 0; i < data.length; i++) {
        const notifObject = data[i];
        const notifType = notifObject.notif;
        if (['message', 'like', 'unlike', 'view', 'match'].includes(notifType)) {
          addNotif(notif[notifType], notifObject);
        }
      }

      commit('SAVE_NOTIF', notif);
      return res.data;
    },
    async deleteNotifications ({ getters, commit }, type) {
      let creds = {
        userid: getters.userid,
        notif: type,
      };
      commit('RESET_NOTIF', type);
      await callAPI.put('/notif/all-seen', creds);
    },
    addNotif ({ commit }, data) {
      if (data) {
        commit('ADD_NOTIF', data);
      }
    }
  },
};
