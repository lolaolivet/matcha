<template>
  <div class="stats window">
    <h1 class='stats-main-title'>{{ !isOpen ? "🏅" : medals[isOpen] }}</h1>
    <!-- MENU -->
    <div class="stats-menu" :class="{ 'stats-menu--selected' : isOpen !== '' }">

      <!-- Match -->
      <button class="stats-button stats-button--matches"
        :class="{'stats-button--selected': isOpen === 'matches'}"
        @click="setListMatch()"
        @setListMatch="setListMatch"
      >
        {{title.matches}}
        <notification class='stats-button__notif' v-if="notif.match" :content='notif.match'></notification>
      </button>

      <!-- likes (liked) -->
      <button class="stats-button stats-button--liked"
        :class="{'stats-button--selected': isOpen === 'liked'}"
        @click="setListLikes('liked')"
        @setListLikes="setListLikes"
      >{{title.liked}}</button>

      <!-- likes (likedBy)-->
      <button class="stats-button  stats-button--liked-by"
        :class="{'stats-button--selected': isOpen === 'likedBy'}"
        @click="setListLikes('likedBy')"
        @setListLikes="setListLikes"
      >
        {{title.likedBy}}
        <notification class='stats-button__notif' v-if="notif.like" :content='notif.like'></notification>
        <notification class='stats-button__notif stats-button__notif--unlike' v-if="notif.unlike" :negative='true' :content='notif.unlike'></notification>
      </button>

      <!-- Blocks -->
      <button class="stats-button stats-button--blocked"
        :class="{'stats-button--selected': isOpen === 'blocked'}"
        @click="setListBlocks()"
        @setListBlocks="setListBlocks"
      >{{title.blocked}}</button>

      <!-- Views (full) -->
      <button class="stats-button stats-button--view-full"
        :class="{'stats-button--selected': isOpen === 'viewedFull'}"
        @click="setListViews('viewedFull')"
      >{{title.viewedFull}}</button>

      <!-- Views by (full) -->
      <button class="stats-button stats-button--view-b-full"
        :class="{'stats-button--selected': isOpen === 'viewedByFull'}"
        @click="setListViews('viewedByFull')"
      >
        {{title.viewedByFull}}
        <notification class='stats-button__notif' v-if="notif.view" :content='notif.view'></notification>
      </button>

      <!-- Views -->
      <button class="stats-button stats-button--view"
        :class="{'stats-button--selected': isOpen === 'viewedBy'}"
        @click="setListViews('viewedBy')"
      >{{title.viewed}}</button>

      <!-- Views by -->
      <button class="stats-button stats-button--view-b"
        :class="{'stats-button--selected': isOpen === 'viewed'}"
        @click="setListViews('viewed')"
      >{{title.viewedBy}}</button>
    </div>

    <!-- PROFILE LIST -->
    <ul v-if="isOpen !== ''" class="profile-list">
      <li v-for="user in profiles" v-bind:key="user.userid">
        <profile-list-single
          :userid="user.userid"
          :login="user.login"
          :picture="user.picture.url"
          @action="updateList"
        >
        </profile-list-single>
      </li>
    </ul>
    <h3 v-if="profiles.length === 0 && isOpen && !loading">No one here</h3>
  </div>
</template>

<script>
import ProfileListSingle from '@/components/profile/ProfileListSingle';
import NotificationPatch from '@/components/Notification-patch';

