import { callAPI } from '../store-globals/callAPI';

export default {
  state: {
    ageRange: [],
    distMax: 50,
    scoreRange: [],
    lookfor: {
      female: true,
      male: true,
      other: true,
    }
  },
  mutations: {
    SAVE_PREFERENCES (state, db) {
      state.ageRange = [db['age_min'], db['age_max']];
      state.scoreRange = [db['score_min'], db['score_max']];
      state.distMax = db['distance_max'];
      state.lookfor = {
        female: db['looking_for_female'],
        male: db['looking_for_male'],
        other: db['looking_for_other'],
      };
    },
    CLEAR_PREFERENCES (state) {
      state.ageRange = [18, 80];
      state.distMax = 10;
      state.lookfor = {
        female: true,
        male: true,
        other: true,
      };
    },
  },
  actions: {
    async updatePrefs ({ state, commit }, prefs) {
      if (!prefs) {
        throw new Error('Missing Argument');
      }

      function ageRangeChanged (currVal, newVal) {
        return (
          newVal &&
          (
            newVal[0] !== currVal[0] ||
            newVal[1] !== currVal[1]
          )
        );
      }

      function scoreRangeChanged (currVal, newVal) {
        return (
          newVal &&
          (
            newVal[0] !== currVal[0] ||
            newVal[1] !== currVal[1]
          )
        );
      }

      function distMaxChanged (currVal, newVal) {
        return (
          newVal !== undefined &&
          newVal !== currVal
        );
      }

      function lookforChanged (currVal, newVal) {
        return (
          newVal &&
            (
              newVal.female !== currVal.female ||
              newVal.male !== currVal.male ||
              newVal.other !== currVal.other
            )
        );
      }

      function statePrefsChanged (state, prefs) {
        // Is there a difference between the state and prefs
        return (
          // ageRange is defined and has changed
          ageRangeChanged(state.ageRange, prefs.ageRange) ||
          // distMax is defined and has changed
          distMaxChanged(state.distMax, prefs.distMax) ||
          // scoreRange is defined and has changed
          scoreRangeChanged(state.scoreRange, prefs.scoreRange) ||
          // lookfor is defined and has changed
          lookforChanged(state.lookfor, prefs.lookfor)
        );
      }

      // If the proposed prefs are difference from the state, send to server
      if (statePrefsChanged(state, prefs)) {
        /**
         * Server expects
         * {
         *   'looking_for_male': bool,
         *   'looking_for_female': bool,
         *   'looking_for_other': bool,
         *   'score_min': num,
         *   'age_max': num,
         *   'distance_max': num,
         * }
         */
        const body = {
          'looking_for_male': prefs.lookfor.male,
          'looking_for_female': prefs.lookfor.female,
          'looking_for_other': prefs.lookfor.other,
          'age_min': prefs.ageRange[0],
          'age_max': prefs.ageRange[1],
          'score_min': prefs.scoreRange[0],
          'score_max': prefs.scoreRange[1],
          'distance_max': prefs.distMax
        };
        const userid = localStorage.getItem('userid');
        const res = (await callAPI.put(`/matcher/preferences?uid=${userid}`, body));
        const updatedValues = res.data.preferences;
        commit('SAVE_PREFERENCES', updatedValues);
      }
    },

    async getPreferences ({ commit, dispatch }) {
      let userid = localStorage.getItem('userid');
      try {
        let res = await callAPI.get(`/matcher/preferences?uid=${userid}`);
        commit('SAVE_PREFERENCES', res.data);
        return ({ ...res.data });
      } catch (err) {
        dispatch('temporaryFlag', { message: 'Network error' });
      }
    },
  }
};
