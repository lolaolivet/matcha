<template>
  <div class='window'>
    <h1>Set your P.A.W.</h1>
    <h4>NB : You can only see people<br>that are in the same #place as you</h4>
    <set-paw></set-paw>
  </div>
</template>

<script>
  import SetPawVue from './SetPaw.vue';
  export default {
    components: {
      'set-paw': SetPawVue
    }
  };
</script>

<style scoped>
h1 {
  margin-bottom: .5em;
}
h4 {
  margin-bottom: 3em;
  line-height: 1.2em;
}
</style>