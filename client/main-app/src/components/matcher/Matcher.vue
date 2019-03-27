<template>
  <transition name='fade'>
    <div class="matcher window window--full">
      <div class="matcher-search__preferences"
        @click="menuPreferences"
      >
          <h1>👫👭👬</h1>
        <preference-selector
          @reload="reloadSuggestions"
        >
        </preference-selector>
      </div>
      <h1>Results</h1>
      <div class='matcher-search__sorter'>
        <!-- SORTER -->
        <h3>Sort by</h3>
        <input id="noSort" type="radio" v-model="sortby" value="noSort">
        <label for="noSort">
          no sort
        </label>
        <br>
        <input id="ageAsc" type="radio" v-model="sortby" value="ageAsc">
        <label for="ageAsc">
          age (asc)
        </label>
        <br>
        <input id="ageDesc" type="radio" v-model="sortby" value="ageDesc">
        <label for="ageDesc">
          age (desc)
        </label>
        <br>
        <input id="loginAsc" type="radio" v-model="sortby" value="loginAsc">
        <label for="loginAsc">
          name (abc)
        </label>
        <br>
        <input id="loginDesc" type="radio" v-model="sortby" value="loginDesc">
        <label for="loginDesc">
          name (zyx)
        </label>
        <br>
        <input id="score" type="radio" v-model="sortby" value="score">
        <label for="score">
          reputation (100 → 0)
        </label>
        <!-- PAW FILTERS -->
        <div class='matcher-search__sorter__attitude' v-if='paw && paw.attitude && paw.attitude.choices'>
          <h3>Filter by attitude</h3>
          <input id="noA" type="radio" v-model="attitudeFilter" :value="null">
          <label for="noA">
            all attitudes
          </label>
          <br>
          <input id="attitude1" type="radio" v-model="attitudeFilter" :value="paw.attitude.choices[0].id">
          <label class='ms__s__a__choice' for="attitude1">
            {{$store.getters.isLightMode ? paw.attitude.choices[0].name : paw.attitude.choices[0].darkName}}
          </label>
          <br>
          <input id="attitude2" type="radio" v-model="attitudeFilter" :value="paw.attitude.choices[1].id">
          <label class='ms__s__a__choice' for="attitude2">
            {{$store.getters.isLightMode ? paw.attitude.choices[1].name : paw.attitude.choices[1].darkName}}
          </label>
          <br>
          <input id="attitude3" type="radio" v-model="attitudeFilter" :value="paw.attitude.choices[2].id">
          <label class='ms__s__a__choice' for="attitude3">
            {{$store.getters.isLightMode ? paw.attitude.choices[2].name : paw.attitude.choices[2].darkName}}
          </label>
          <br>
          <input id="attitude4" type="radio" v-model="attitudeFilter" :value="paw.attitude.choices[3].id">
          <label class='ms__s__a__choice' for="attitude4">
            {{$store.getters.isLightMode ? paw.attitude.choices[3].name : paw.attitude.choices[3].darkName}}
          </label>
        <br>
        </div>
        <div class='matcher-search__sorter__weapon' v-if='paw && paw.weapon && paw.weapon.choices'>
          <h3>Filter by weapon</h3>
          <input id="noW" type="radio" v-model="weaponFilter" :value="null">
          <label for="noW">
            all weapons
          </label>
          <br>
          <input id="weapon1" type="radio" v-model="weaponFilter" :value="paw.weapon.choices[0].id">
          <label class='ms__s__w__choice' for="weapon1">
            {{$store.getters.isLightMode ? paw.weapon.choices[0].name : paw.weapon.choices[0].darkName}}
          </label>
          <br>
          <input id="weapon2" type="radio" v-model="weaponFilter" :value="paw.weapon.choices[1].id">
          <label class='ms__s__w__choice' for="weapon2">
            {{$store.getters.isLightMode ? paw.weapon.choices[1].name : paw.weapon.choices[1].darkName}}
          </label>
          <br>
          <input id="weapon3" type="radio" v-model="weaponFilter" :value="paw.weapon.choices[2].id">
          <label class='ms__s__w__choice' for="weapon3">
            {{$store.getters.isLightMode ? paw.weapon.choices[2].name : paw.weapon.choices[2].darkName}}
          </label>
          <br>
          <input id="weapon4" type="radio" v-model="weaponFilter" :value="paw.weapon.choices[3].id">
          <label class='ms__s__w__choice' for="weapon4">
            {{$store.getters.isLightMode ? paw.weapon.choices[3].name : paw.weapon.choices[3].darkName}}
          </label>
        <br>
        </div>
        <!-- FILTER -->
        <input
          placeholder="Filter by login"
          class="matcher-search__sorter__search-bar"
          v-model="query">
      </div>
      <!-- PROFILE LIST -->
      <div><matcher-list :profiles="profiles"/></div>
      <div class="matcher__button-container">
        <button @click="loadMore" class="matcher__button" :class="{'matcher__button--iddle': noMore}" :disabled='noMore'>{{noMore ? (profiles.length ? "No more" : "No result") : "Load more"}}</button>
      </div>
    </div>
  </transition>
