<template>
  <div>
    <div ref='container' class="container" :class="{ 'container--closed' : containerClosed }" :title="title">
      <div ref='im' class='im'></div>
      <div ref='veil' class="veil" :class="{ 'veil--closed': veilClosed }"></div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'img-loader',
    props: ['src', 'title', 'width', 'height'],
    data () {
      return ({
        phase: 1,
        charged: false,
        containerAnimTime: 200,
        veilAnimTime: 500,
        timeout: null,
      });
    },
    computed: {
      veilClosed () {
        return (this.charged && this.phase === 3);
      },
      containerClosed () {
        return (this.phase === 1);
      },
    },
    mounted () {
      const im = this.$refs.im;
      im.style.width = this.width;
      im.style.height = this.height;

      const veil = this.$refs.veil;
      veil.style.width = this.width;
      veil.style.height = this.height;
      veil.style.transition = `transform ${this.veilAnimTime}ms`;

      const container = this.$refs.container;
      container.style.width = this.width;
      container.style.height = this.height;
      container.style.transition = `transform ${this.containerAnimTime}ms`;
      this.animate(this.src);
    },
    watch: {
      src (newVal) {
        this.clearTimeout();
        this.animate(newVal);
      }
    },
    beforeDestroy () {
      if (this.timeout) {
        this.clearTimeout();
      }
    },
    methods: {
      clearTimeout () {
        clearTimeout(this.timeout);
      },
      reset () {
        this.phase = 1;
      },
      openContainer () {
        this.phase = 2;
      },
      openVeil () {
        this.phase = 3;
      },
      animate (src) {
        this.reset();
        this.timeout = setTimeout(
          () => {
            this.openContainer();
            this.timeout = setTimeout(
              this.loadImg(src),
              this.containerAnimTime
            );
          },
          this.containerAnimTime
        );
      },
      loadImg (src) {
        return (
          () => {
            var im = new Image();
            im.onload = () => {
              this.charged = true;
              this.$refs.im.style.backgroundImage = `url(${im.src})`;
              this.openVeil();
            };
            im.src = src;
          }
        );
      }
    },
  };
</script>

<style scoped>
  .container {
    max-width: 100%;
    position: relative;
    margin: auto;
    transform: scaleX(1);
    transform-origin: 0% 0%;
    border-radius: .3em;
    overflow: hidden;
  }
  .container.container--closed {
    transform: scaleX(0);
  }
  .veil {
    max-width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background: var(--accent-color);
    width: 100%;
    height: 100%;
    transform: scaleX(1);
    transform-origin: 100% 0%;
  }
  .veil.veil--closed {
    transform: scaleX(0);
  }
  .im {
    max-width: 100%;
    background-position: center;
    background-size: cover;
  }
</style>