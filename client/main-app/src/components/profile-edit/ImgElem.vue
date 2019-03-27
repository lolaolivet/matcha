<template>
  <div @click='fireEvent'>
    <div ref='container' class="container" :class="{ 'container--disabled': disabled, 'container--locked': locked }" :title="title">
      <div ref='im' class='im'>
        <div class="trash"></div>
      </div>
      <div ref='veil' class="veil" :class="{ 'veil--closed': closed, 'veil--charging': charging }">
        <div class="plus"></div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'img-elem',
    props: ['src', 'title', 'width', 'height', 'disabled', 'locked'],
    data () {
      return ({
        closed: true,
        charging: false,
      });
    },
    mounted () {
      const container = this.$refs.container;
      container.style.width = this.width;
      container.style.height = this.height;
      if (this.src) {
        this.loadImg(this.src)();
      }
    },
    watch: {
      src (newVal) {
        if (!newVal) this.reset();
        else this.loadImg(newVal)();
      }
    },
    methods: {
      reset () {
        this.closed = true;
        this.charging = false;
      },
      openVeil () {
        this.closed = false;
      },
      loadImg (src) {
        this.reset();
        this.charging = true;
        return (
          () => {
            var im = new Image();
            im.onload = () => {
              this.$refs.im.style.backgroundImage = `url(${im.src})`;
              this.charging = false;
              this.openVeil();
            };
            im.src = src;
          }
        );
      },
      fireEvent (e) {
        if (this.locked || this.disabled) {
          return;
        }

        if (this.closed && !this.charging) {
          this.$emit('add', e);
        } else if (!this.charging) {
          this.$emit('remove', e);
        }
      }
    },
  };
</script>

<style scoped>
  .container {
    position: relative;
    margin: auto;
    border-radius: 100%;
    overflow: hidden;
    cursor: pointer;
  }
  .container.container--disabled {
    opacity: .5;
  }
  .container.container--disabled,
  .container.container--locked {
    cursor: default;
  }
  .veil {
    position: absolute;
    top: -5%; left: -5%;
    background-color: var(--accent-color);
    width: 110%;
    height: 110%;
    transition: opacity 200ms;
    opacity: 0;
    /**/
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .veil.veil--closed {
    opacity: 1;
  }
  .im {
    position: relative;
    background-position: center;
    background-size: cover;
    width: 100%;
    height: 100%;
  }

  .veil .plus {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    opacity: .5;
    background-image: url(/app/static/img/icons/plus.svg);
    background-size: 20%;
    background-position: center;
    background-repeat: no-repeat;
    transition: opacity 200ms;
  }
  .veil.veil--charging {
    animation: img-elem-charging 1s ease-in 200ms infinite alternate;
  }
  .veil.veil--charging .plus,
  .container.container--disabled .veil.veil--charging .plus {
    opacity: 0;
  }

  @keyframes img-elem-charging {
    from {filter: brightness(1);}
    to {filter: brightness(.8);}
  }

  .im .trash {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: url(/app/static/img/icons/trash.svg);
    background-size: 30%;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0;
    transition: opacity 200ms;
  }
  .container:hover .im .trash {
    opacity: 1;
  }
  .container.container--disabled .im .trash,
  .container.container--locked .im .trash {
    opacity: 0;
  }
</style>