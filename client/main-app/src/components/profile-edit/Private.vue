<template>
  <div class='profile-form'>
    <!-- Edit form -->
    <form v-on:submit.prevent>
      <!-- Email -->
      <div>
        <h3>Email</h3>
        <input-wrapper class="profile-form__input" :class="{'profile-form__input--incorrect': emailFail}" :incorrect="emailFail">
          <input
            slot="input"
            type="text"
            v-model="userInfo.email"
            name="E-mail"
            required
          >
        </input-wrapper >
      </div>
    </form>
    <!-- Edit submit button -->
    <div class="profile-edit__button-container">
      <button v-on:click="send" class="profile-edit__button" :disabled="emailFail || disableButton">Save</button>
    </div>
  </div>
</template>

<script>
import InputWrapper from '@/components/ui-elements/InputWrapper';
import validators from '../../../../_common/profile-validators';

export default {
  name: 'ProfileEdit',
  components: { 'input-wrapper': InputWrapper },
  props: {
    'info': {
      type: Object,
    },
  },
  data () {
    return ({
      userInfo: {
        email: '',
      },
      response: '',
      msgErr: '',
      msgSucc: '',
    });
  },
  watch: {
    info (newVal) {
      this.userInfo = { ...newVal };
    },
  },
  computed: {
    disableButton () {
      return (this.userInfo.email === this.info.email);
    },
    emailFail () {
      if (this.userInfo.email !== '') {
        return (!validators.emailOk(this.userInfo.email));
      }
    },
  },
  methods: {
    send () {
      if (!this.emailFail && !this.disableButton) {
        this.$emit('send', this.userInfo);
      }
    },
  },
};
</script>

<style scoped>
</style>