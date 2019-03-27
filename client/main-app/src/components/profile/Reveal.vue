<template>
  <div>
    <div ref='container' class="container" :class="{ 'container--closed' : containerClosed }">
      <slot></slot>
      <div ref='veil' class="veil" :class="{ 'veil--closed': veilClosed }"></div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'ui-reveal',
    props: {
      'appearTime': {
        type: Number,
        required: true,
      },
      'revealTime': {
        type: Number,
        required: true,
      },
      'left': {
        type: Boolean,
        default: false
      },
      'trigger': {
        default: true
      }
    },
    data () {
      return ({
        phase: 1,
        charged: false,
        containerAnimTime: this.appearTime,
        veilAnimTime: this.revealTime,
      });
    },
    computed: {
      veilClosed () {
        return (this.phase === 3);
      },
      containerClosed () {
        return (this.phase === 1);
      }
    },
    watch: {
      trigger (newVal) {
        if (newVal) {
          this.open();
        }
      }
    },
    mounted () {
      this.$refs.veil.style.transition = `transform ${this.veilAnimTime}ms`;
      this.$refs.veil.style.transformOrigin = this.left ? '-1% -1%' : '101% -1%';
      this.$refs.container.style.transition = `transform ${this.containerAnimTime}ms`;
      if (this.trigger) {
        this.open();
      }
    },
    methods: {
      openContainer () {
        this.phase = 2;
      },
      openVeil () {
        this.phase = 3;
      },
      open () {
        this.openContainer();
        setTimeout(this.openVeil, this.containerAnimTime);
      },
    },
  };
</script>

<style scoped>
  .container {
    position: relative;
    margin: auto;
    transform: scale(1, 1);
    transform-origin: 0% 0%;
  }
  .container.container--closed {
    transform: scale(0, 1);
  }
  .veil {
    position: absolute;
    top: 0;
    left: 0;
    background: var(--accent-color);
    width: 100%;
    height: 100%;
    transform: scale(1.02, 1.02);
    transform-origin: -1% -1%;
  }
  .veil.veil--closed {
    transform: scale(0, 1.02);
  }
</style>