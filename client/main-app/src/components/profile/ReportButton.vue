<template>
  <div>
    <button
      class="report__button"
      @click="pressReport"
    >
    Report!
    </button>
  </div>
</template>

<script>
  export default {
    props: {
      userid: {
        type: Number,
        required: true,
      }
    },
    methods: {
      pressReport () {
        this.$store.dispatch('showFlag', {
          type: 'positive',
          message: 'Are you sure you want to report this profile, you won\'t see it again.. NEVER EVER!',
          button: {
            message: 'Yes',
            fn: (done) => { this.report(); done(); return; },
          },
        });
      },
      async report () {
        await this.$store.dispatch('report', this.userid);
        this.$emit('report', this.userid);
      },
    },
  };
</script>

<style scoped>
  .report__button,
  .report__button:disabled,
  .report__button:disabled:hover {
    outline: none;
    cursor: pointer;
    border: 0;
    padding: 0;
    background-color: transparent;
    font-weight: bold;
    font-size: 0.8rem;
    color: var(--text-color);
  }
  .report__button:hover {
    color: red;
  }
  .report__button:focus {
    border-bottom: 2px solid var(--text-color);
  }

  .report__button:disabled,
  .report__button:disabled:hover {
    cursor: default;
    opacity: var(--op);
  }
</style>