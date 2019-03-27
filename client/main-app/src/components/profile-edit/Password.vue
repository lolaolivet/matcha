<template>
  <div class='profile-form'>
    <h3>Change password</h3>
    <div>
      <form>
        <input-wrapper class="profile-page__form__input">
          <input
            slot="input"
            type="password"
            v-model="userInfo.oldPassword"
            name="oldPassword"
            placeholder="current password"
            required
          >
        </input-wrapper>
        <br>
        <input-wrapper class="profile-page__form__input" :class="{'profile-page__form__input--password--incorrect': passwordFail}" :incorrect="passwordFail">
          <input
            slot="input"
            type="password"
            v-model="userInfo.password"
            name="password"
            placeholder="new password"
            required
          >
        </input-wrapper>
        <br>
        <input-wrapper class="profile-page__form__input" :incorrect="passwRepeatFail">
          <input
            slot="input"
            type="password"
            v-model="userInfo.passwRepeat"
            name="password"
            placeholder="repeat new password"
            required
          >
        </input-wrapper>
      </form>
      <div class="profile-edit__button-container">
        <button  v-on:click.prevent="send" :disabled="disableButton" class="profile-edit__button">Change</button>
      </div>
    </div>
  </div>
</template>

<script>
import InputWrapper from '@/components/ui-elements/InputWrapper';
import validators from '../../../../_common/profile-validators';

export default {
  name: 'ProfileEdit',
  components: { 'input-wrapper': InputWrapper },
  data () {
    return ({
      userInfo: {
        oldPassword: '',
        password: '',
        passwRepeat: ''
      },
      response: '',
      msgErr: '',
      msgSucc: '',
      veiled: false
    });
  },
  computed: {
    passwordFail () {
      if (this.userInfo.password) {
        return (!validators.passwOk(this.userInfo.password));
      }
    },
    passwRepeatFail () {
      if (this.userInfo.passwRepeat && this.userInfo.password) {
        return (this.userInfo.password !== this.userInfo.passwRepeat);
      }
    },
    disableButton () {
      return (
        !this.userInfo.oldPassword ||
        !this.userInfo.password ||
        !this.userInfo.passwRepeat ||
        this.passwordFail ||
        this.passwRepeatFail
      );
    }
  },
  methods: {
    send () {
      this.$emit('send', this.userInfo);
    },
  },
};
</script>

<style scoped>
</style>