<template>
  <div class="message" :class="{'message--incomming': incomming}">
    <div class="message-text"><span>{{txt}}</span></div>
    <div class='message-time'>
      <span>{{humanDate(time)}}</span>
    </div>
  </div>
</template>

<script>
import HumanDate from '@/components/mixins/humanDate';

export default {
  mixins: [HumanDate],
  name: 'ChatMessage',
  props: ['txt', 'time', 'user', 'incomming'],
};
</script>

<style>
.notify_seen {
  color: grey;
}
.notify_seen--false {
  background-color: lightskyblue;
}
.message {
  position: relative;
  display: flex;
  overflow: auto;
  align-items: center;
  width: 90%;
  width: 100%;
  flex-direction: row-reverse;
  word-break: break-all;
  text-align: right;
}
.message-infos {
  position: absolute;
  color: black;
  top: 0;
  left: 0;
}
.message-text {
  padding: .4em .5em;
  margin-bottom: .2em;
  max-width: 70%;
  border-radius: 1em;
  color: black;
  background: var(--msg-color);
  cursor: default;
  white-space: pre;
}
.message--incomming {
  width: 100%;
  flex-direction: row;
  text-align: left;
}
.message--incomming .message-text {
  background: var(--incomming-msg-color);
}

.message-time { opacity: 0; transition: opacity 100ms; }
.message:hover .message-time { opacity: var(--op); }
.message-time {
  font-size: .7em;
  font-weight: bold;
  position: relative;
  /* top: .5em; */
  margin-right: .5em;
  margin-left: auto;
}
.message--incomming .message-time {
  margin-left: .5em;
  margin-right: auto;
}
</style>
