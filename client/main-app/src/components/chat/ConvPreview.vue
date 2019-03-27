<template>
  <div class="prev" :class="{ 'prev--to-see': (!seen && incomming), 'prev--open': open }">

    <!-- status -->
    <div class="prev__status" :class="online ? 'prev__status--online' : 'prev__status--offline'"></div>
    <!-- picture -->
    <div class="prev__img" :style="styleImg"></div>

    <div>
      <!-- login -->
      <div class="prev__login">{{login}}</div>
      <!-- date -->
      <div class="prev__date">{{ (date && humanDate(new Date(parseInt(date)))) || 'new match' }}</div>
      <!-- message -->
      <div class="prev__msg">{{ formatSmallText(text) }}</div>
    </div>
  </div>
</template>

<script>
import HumanDate from '@/components/mixins/humanDate';

export default {
  name: 'ConvPreview',
  mixins: [HumanDate],
  props: {
    userid: {
      type: Number,
      default: 0,
      required: true
    },
    text: {
      type: String,
      required: false,
      default: ''
    },
    login: {
      type: String,
      required: true
    },
    picture: {
      type: String,
      required: true
    },
    date: {
      type: String,
      default: '',
      required: false
    },
    seen: {
      type: Boolean,
      default: false,
      required: false
    },
    incomming: {
      type: Boolean,
      default: false,
      required: true
    },
    newContact: {
      type: Boolean,
      default: false,
      required: true
    },
    open: {
      type: Boolean,
      default: false,
      required: false
    },
    online: {
      type: Boolean,
      default: false,
      required: false
    },
  },
  computed: {
    styleImg () {
      return 'background-image: url(' + this.picture + ')';
    },
  },
  methods: {
    formatSmallText (text) {
      if (!text) {
        return '';
      }

      let cut = text.slice(0, 20);
      if (text.length > 20) {
        cut = cut.concat('...');
      }

      return (cut);
    },
  },
};
</script>

<style scoped>
.prev {
  --bg-active: rgba(0,0,0,.1);
  position: relative;
  text-align: left;
  width: 20em;
  min-height: 2em;
  padding: .5em;
  display: flex;
}
.prev:hover, .prev--open {
  background: var(--bg-active);
}

.prev__login {
  margin: .3em 0 0 .5em;
  font-weight: normal;
}
.prev--to-see .prev__login {
  font-weight: bold;
}

.prev__msg {
  position: relative;
  top: -.2em;
  margin-left: .6em;
  opacity: var(--op);
  font-size: small;
}
.prev__date {
  position: absolute;
  opacity: var(--op);
  height: 100%;
  top: 0;
  right: .5em;
  font-size: small;
  display: flex;
  align-items: center;
}
.prev__status {
  position: absolute;
  top: -.1em;
  left: 5.7em;
  font-size: small;
}
.prev__status--online::before {
  content: 'online';
  font-weight: bold;
  color: var(--accent-color);
}
.prev__status--offline::before {
  content: 'offline';
  font-weight: normal;
  opacity: var(--op);
}
.prev__img {
  min-width: 3em;
  width: 3em;
  height: 3em;
  border-radius: 20em;
  background-position: center;
  background-size: contain;
}
</style>
