<template>
  <div class='profile-form'>
    <!-- Edit form -->
    <form>
      <!-- Gender -->
      <h3 v-if='!minimal'>Gender</h3>
      <select v-if='!minimal' v-model="userInfo.gender" class='pf__gender'>
        <option>other</option>
        <option>female</option>
        <option>male</option>
      </select>
      <!-- Birthdate -->
      <h3 v-if='!minimal'>Date of birth</h3>
      <div v-if='!minimal' class="form_legend-input profile-page__form__age" :class="{'profile-page__form__input--birthDate--incorrect': birthDateFail}">
        <datepicker
          v-model="userInfo.birthDate"
          name="birthDate"
          required
          :incorrect="birthDateFail"
          >
        </datepicker>
      </div>
      <!-- Login -->
      <h3 v-if='!minimal'>Login</h3>
      <input-wrapper
        v-if='!minimal'
        class="profile-page__form__input"
        :class="{'profile-page__form__input--name--incorrect': loginFail}" :incorrect="loginFail"
      >
        <input
          slot="input"
          type="text"
          v-model="userInfo.login"
          name="login"
          placeholder="Login"
          required
        >
      </input-wrapper>
      <!-- Firstname -->
      <h3>Firstname</h3>
      <input-wrapper class="profile-page__form__input" :class="{'profile-page__form__input--name--incorrect': firstnameFail}" :incorrect="firstnameFail">
        <input
          slot="input"
          type="text"
          v-model="userInfo.firstname"
          name="firstname"
          placeholder="Firstname"
          required
        >
      </input-wrapper>
      <!-- Lastname -->
      <h3>Lastname</h3>
      <input-wrapper class="profile-page__form__input" :class="{'profile-page__form__input--name--incorrect': lastnameFail}" :incorrect="lastnameFail">
        <input
          slot="input"
          type="text"
          v-model="userInfo.lastname"
          name="lastname"
          placeholder="Lastname"
          required
        >
      </input-wrapper>
      <!-- Bio -->
      <h3 class="form_legend-input">A few words for your profile</h3>
      <textarea class='profile-page__form__biography' 
        v-model='userInfo.bio' 
        :min-height="100" 
        name="biography" 
        placeholder="Tell us about you (:"
        maxlength="600"
      ></textarea>
    </form>
    <!-- Edit submit button -->
    <div class="profile-edit__button-container">
      <button  v-on:click.prevent="send" :disabled='disableButton' class="profile-edit__button">Save</button>
    </div>
  </div>
</template>

<script>
import InputWrapper from '@/components/ui-elements/InputWrapper';
import Datepicker from 'vuejs-datepicker';
import validators from '../../../../_common/profile-validators';

export default {
  name: 'ProfileEdit',
  components: { 'input-wrapper': InputWrapper, Datepicker },
  props: {
    'minimal': {
      type: Boolean,
      default: false,
    },
    'info': {
      type: Object,
    },
  },
  data () {
    return ({
      userInfo: {
        login: '',
        firstname: '',
        lastname: '',
        birthDate: '',
        gender: '',
        bio: '',
      },
    });
  },
  computed: {
    disableButton () {
      return (
        (
          this.userInfo.login === '' ||
          this.userInfo.firstname === '' ||
          this.userInfo.lastname === '' ||
          this.userInfo.gender === '' ||
          this.userInfo.bio === ''
        ) || (
          this.userInfo.login === this.info.login &&
          this.userInfo.firstname === this.info.firstname &&
          this.userInfo.lastname === this.info.lastname &&
          this.info.birthDate instanceof Date &&
          this.userInfo.birthDate.getTime() === this.info.birthDate.getTime() &&
          this.userInfo.gender === this.info.gender &&
          this.userInfo.bio === this.info.bio
        ) || (
          this.firstnameFail ||
          this.lastnameFail ||
          this.loginFail ||
          this.bioFail ||
          this.birthDateFail ||
          this.genderFail
        )
      );
    },
    firstnameFail () {
      if (
        this.userInfo.firstname !== '' &&
        this.userInfo.firstname !== undefined
      ) {
        return (!validators.firstnameOk(this.userInfo.firstname));
      }
    },
    lastnameFail () {
      if (
        this.userInfo.lastname !== '' &&
        this.userInfo.lastname !== undefined
      ) {
        return (!validators.lastnameOk(this.userInfo.lastname));
      }
    },
    loginFail () {
      if (this.userInfo.login !== '') {
        return (!validators.loginOk(this.userInfo.login));
      }
    },
    bioFail () {
      if (this.userInfo.bio !== '') {
        return (!validators.bioOk(this.userInfo.bio));
      }
    },
    birthDateFail () {
      const date = this.userInfo.birthDate;
      return (!validators.dobOk(date));
    },
    genderFail () {
      if (this.userInfo.gender !== '') {
        return (!validators.genderOk(this.userInfo.gender));
      }
    },
  },
  watch: {
    info (newVal) {
      this.userInfo = { ...newVal };
    },
  },
  methods: {
    send () {
      if (!this.disableButton) {
        this.$emit('send', this.userInfo);
      }
    },
  }
};
</script>

<style scoped>
.profile-page__form__biography {
  width: 100%;
  outline: none;
  transition: border 200ms;
  border: 2px solid var(--accent-color);
  height: 10em;
}
.profile-page__form__biography:focus {
  border: 2px solid transparent;
}
</style>