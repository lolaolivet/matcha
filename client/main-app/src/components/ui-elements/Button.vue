<template>
  <div id="container">
    <button
      :disabled="disabled"
      @click="(e) => $emit('click', e)"
    >
      <div class="circle">
        <span class="icon arrow"></span>
      </div>
      <p class="button-text"><slot></slot></p>
    </button>
  </div>
</template>

<script>
  export default {
    props: [
      'disabled'
    ]
  };
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css?family=Mukta:700");
* {
  box-sizing: border-box;
}
*::before, *::after {
  box-sizing: border-box;
}

button {
  --dis-accent: grey;
  --dis-bg: #ccc;
  position: relative;
  display: inline-block;
  cursor: pointer;
  outline: none;
  border: 0;
  vertical-align: middle;
  text-decoration: none;
  background: transparent;
  padding: 0;
  font-size: inherit;
  font-family: inherit;
}
button {
  width: 12em;
  height: auto;
}
button .circle {
  transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
  position: relative;
  margin: 0;
  width: 3em;
  height: 3em;
  border: 2px solid var(--accent-color);
  border-radius: 1.625em;
}
button .circle .icon {
  transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto;
  background: var(--accent-color);
}
button .circle .icon.arrow {
  transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
  left: 0.625em;
  width: 1.125em;
  height: 0.125em;
  background: none;
}
button .circle .icon.arrow::before {
  position: absolute;
  content: '';
  top: -0.25em;
  right: 0.0625em;
  width: 0.625em;
  height: 0.625em;
  border-top: 0.125em solid var(--accent-color);
  border-right: 0.125em solid var(--accent-color);
  -webkit-transform: rotate(45deg);
          transform: rotate(45deg);
}
button .button-text {
  transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0.75em 0;
  margin: 0 0 0 0;
  color: var(--accent-color);
  font-weight: 700;
  line-height: 1.6;
  text-align: center;
  text-transform: uppercase;
}
button:hover .circle {
  width: 100%;
}
button:hover .circle .icon.arrow {
  background: var(--accent-color);
  -webkit-transform: translate(1em, 0);
          transform: translate(1em, 0);
}
button:hover .button-text {
  color: var(--accent-color);
  /* -webkit-transform: translate(-1em, 0);
      transform: translate(-1em, 0); */
}
/* disabled */
button:disabled {
  background: transparent;
  cursor: default;
}
button:disabled .circle {
  border: 0;
  width: 100%;
  background-color: var(--dis-bg);
}
button:disabled .circle .icon {
  background: var(--dis-accent);
}
button:disabled .circle .icon.arrow {
  background: none;
}
button:disabled .circle .icon.arrow::before {
  border-top: 0.125em solid var(--dis-accent);
  border-right: 0.125em solid var(--dis-accent);
}
button:disabled .button-text {
  color: var(--dis-accent);
}
button:disabled .circle .icon.arrow {
  display: none;
}
button:disabled .button-text {
  color: var(--dis-accent);
}
</style>