export default {
  name: 'Stats',
  components: {
    'profile-list-single': ProfileListSingle,
    'notification': NotificationPatch
  },
  data () {
    return ({
      displayMenu: true,
      isOpen: '',
      title: {
        matches: 'MATCHES',
        liked: 'I LIKE',
        likedBy: 'THEY LIKE ME',
        blocked: 'I BLOCKED',
        viewedFull: 'I READ THEIR PROFILE',
        viewedByFull: 'THEY READ MY PROFILE',
        viewedBy: 'THEY SAW ME',
        viewed: 'I SAW THEM',
      },
      medals: {
        matches: '🏆',
        liked: '🥇',
        likedBy: '🥇',
        blocked: '⛔️',
        viewedFull: '🥈',
        viewedByFull: '🥈',
        viewedBy: '🥉',
        viewed: '🥉',
      },
      loading: false,
    });
  },
  async mounted () {
    await this.$store.dispatch('getNotifications');
    await this.$store.dispatch('getMatches');
    await this.$store.dispatch('getLikes');
    await this.$store.dispatch('getBlocks');
    await this.$store.dispatch('getDisplays');
  },
  methods: {
    toggle () {
      if (this.isOpen) {
        this.isOpen = '';
        return (this.isOpen);
      } else {
        return (true);
      }
    },
    async updateList () {
      // reload it from the updated state store
      this.loading = true;
      switch (this.isOpen) {
      case 'matches':
        await this.$store.dispatch('getMatches');
        break;
      case 'liked':
      case 'likedBy':
        await this.$store.dispatch('getLikes');
        break;
      case 'blocked':
        await this.$store.dispatch('getBlocks');
        break;
      case 'viewedFull':
      case 'viewedByFull':
      case 'viewedBy':
      case 'viewed':
        await this.$store.dispatch('getDisplays');
        break;
      }
      this.loading = false;
    },
    async setListMatch () {
      if (!this.toggle()) return;
      // the term 'category' is for the name of the store's getters
      this.isOpen = 'matches';
      this.deleteNotif('match');
    },
    async setListBlocks () {
      if (!this.toggle()) return;
      this.isOpen = 'blocked';
    },
    async setListLikes (category) {
      if (!this.toggle()) return;
      this.isOpen = category;
      // Delete notifs
      if (category === 'likedBy') {
        this.deleteNotif('like');
        this.deleteNotif('unlike');
      }
    },
    async setListViews (category) {
      if (!this.toggle()) return;
      this.isOpen = category;
      if (category === 'viewedByFull') {
        this.deleteNotif('view');
      }
    },
    async deleteNotif (type) {
      await this.$store.dispatch('deleteNotifications', type);
    }
  },
  computed: {
    notif () {
      return (this.$store.getters.allNotifSums);
    },
    profiles () {
      var profiles;
      switch (this.isOpen) {
      case 'matches':
        profiles = this.$store.getters.matches;
        break;
      case 'liked':
        profiles = this.$store.getters.liked;
        break;
      case 'likedBy':
        profiles = this.$store.getters.likedBy;
        break;
      case 'blocked':
        profiles = this.$store.getters.blocked;
        break;
      case 'viewedFull':
        profiles = this.$store.getters.viewedFull;
        break;
      case 'viewedByFull':
        profiles = this.$store.getters.viewedByFull;
        break;
      case 'viewedBy':
        profiles = this.$store.getters.viewedBy;
        break;
      case 'viewed':
        profiles = this.$store.getters.viewed;
        break;
      }
      return (profiles || []);
    }
  },
};
</script>

<style scopped>

  ul {
    list-style: none;
    width: 100%;
    margin: auto;
    padding: 0;
  }
  li {
    width: 100%;
  }
  .stats-main-title {
    user-select: none;
  }
  .stats-title {
    font-size: 2em;
    padding: 13px;
    cursor: pointer;
    user-select: none;
    text-align: center;
    line-height: 1.1em;
  }
  .stats-menu {
    color: var(--text-color);
    overflow: hidden;
    position: relative;
    display: flex;
    align-items: center;
    flex-direction: column;
    box-sizing: border-box;
    max-width: 500px;
    margin: auto;
  }
  .stats-button:first-child {
    margin-top: .5em;
  }
  .stats-button:last-child {
    margin-bottom: .5em;
  }
  .stats-button {
    position: relative;
    user-select: none;
    outline: 0;
    text-align: left;
    width: 100%;
    border: 0;
    /* height: 3em; */
    padding: .5em 1em;
    font-weight: bold;
    /* margin: -1px; */
    font-size: 1.5em;
    background-color: transparent;
    cursor: pointer;
    /* color: var(--contrast-color); */
    color: var(--text-color);
    transition: font-size 200ms ease-out;
    overflow: hidden;
    max-height: 5em;
    opacity: 1;
  }
  .stats-button:hover {
    background-color: rgba(0,0,0,.1);
  }

  .stats-button__notif {
    position: absolute;
    top: .5em;
    left: 1.6em;
  }
  .stats-button__notif--unlike {
    transform: translateY(110%);
  }
  .stats-button--selected .stats-button__notif {
    font-size: 0.6em;
    left: auto;
    right: .2em;
    top: .15em;
  }
  .stats-button--selected .stats-button__notif.stats-button__notif--unlike {
    transform: translateY(0) translateX(-110%);
  }

  .profile-list {
    transition: transform .2s ease-in;
    max-width: 600px;
    height: 100%;
    width: 100%;
    margin: 1em auto 2em;
  }

  .stats-menu--selected .stats-button {
    font-size: 1.5em;
    max-height: 0em;
    padding: 0;
    opacity: 0;
  }
  .stats-menu--selected .stats-button--selected {
    font-size: 2em;
    max-height: 5em;
    opacity: 1;
  }

  .stats-button--matches::before {
    content: '🏆 - ';
  }
  .stats-button--liked::before {
    content: '🥇 - ';
  }
  .stats-button--liked-by::before {
    content: '🥇 - ';
  }
  .stats-button--blocked::before {
    content: '⛔️ - ';
  }
  .stats-button--view-full::before {
    content: '🥈 - ';
  }
  .stats-button--view-b-full::before {
    content: '🥈 - ';
  }
  .stats-button--view::before {
    content: '🥉 - ';
  }
  .stats-button--view-b::before {
    content: '🥉 - ';
  }
  .stats-button--selected.stats-button--matches::before,
  .stats-button--selected.stats-button--liked::before,
  .stats-button--selected.stats-button--liked-by::before,
  .stats-button--selected.stats-button--blocked::before,
  .stats-button--selected.stats-button--view-full::before,
  .stats-button--selected.stats-button--view-b-full::before,
  .stats-button--selected.stats-button--view::before,
  .stats-button--selected.stats-button--view-b::before {
    content: '← ';
  }

</style>
