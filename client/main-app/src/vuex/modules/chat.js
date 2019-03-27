import { callAPI } from '../store-globals/callAPI.js';

export default {
  actions: {
    async getFullChatConversation ({ dispatch, commit }, otherId) {
      let uid1 = this.getters.userid;
      var conversation;
      commit('LOCAL_LOADING_ON');
      try {
        const response = await callAPI.get(`/messenger/conversation?uid1=${uid1}&uid2=${otherId}`);
        conversation = response.data;
        commit('LOCAL_LOADING_OFF');
        return (conversation);
      } catch (error) {
        commit('LOCAL_LOADING_OFF');
        dispatch('temporaryFlag', { message: 'Error, Could not get conversation', type: 'negative' });
        if (error.response.status === 400) {
          dispatch('temporaryFlag', { message: 'Bad Request', type: 'negative' });
          if (error.response.data.code === 4002)
            dispatch('temporaryFlag', { message: 'You can only speak to your matches', type: 'negative' });
        } else if (error.response.status === 403)
          dispatch('temporaryFlag', { message: 'Unauthorized action', type: 'negative' });
        else if (error.response.status === 404)
          dispatch('temporaryFlag', { message: 'User not found', type: 'negative' });
        else if (error.response.status === 500)
          dispatch('temporaryFlag', { message: 'Internal Server Error', type: 'negative' });
      }
    },
    async setConvSeen ({ dispatch, commit }, msg) {
      commit('LOCAL_LOADING_ON');
      try {
        const seen = {
          'msgId': msg.id,
          'receiverId': msg.to,
        };
        await callAPI.put('/messenger/message-seen', seen);
        // no response ?
        commit('LOCAL_LOADING_OFF');
      } catch (error) {
        commit('LOCAL_LOADING_OFF');
        dispatch('temporaryFlag', { message: 'Error, Could not update message notification', type: 'negative' });
        // */
        if (error.response.status === 400)
          dispatch('temporaryFlag', { message: 'Bad Request', type: 'negative' });
        else if (error.response.status === 401)
          dispatch('temporaryFlag', { message: 'Forbidden', type: 'negative' });
        else if (error.response.status === 404)
          dispatch('temporaryFlag', { message: 'User not found', type: 'negative' });
        // */
      }
    },
    async getLastMessages ({ dispatch, commit }) {
      let uid = this.getters.userid;
      try {
        const response = await callAPI.get(`/messenger/last-messages?uid=${uid}`);
        return response.data;
      } catch (error) {
        if (error.response.status === 400)
          dispatch('temporaryFlag', { message: 'Bad Request', type: 'negative' });
        else if (error.response.status === 401)
          dispatch('temporaryFlag', { message: 'Forbidden', type: 'negative' });
        else if (error.response.status === 404)
          dispatch('temporaryFlag', { message: 'User not found', type: 'negative' });
        // */
      }
    },
  },
};
