<template>
  <div class="input-wrapper">
    <div ref='input' class="input-wrapper__input">
      <slot name='input'></slot>
    </div>
    <div class="input-wrapper__input__underline" :class='{"input-wrapper__input__underline--incorrect":incorrect}'></div>
    <div ref='colorLine' class="input-wrapper__input__color-line" :class="{'input-wrapper__input__color-line--activated': activated, 'input-wrapper__input__color-line--incorrect': incorrect}"></div>
  </div>
</template>

<script>
export default {
  name: 'input-wrapper',
  props: ['incorrect'],
  mounted () {
    var input = this.$refs.input.children[0];
    input.addEventListener('focus', this.activate, true);
    input.addEventListener('mousedown', this.moveTransformOrigin, true);
    input.addEventListener('blur', this.resetInput, true);
  },
  beforeDestroy () {
    var input = this.$refs.input.children[0];
    input.removeEventListener('focus', this.activate, true);
    input.removeEventListener('mousedown', this.moveTransformOrigin, true);
    input.removeEventListener('blur', this.resetInput, true);
  },
  data () {
    return ({
      activated: false
    });
  },
  methods: {
    activate () {
      this.activated = true;
    },
    moveTransformOrigin (event) {
      const boundingRect = this.$refs.input.getBoundingClientRect();
      var x = event.clientX - boundingRect.left;
      this.$refs.colorLine.style = `transform-origin: ${x}px center 0px`;
    },
    resetInput () {
      this.activated = false;
      this.$refs.colorLine.style = '';
    }
  }
};
</script>

<style lang='css'>
  .input-wrapper {
    position: relative;
    color: var(--text-color);
  }

  .input-wrapper__input-container {
    position: relative;
    display: flex;
  }

  .input-wrapper__input {
    position: relative;
    display: flex;
    flex-grow: 1;
    flex-shrink: 1;
  }

  .input-wrapper__input input {
    -webkit-box-flex: 1;
    flex-grow: 1;
    flex-shrink: 1;
    background-color: transparent;
    border: none;
    display: block;
    height: 24px;
    line-height: 24px;
    margin: 0;
    min-width: 0%;
    outline: none;
    padding: 0 5px;
    z-index: 0;
    word-wrap: break-word;
  }

  .input-wrapper__input__underline {
    background-color: var(--accent-color);
    bottom: -2px;
    height: 1px;
    left: 0;
    margin: 0;
    padding: 0;
    position: absolute;
    width: 100%;
  }
  .input-wrapper__input__underline--incorrect {
    background-color: red;
  }

  .input-wrapper__input__color-line {
    background-color: var(--accent-color);
    transform: scaleX(0);
    bottom: -2px;
    height: 2px;
    left: 0;
    margin: 0;
    padding: 0;
    position: absolute;
    width: 100%;
    transition: transform .3s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: 0px center 0px;
  }
  .input-wrapper__input__color-line--activated {
    transform: scaleX(1);
  }
  .input-wrapper__input__color-line--incorrect {
    background-color: red;
  }
  .input-wrapper input {
    color: var(--text-color);
  }
</style>
