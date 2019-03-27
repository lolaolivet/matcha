<template>
  <div class="profile">
    <img-loader
      width="500px"
      height="500px"
      :src="imageSrc"
    />
    <div class="profile-title">
      <ui-reveal :appear-time='200' :reveal-time='500' :trigger="!$store.state.localLoading">
        <h1 class="profile-title__title">
          {{login}}
        </h1>
      </ui-reveal>
    </div>
    <div>
      <div class="profile__paw">
        <p class='profile__paw__place'>{{paw.place ? ($store.state.uiMode.isLight ? paw.place.name : paw.place.darkName) : ''}}</p>
        <br>
        <p class='profile__paw__attitude'>{{paw.attitude ? ($store.state.uiMode.isLight ? paw.attitude.name : paw.attitude.darkName) : ''}}</p>
        <br>
        <p class='profile__paw__weapon'>{{paw.weapon ? ($store.state.uiMode.isLight ? paw.weapon.name : paw.weapon.darkName) : ''}}</p>
        <br>
      </div>
    </div>
  </div>

</template>

<script>
import ImgLoader from './ImgLoader';
import Reveal from './Reveal';

export default {
  name: 'ProfileSummary',
  props: {
    paw: {
      required: true,
      type: Object,
    },
    imageSrc: {
      required: true,
      type: String
    },
    login: {
      required: true,
      type: String
    },
  },
  components: {
    'img-loader': ImgLoader,
    'ui-reveal': Reveal,
  },
};
</script>

<style scoped>
  .profile {
    position: relative;
    width: 500px;
    height: 500px;
    max-width: 100%;
    box-sizing: border-box;
    margin: auto;
    /* padding: 2em; */
    --profile-em: var(--em);
  }
  .profile-title {
    position: absolute;
    top: -1.5em;
    left: -1.5em;
  }
  .profile-title__title {
    background: var(--bg);
    margin: 0;
    padding: .5em .7em;
  }
  .profile__paw {
    position: absolute;
    bottom: -1.5em;
    right: -1.5em;
    text-align: right;
    /* color: var(--profile-em); */
  }
  .profile__paw p {
    margin: .2em;
    padding: .3em .6em;
    background-color: var(--bg);
    display: inline-block;
    font-weight: bold;
  }
  .profile .profile__paw__place::before { content: '#place '; }
  .profile .profile__paw__attitude::before { content: '#attitude '; }
  .profile .profile__paw__weapon::before { content: '#weapon '; }

  .profile .profile__paw__place::before,
  .profile .profile__paw__attitude::before,
  .profile .profile__paw__weapon::before {
    color: var(--profile-em);
    font-weight: normal;
  }
</style>
