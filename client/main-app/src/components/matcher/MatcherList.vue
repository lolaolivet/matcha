<template>
  <div class="matcher-search__list">
    <transition-group class="profile-list" name="flip-list" tag="ul">
      <li v-for="user in profiles" v-bind:key="user.userid">
        <ProfileListSingle
          :userid="user.profileSummary.userid"
          :login="user.profileSummary.login"
          :picture="user.profileSummary.picture.url"
          @action="liftButtonEvent"
        />
      </li>
    </transition-group>

  </div>
</template>


<script>
import ProfileListSingle from '@/components/profile/ProfileListSingle';

export default {
  name: 'MatcherList',
  components: {
    ProfileListSingle
  },
  props: {
    profiles: {
      type: Array,
      default: [],
      required: false
    },
  },
  methods: {
    liftButtonEvent (event) {
      this.$emit('updateList', event);
    },
  },
};
</script>

<style scoped>
.flip-list-move {
  transition: transform .2s ease-in;
}
ul {
  list-style: none;
  width: 100%;
  margin: auto;
  display: grid;
  padding: 0;
  align-items: center;
  justify-content: center;
  grid-template-columns: repeat(3, 20em);
  grid-auto-rows: 7em;
}
@media all and (max-width: 1300px) {
  ul {
    grid-template-columns: repeat(2, 20em);
  }
}
@media all and (max-width: 800px) {
  ul {
    grid-template-columns: repeat(1, 20em);
  }
}
</style>