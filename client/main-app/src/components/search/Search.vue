<template>
  <div>

  </div>
</template>

<script>
  import ProfileList from '@/components/stats/ProfileList';

  export default {
    components: [ProfileList],
    methods: {
      async loadSuggestions () {
        // load new profiles if no more in queue state.suggestion
        await this.$store.dispatch('loadSuggestions');
      },
    },
  };
</script>

<style scoped>
</style>