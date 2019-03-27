<template>
  <div id='setup'>
    <spin-loader></spin-loader>
    <p>
      Setting up the app
    </p>
  </div>
</template>

<script>
  import Loader from '@/components/Loader';

  export default {
    components: {
      'spin-loader': Loader,
    },
  };
</script>

<style scoped>
  #setup {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100vh;
    position: relative;
    font-weight: bold;
    user-select: none;
  }
</style>