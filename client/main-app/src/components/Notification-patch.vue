<template>
  <div class='notif' v-bind:class="{'notif--empty': !content, 'notif--unlike': negative}">
    <span>{{content}}</span>
  </div>
</template>

<script>
export default {
  props: {
    negative: {
      type: Boolean,
      default: false
    },
    content: {
      type: Number,
      default: 0
    },
  },
};
</script>

<style scoped>
  .notif.notif--empty {
    display: none;
  }
  .notif {
    font-size: .4em;
    font-weight: bold;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    background-color: #f00;
    color: white;
    border-radius: 10em;
    cursor: pointer;
    height: 1em;
    min-width: 1em;
    padding: .3em;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .notif.notif--unlike {
    background-color: #666;
  }
  .notif span {
    display: block;
  }
  .notif.notif--unlike span::before {
    content: '-';
  }

</style>
