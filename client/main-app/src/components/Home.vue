<template>
<div class='home-container'>
  <h1>❤️ 🤷 🔪</h1>
</div>
</template>

<script>
export default {
  name: 'home',
};
</script>

<style scoped >
  .home-container {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    /* justify-content: center; */
    align-items: center;
    flex-direction: column;
    font-size: 5rem;
  }
  .home-container h1 {
    color: var(--text-color);
    position: relative;
    top: -5%;
  }
</style>
