<template>
  <label class="switch">
    <input class='checkbox' v-model="onoff" type="checkbox">
    <span class="slider"></span>
  </label>
</template>

<script>
export default {
  name: 'ui-switch',
  props: {
    'value': {
      type: [Boolean],
      required: true,
      default: false,
    }
  },
  data () {
    return ({
      onoff: this.value
    });
  },
  watch: {
    onoff (newValue) {
      this.$emit('input', this.onoff);
    }
  },
};
</script>

<style scoped >
  /*  */
  /* Shameless steal from https://www.w3schools.com/howto/howto_css_switch.asp */
  /* The switch - the box around the slider */
  .switch {
    font-size: 25px;
    display: inline-block;
    width: 1.81em;
    height: 1em;
    user-select: none;
  }
  /* Hide default HTML checkbox */
  .switch input {display:none;}
  /* The slider */
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--accent-color);
    -webkit-transition: .4s;
    transition: .4s;
    border-radius: 2em;
  }
  .slider::before {
    position: absolute;
    content: "";
    height: 0.76em;
    width: 0.76em;
    left: 0.13em;
    bottom: 0.117em;
    background-color: white;
    -webkit-transition: .2s;
    transition: .2s;
    border-radius: 50%;
  }
  input:checked + .slider {
    background-color: var(--accent-color);
  }
  input:focus + .slider {
    box-shadow: 0 0 1px black;
  }
  input:checked + .slider::before {
    -webkit-transform: translateX(0.76em);
    -ms-transform: translateX(0.76em);
    transform: translateX(0.76em);
  }
  /*  */

</style>
