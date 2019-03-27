<template>
  <div
    :class="`flag flag--${type} ${fullscreen ? 'flag--fullscreen' : ''}`">
    <p>
      {{message}}
      <button
        class='flag__button'
        v-if="button"
        @click="quit"
      >
        {{button.message}}
      </button>
    </p>
    <div class='flag__close'>
      <button
        class='dismiss'
        @click="dismiss"
      >
      </button>
      <pie-timer
        v-if="timerOn"
        class="pie-timer"
        :duration="duration"
        :restart="key"
        @done="quit"
      >
      </pie-timer>
    </div>
  </div>
</template>

<script>
  import PieTimer from '@/components/ui-elements/PieTimer';

  export default {
    data: function () {
      return ({
        key: 0
      });
    },
    components: {
      'pie-timer': PieTimer
    },
    watch: {
      message () {
        this.key++; // Force pie-timer update
      },
    },
    props: {
      timerOn: {
        type: [Boolean],
        required: false,
      },
      button: {
        type: [Object],
        required: false,
      },
      message: {
        type: [String],
        required: false,
        default: '',
      },
      duration: {
        type: [Number],
        required: false,
        default: 5000, // Arbitrarily 5 seconds
      },
      dismissFn: {
        type: [Function],
        required: false,
      },
      type: {
        validator: (val) => (['negative', 'neutral', 'positive'].includes(val)),
        required: false,
        default: 'neutral'
      },
      fullscreen: {
        type: Boolean,
        default: false,
      },
    },
    methods: {
      quit () {
        const done = () => this.$emit('quit');
        if (this.button && this.button.fn) {
          this.button.fn(done);
        } else {
          done();
        }
      },
      async dismiss () {
        if (this.dismissFn) {
          await this.dismissFn();
        }
        this.$emit('quit');
      },
    }
  };
</script>

<style scoped>
  .flag {
    opacity: .9;
    --flag-cross-image: var(--cross-image-white);
    position: relative;
    height: 30em;
    width: 100%;
    z-index: 100;
    color: rgb(252, 167, 167);
    padding: 5px 20px;
    box-sizing: border-box;
    overflow: hidden;
    font-weight: 600;
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    max-width: 50em;
    width: 100%;
    border-bottom-left-radius: .3em;
    border-bottom-right-radius: .3em;
    /*  */
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    font-size: 2em;
  }

  @media all and (min-width: 500px) {
    .flag {
      max-height: 30%;
      height: 30em;
    }
  }

  .flag.flag--negative {
    --pie-timer-color: black;
    background-color: red;
    color: white;
  }
  .flag.flag--positive {
    --pie-timer-color: black;
    background-color: lime;
    color: white;
  }
  .flag.flag--neutral {
    --pie-timer-color: var(--accent-color);
    background-color: white;
    color: black;
    --flag-cross-image: var(--cross-image-black);
  }

  .flag p {
    margin: auto;
    font-size: 2em;
  }

  .flag, .flag a {
    font-size: .6rem;
    font-family: Helvetica;
    text-transform: uppercase;
  }

  /* FULLSCREEN */

  .flag.flag--fullscreen {
    font-size: 1.5em;
    position: absolute;
    width: 100vw;
    height: 100vh;
    max-width: 100vw;
    max-height: 100vh;
  }
  .flag p {
    margin: 1em;
    line-height: 1.5em;
    max-width: 900px;
  }
  .flag__button {
    display: block;
    margin: .2em auto;
    font-size: .7em;
    font-weight: bold;
    border: 2px solid white;
    border-radius: 2em;
    padding: .2em .5em;
    color: black;
    text-transform: uppercase;
    background-color: white;
    cursor: pointer;
    transition: background-color 200ms;
  }
  .flag__button:hover {
    background-color: rgba(255, 255, 255, .8);
  }

  /* button */
  .flag__close {
    display: block;
    position: absolute;
    right: 35px;
    top: 10px;
    display: block;
  }
  .pie-timer {
    position: absolute;
    top: 0;
    left: 0;
  }
  .dismiss {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    width: 25px;
    height: 25px;
    border: 0;
    background-image: var(--flag-cross-image);
    background-color: transparent;
    outline: none;
    cursor: pointer;
  }


</style>

