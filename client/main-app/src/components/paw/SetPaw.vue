<template>
  <div class='set-paw' :class='{"set-paw--loading": loading}' v-if='Object.keys(paws).length'>
    <little-paw
      :open='currentPaw === "place"'
      title="place"
      :paw='paws["place"]'
      :choice='choices["place"]'
      :dark='dark'
      @select="selectPlace"
      @open="setCurrent('place')"
      @close="unsetCurrent"
    />
    <little-paw
      :open='currentPaw === "attitude"'
      title="attitude"
      :paw='paws["attitude"]'
      :choice='choices["attitude"]'
      :dark='dark'
      @select="selectAttitude"
      @open="setCurrent('attitude')"
      @close="unsetCurrent"
    />
    <little-paw
      :open='currentPaw === "weapon"'
      title="weapon"
      :paw='paws["weapon"]'
      :choice='choices["weapon"]'
      :dark='dark'
      @select="selectWeapon"
      @open="setCurrent('weapon')"
      @close="unsetCurrent"
    />
    <!-- <div>
      <button @click="done">Ok</button>
    </div> -->
  </div>
</template>

<script>
import LittlePaw from './LittlePaw';

export default {
  name: 'SetPaws',
  components: { 'little-paw': LittlePaw },
  data () {
    return {
      pawKeys: ['place', 'attitude', 'weapon'],
      currentPaw: undefined,
      choices: {
        'place': {},
        'attitude': {},
        'weapon': {},
      },
      //
      paws: {}, // the all set of paw & questions
      //
      loading: true,
    };
  },
  computed: {
    dark () {
      return (this.$store.state.uiMode.isLight);
    },
  },
  async beforeMount () {
    this.$store.commit('LOCAL_LOADING_ON');
    this.loading = true;
    this.paws = await this.$store.dispatch('getPawValues');
    this.choices = { ...this.choices, ...(this.$store.state.paw.choices || {}) };
    this.next();
    this.loading = false;
    this.$store.commit('LOCAL_LOADING_OFF');
  },
  methods: {
    async send (pawType, pawId) {
      // save the chosen paw in localStorage and db
      await this.$store.dispatch('postPaw', { paw: pawType, id: pawId });
    },
    saveChoice (pawType, choice) {
      this.choices[pawType] = choice;
    },
    next (current) {
      // If all set, just unset this.currentPaw
      const allSet =
        Object.keys(this.choices.place).length &&
        Object.keys(this.choices.attitude).length &&
        Object.keys(this.choices.weapon).length;

      if (allSet) {
        this.unsetCurrent();
        return;
      }
      // Who is next ?
      // (if current undefined (i.e. last) -> back to first)
      const next = current ? this.pawKeys[this.pawKeys.indexOf(current) + 1] : this.pawKeys[0];
      if (!next || Object.keys(this.choices[next]).length) {
        // If next undefined (i.e. last) or already set, call next again
        this.next(next);
      } else {
        // Otherwise set this.currentPaw to next
        this.setCurrent(next);
      }
    },
    setCurrent (key) {
      this.currentPaw = key;
    },
    unsetCurrent (key) {
      this.currentPaw = undefined;
    },
    async select (type, choice) {
      await this.send(type, choice.id);
      this.saveChoice(type, choice);
      this.next(this.currentPaw);
    },
    selectPlace (choice) { this.select('place', choice); },
    selectAttitude (choice) { this.select('attitude', choice); },
    selectWeapon (choice) { this.select('weapon', choice); },
    done () {
      this.$router.push('Profile');
    },
  },
};
</script>

<style scoped>
.set-paw {
  font-size: 1em;
}
.set-paw--loading {
  opacity: var(--op);
  pointer-events: none;
}
h2 {
  font-size: 1.5em;
  line-height: 1.5em;
}
</style>