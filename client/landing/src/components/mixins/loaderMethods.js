export const loadingOnOff = {
  methods: {
    loadingOn () {
      this.$store.commit('LOADING_ON');
    },
    loadingOff () {
      this.$store.commit('LOADING_OFF');
    }
  }
};

export const localLoading = {
  methods: {
    localLoadingOn () {
      this.$store.commit('LOCAL_LOADING_ON');
    },
    localLoadingOff () {
      this.$store.commit('LOCAL_LOADING_OFF');
    }
  }
};
