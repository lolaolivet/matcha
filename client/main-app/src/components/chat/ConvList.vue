<template>
  <div class="chat-list">
    <div  class="match-list">
      <transition-group name="flip-list" tag="ul" v-if="previews.length !== 0">
        <li
          :key="prev.userid"
          v-for="prev in previews"
          @click="$emit('select', prev.userid)"
        >
          <conv-preview
            :open='current === prev.userid'
            :seen='prev.lastMsg.seen'
            :incomming='prev.lastMsg.incomming'
            :new-contact='prev.newContact'
            :online='prev.online'
            :userid='prev.userid'
            :login='prev.profile.login'
            :picture='prev.profile.picture'
            :text='prev.lastMsg.txt'
            :date='prev.lastMsg.date'
          >
          </conv-preview>
        </li>
      </transition-group>
    </div>
  </div>
</template>

<script>
import ConvPreview from './ConvPreview';
import HumanDate from '@/components/mixins/humanDate';

/*

  -------------------------------------------------------------------

  PROPS

  - 1 -
  :previews

    a list of previews like such :

    [
      {
        userid,     <- Id of the other user
        online,     <- Boolean for "is the user online"
        newContact, <- Haven't talked yet
        profile: {
          login,
          picture,    <- String : url of the user's img
        },
        lastMsg: {
          incomming,
          seen,           <- Boolean for "has the conv been seen"
          txt: m.txt,
          date: m.time,
        },
      },
      ...
    ]

  - 2 -
  :current

    an id of the currently open conv

  -------------------------------------------------------------------

  EVENTS

  - select -

    Click a conv preview and it will emits an event "select"
    that sends out the userid of the conv preview that was clicked

  -------------------------------------------------------------------

 */

export default {
  components: { 'conv-preview': ConvPreview },
  mixins: [HumanDate],
  props: {
    previews: {
      type: Array,
      required: false,
    },
    current: {
      type: Number,
      required: false,
      default: null,
    },
  },
};
</script>

<style scoped>
.match-list {
  border-right: 1px solid rgba(0,0,0,.1);
  overflow: scroll;
  width: 21em;
}

.chat-list {
  display: flex;
}
ul {
  margin: 0;
  padding: 0;
  list-style-type: none;
  user-select: none;
}
li {
  cursor: pointer;
}
.flip-list-move {
  transition: transform .2s ease-in;
}
@media all and (max-width: 800px) {
  .chat-list {
    width: 100%;
    max-width: 100%;
  }
  .match-list {
    width: 100%;
    max-width: 100%;
    border:0;
  }
}
</style>
