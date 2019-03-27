<template>
  <svg width="25" height="25" viewbox="0 0 25 25">
    <path id="loader" ref="loader" transform="translate(12.5, 12.5)"/>
  </svg>
</template>

<style scoped >
  svg {
    display: block;
  }
  #loader {
    fill: var(--pie-timer-color);
  }
</style>

<script>
  /**
   *  Function that counts advancement time between frames and
   *  calls an update function
   */
  const createTimerAnimator = (saveRequestId, doneFn, updateFn, totalTime) =>
    (animator, lastTime = Date.now(), perc = 0) =>
      () => {
        saveRequestId(null);

        // When is now ?
        const currentTime = Date.now();

        // Change the advancement value according to the time elapsed between frames
        perc += (currentTime - lastTime) * 100 / totalTime;

        // Ask for new frame unless done
        if (perc < 100) {
          // Update the loader's state
          updateFn(perc);
          // Request next animation with updated values
          const requestId = requestAnimationFrame(animator(animator, currentTime, perc));
          saveRequestId(requestId);
        } else {
          updateFn(100);
          doneFn();
        }
      };

  export default {
    data: function () {
      return ({
        percentage: 0,
        requestId: null
      });
    },
    props: {
      duration: {
        type: [Number],
        required: true,
        default: 5000 // Arbitrarily 5 seconds
      },
      forever: {
        type: [Boolean],
        required: false,
        default: false
      },
      restart: [Number],
    },
    mounted () {
      this.animator = createTimerAnimator(this.saveRequestId, this.done, this.updateLoader, this.duration);
      this.restartAnimation();
    },
    destroyed () {
      this.cancelAnimationFrame();
    },
    watch: {
      restart () {
        this.cancelAnimationFrame();
        this.animator = createTimerAnimator(this.saveRequestId, this.done, this.updateLoader, this.duration);
        this.restartAnimation();
      },
    },
    methods: {
      saveRequestId (value) {
        this.requestId = value;
      },
      cancelAnimationFrame () {
        if (this.requestId) {
          cancelAnimationFrame(this.requestId);
        }
      },
      /**
       *  Function that handles the loader's appearance
       *  according to a percentage (0 -> 100)
       */
      updateLoader (percentage) {
        // Select the loader
        const loader = this.$refs.loader;
        // transform percentage into an angle
        const alpha = percentage >= 100 ? 359 : percentage * 360 / 100;

        // Compute new values for the loader's appearance
        const r = (alpha * Math.PI / 180);
        const x = Math.sin(r) * 12.5;
        const y = Math.cos(r) * -12.5;
        const mid = (alpha > 180) ? 1 : 0;

        // Update the loader
        const state = `M 0 0 v -12.5 A 12.5 12.5 1 ${mid} 1 ${x} ${y} z`;
        if (loader) loader.setAttribute('d', state);
      },
      done () {
        this.$emit('done');
        if (this.forever) {
          this.percentage = 0;
        }
      },
      restartAnimation () {
        this.animator(this.animator)();
      },
    }
  };
</script>
