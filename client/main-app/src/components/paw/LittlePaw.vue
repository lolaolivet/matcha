<template>
  <div class="paw" :class='{"paw--open": open}' v-if="paw.choices !== undefined">
    <div class='paw__title' @click='clickTitle'><span class='paw__title__title-name'>#{{title}}</span> <span class='paw__title__choice'>{{choice && choice[mode]}}</span></div>
    <div class='paw__choices'>
      <h2>{{paw.question}}</h2>
      <button
        @click.prevent='select(0)()'
      >
        {{paw.choices[0][mode]}}
      </button>
      <button
        @click.prevent='select(1)()'
      >
        {{paw.choices[1][mode]}}
      </button>
      <button
        @click.prevent='select(2)()'
      >
        {{paw.choices[2][mode]}}
      </button>
      <button
        @click.prevent='select(3)()'
      >
        {{paw.choices[3][mode]}}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'littePaw',
  props: {
    title: {
      type: String,
      required: true,
    },
    paw: {
      type: Object,
      required: false,
    },
    open: {
      type: Boolean,
    },
    choice: {
      type: Object,
    },
    dark: {
      type: Boolean,
    },
  },
  computed: {
    mode () {
      return (this.dark ? 'name' : 'darkName');
    },
  },
  methods: {
    select (n) {
      return () => {
        this.$emit('select', this.paw.choices[n]);
      };
    },
    clickTitle () {
      if (!this.open) {
        this.$emit('open');
      } else {
        this.$emit('close');
      }
    }
  }
};

</script>

<style scoped>
.paw {
  width: 80%;
  max-width: 15em;
  margin: 1em auto;
  font-size: 1.5em;
  line-height: 1.2;
}
.paw .paw__title {
  text-align: left;
  cursor: pointer;
  user-select: none;
  transition: all 300ms;
}
.paw .paw__choices {
  max-height: 0;
  padding-left: .5em;
  overflow: hidden;
  margin-bottom: 0;
  margin-top: 0;
  box-sizing: border-box;
  transition: max-height 300ms, margin-bottom 300ms, margin-top 300ms;
}
.paw.paw--open .paw__choices {
  max-height: 15em;
  margin-bottom: 2em;
  margin-top: .5em;
}
.paw h2 {
  text-align: left;
  font-size: 1em;
  line-height: 1.5em;
  margin-bottom: 0.5em;
}
.paw button {
  color: var(--text-color);
  border: 0;
  box-sizing: border-box;
  display: block;
  font-size: 1em;
  text-align: left;
  cursor: pointer;
  padding: .2em;
  margin: .2em;
  outline: 0;
  background-color: transparent;
  transition: background-color 200ms;
}
.paw button,
.paw__title__choice {
  border-bottom: 2px solid rgba(0,0,0,.2);
  font-weight: bold;
}
.paw button:hover {
  background-color: rgba(0,0,0,.2);
}
.paw__title__title-name {
  color: var(--em);
}
</style>