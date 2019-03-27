<template>
  <button
    :class='`switch-button switch-button--${state}`'
    @click="requestStateChange"
    :disabled="disabled"
  >
    <div class='switch-button__content'>
      {{ state === 'on' ? messageOn : messageOff }}
    </div>
  </button>
</template>

<script>
  export default {
    props: {
      'disabled': {
        type: Boolean,
        default: false,
      },
      'state': {
        type: String,
        validator (val) {
          return (val === 'on' || val === 'off');
        }
      },
      'messageOn': {
        type: String,
        required: true,
      },
      'messageOff': {
        type: String,
        required: true,
      },
    },
    methods: {
      requestStateChange () {
        if (!this.disabled && this.state === 'off') {
          this.$emit('switchOn');
        }
      },
    },
  };
</script>

<style scoped>
  button.switch-button {
    border: 0;
    outline: none;
    background: var(--accent-color);
    color: var(--contrast-color);
    width: auto;
    height: 2em;
    max-width: 2em;
    font-weight: bold;
    border-radius: 100em;
    transition: max-width 200ms ease-in-out;
    cursor: default;
  }
  button:disabled.switch-button {
    opacity: .5;
  }
  button.switch-button.switch-button--off {
    border: .2em solid var(--accent-color);
    color: var(--accent-color);
    background: transparent;
    cursor: pointer;
  }
  button:enabled.switch-button:hover {
    max-width: 20em;
  }
  button.switch-button .switch-button__content {
    transition: opacity 200ms;
    opacity: 0;
  }
  button:enabled.switch-button:hover .switch-button__content {
    opacity: 1;
  }
</style>