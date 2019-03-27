<template lang="html">
  <div class="not-found">
    <div class="not-found__content">
      <h1 class='global__title'>404</h1>
      <br>
      <h2 class='global__title'>The page you are trying to access does not exist</h2>
    </div>
  </div>
</template>

<script>
export default {
};
</script>

<style lang="css">
  .not-found {
    min-height: 200px;
    position: relative;
    margin: auto;
  }
  .not-found__content {
    max-width: 300px;
    width: 80%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -40%);
    /* background: white; */
    padding: 20px;
    font-size: 1em;
  }
  .not-found .global__title {
    color: white;
    text-align: center;
    font-family: Stellar, Helvetica, sans-serif;
  }
  .not-found h2.global__title {
    font-size: 1.2em;
  }
</style>
