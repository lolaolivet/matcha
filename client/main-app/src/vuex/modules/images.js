import { callAPI } from '../store-globals/callAPI';

export default {
  state: {
    images: [],
    loaded: false,
  },
  mutations: {
    SAVE_IMAGES (state, images) {
      state.images = images || [];
      state.loaded = true;
    },
    ADD_IMAGE (state, image) {
      state.images = [ ...state.images, image ];
    },
    SET_MAIN (state, imageId) {
      state.images.map(i => { i.isMain = (i.id === imageId); });
    },
    CLEAR_IMAGE (state) {
      state.images = [];
      state.loaded = false;
    }
  },
  getters: {
    imageSources (state) {
      return state.images.map(i => i.url);
    },
    noProfileImage (state) {
      return state.images.length === 0;
    },
    mainImageSource (state) {
      if (state.images.length === 0) {
        return ('');
      }
      return state.images.filter((i) => i.isMain)[0].url;
    },
    notMainImageSource (state) {
      if (state.images.length === 0) {
        return ([]);
      }
      return state.images.filter((i) => !i.isMain).map(i => i.url);
    },
    profileImagesLoading (state) {
      return (!state.loaded);
    }
  },
  actions: {
    async fetchImages ({ getters, commit, dispatch }) {
      commit('LOCAL_LOADING_ON');
      try {
        const userid = getters.userid;
        const response = await callAPI.get('/users/' + userid + '/img');
        const images = response.data.sort((a, b) => a.dateAdded - b.dateAdded);
        commit('LOCAL_LOADING_OFF');
        commit('SAVE_IMAGES', images);
        return (getters.imageSources);
      } catch (error) {
        commit('LOCAL_LOADING_OFF');
        dispatch('temporaryFlag', { message: 'Error fetching profile images', type: 'negative' });
        throw new Error('fetch image error');
      }
    },
    async sendImages ({ getters, commit, dispatch }, imageFiles) {
      const createImageForm = (files) => {
        // Create a multipart form
        var form = new FormData();
        for (let i in files) {
          let file = files[i];
          // NB: server expects all images to be labeled "image"
          form.append('image', file);
        }
        return (form);
      };

      commit('LOCAL_LOADING_ON');
      try {
        const userid = getters.userid;
        const res = await callAPI.post('/users/' + userid + '/img', createImageForm(imageFiles));
        commit('SAVE_IMAGES', res.data);
        commit('LOCAL_LOADING_OFF');
        return (getters.imageSources);
      } catch (error) {
        commit('LOCAL_LOADING_OFF');
        if (error.response.status) {
          dispatch('temporaryFlag', { message: 'File is too heavy', type: 'negative' });
        } else {
          dispatch('temporaryFlag', { message: 'Error saving profile images', type: 'negative' });
        }
        throw new Error('fetch image error');
      }
    },
    async deleteImage ({ state, getters, dispatch, commit }, url) {
      try {
        const userid = getters.userid;
        const image = state.images.filter(i => i.url === url)[0];
        const payload = { ids: [image.id] };
        await callAPI.delete('/users/' + userid + '/img', { data: payload });
        const remain = state.images.filter(i => i.url !== url);
        commit('SAVE_IMAGES', remain);
        return (true);
      } catch (error) {
        dispatch('temporaryFlag', { message: 'Could not delete image', type: 'negative' });
        return (false);
      }
    },
    async imageChooseMain ({ state, getters, dispatch, commit }, url) {
      try {
        const userid = getters.userid;
        const image = state.images.filter(i => i.url === url)[0];
        const payload = { imageId: image.id, ownerId: userid };
        await callAPI.put('/users/' + userid + '/img', payload);
        commit('SET_MAIN', image.id);
        return (true);
      } catch (error) {
        dispatch('temporaryFlag', { message: 'Could not set main image', type: 'negative' });
        return (false);
      }
    },
  }
};
