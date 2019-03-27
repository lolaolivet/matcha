<template>
  <div class='confirm-page'>
    <transition name='fade-in'>
      <!-- Affiche ça après confirmation -->
      <div v-if="resStatus === '' && longWait">
        <h2>Confirming your email...</h2>
        <p>Please hold</p>
      </div>

      <!-- Affiche ça après confirmation -->
      <div v-else-if="resStatus === 204">
        <h2>Your email is confirmed</h2>
        <p>You can now <router-link :to="{ name: 'Login' }">log in</router-link></p>
      </div>

      <!-- Affiche ça en cas de 404 -->
      <div v-if="resStatus === 404">
        <h2>Invalid link</h2>
        <p>User not found</p>
      </div>

      <!-- Affiche ça en cas de 403 -->
      <div v-else-if="resStatus === 401">
        <h2>This link is not valid</h2>
        <p>Renew your confirmation link</p>
      </div>

      <!-- Affiche ça en cas de 500 -->
      <div v-else-if="resStatus === 500">
        <h2>Internal server error</h2>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'Confirm',
  data () {
    return {
      resStatus: null,
      longWait: false,
      uid: this.$route.query.uid,
      tid: this.$route.query.tid
    };
  },
  async mounted () {
    // Si l'attente est trop longue, longWait = true
    // pour afficher le message d'attente
    setTimeout(function () {
      if (this.resStatus === null) {
        this.longWait = true;
      }
    }, 500);
    this.$store.commit('LOCAL_LOADING_ON');
    if (!this.uid || !this.tid) {
      // reroute to Page Not Found
      this.$router.push('404');
      return;
    }
    let creds = {
      uid: this.uid,
      tid: this.tid
    };
    let res = await this.$store.dispatch('confirm', creds);
    this.resStatus = res.status;
    this.$store.commit('LOCAL_LOADING_OFF');
  }
};
</script>

<style lang="css">
  .confirm-page {
    color: white;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
