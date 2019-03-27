<template>
  <div class='close-button' @click="$emit('close')"></div>
</template>

<script>
  export default {};
</script>

<style scoped>
  .close-button {
    padding: .4em;
    width: .8em;
    height: .8em;
    background-color:rgba(0,0,0,.1);
    background-image: var(--cross-image);
    background-repeat: no-repeat;
    background-size: contain;
    cursor: pointer;
    border-radius: 5em;
  }
</style>