</template>

<script>
import MatcherList from '@/components/matcher/MatcherList';
import Preferences from './Preferences';
import InputWrapper from '@/components/ui-elements/InputWrapper';

export default {
  name: 'Matcher',
  components: {
    'matcher-list': MatcherList,
    'preference-selector': Preferences,
    'input-wrapper': InputWrapper
  },
  props: ['socket'],
  data () {
    return ({
      displayMenu: true,
      query: '',
      sortby: 'noSort',
      attitudeFilter: null,
      weaponFilter: null,
      noMore: false,
    });
  },
  mounted () {
    this.reloadSuggestions();
    this.paw;
  },
  computed: {
    profiles () {
      var array = this.$store.getters.matcher;
      array =
        array
          .filter(item => item.profileSummary.login.toLowerCase().includes(this.query.toLowerCase()))
          .filter(item => {
            if (this.attitudeFilter) {
              return (this.attitudeFilter === item.paw.attitude.id);
            } else {
              return item;
            }
          })
          .filter(item => {
            if (this.weaponFilter) {
              return (this.weaponFilter === item.paw.weapon.id);
            } else {
              return item;
            }
          })
          .sort((a, b) => {
            switch (this.sortby) {
            case 'ageAsc':
              return (b.profile.birthDate - a.profile.birthDate);
            case 'ageDesc':
              return (a.profile.birthDate - b.profile.birthDate);
            case 'loginAsc':
              return (a.profile.login.toLowerCase().localeCompare(b.profile.login.toLowerCase()));
            case 'loginDesc':
              return (b.profile.login.toLowerCase().localeCompare(a.profile.login.toLowerCase()));
            case 'score':
              return (b.score - a.score);
            }
            return (0);
          });
      return array;
    },
    paw () {
      return (this.$store.getters.pawValues);
    }
  },
  methods: {
    reloadSuggestions () {
      this.$store.commit('CLEAR_MATCHER');
      return this.loadMore();
    },
    async loadMore (except) {
      const sug =
        await this.$store.dispatch('loadSuggestions', {
          nbr: '30',
          score: true,
          age: true,
          dist: true,
          like: false,
          view: false,
          matcher: true,
        });
      this.noMore = !sug.length;
    },
    async menuPreferences () {
      this.displayMenu = !this.displayMenu;
      if (this.displayMenu)
        await this.$store.dispatch('getPreferences');
    }
  }
};
</script>

<style lang="css">
  ul {
    list-style: none;
    width: 100%;
    margin: auto;
    padding: 0;
  }
  .matcher-search__list {
    display: block;
    margin: 1em 0 2em;
  }
  .matcher-search__sorter {
    text-align: left;
    margin: auto;
    width: 100%;
    user-select: none;
    max-width: 30em;
  }

  .matcher-search__sorter input[type="radio"] {
    display: none;
  }

  .matcher-search__sorter label {
    padding: .2em;
    cursor: pointer;
    font-weight: normal;
  }

  .matcher-search__sorter input[type="radio"]:checked+label {
    font-weight: bold;
  }

  .matcher-search__sorter input,
  .matcher-search__sorter label {
    display: inline-block;
  }
  .matcher-search__sorter .matcher-search__sorter__search-bar {
    display: block;
    width: 100%;
    border-radius: .2em;
    border: 1px solid var(--accent-color);
    background: var(--contrast-color);
    color: var(--text-color);
    font-size: 1em;
    text-align: center;
    padding: .5em;
    outline: none;
    margin: 1em 0;
    transition: box-shadow 200ms;
  }
  .matcher-search__sorter__search-bar:focus {
    border: 1px solid transparent;
    box-shadow: 0 0 10px rgba(0,0,0,.2);
  }
  .matcher__button-container {
    max-width: 80%;
    margin: auto;
  }
  .matcher__button,
  .matcher__button:disabled,
  .matcher__button:disabled:hover {
    outline: none;
    cursor: pointer;
    border: 2px solid var(--accent-color);
    background-color: transparent;
    border-radius: 50px;
    font-weight: normal;
    font-size: 0.8rem;
    padding: 10px;
    width: 150px;
    color: var(--accent-color);
    transition: font-size 200ms, border-color 200ms, background-color 200ms;
  }
  .matcher__button:hover {
    background-color: var(--accent-color);
    font-weight: bold;
    color: var(--contrast-color);
  }
  .matcher__button:focus {
    border-width: 2px;
    border-color: var(--accent-color);
  }

  .matcher__button:disabled,
  .matcher__button:disabled:hover {
    cursor: default;
    opacity: var(--op);
    border: 0;
    font-size: 1.1em;
  }

  .ms__s__a__choice::before,
  .ms__s__w__choice::before {
    color: var(--em);
    font-weight: normal;
  }
  .ms__s__a__choice::before {
    content: '#attitude ';
  }
  .ms__s__w__choice::before {
    content: '#weapon ';
  }

</style>
