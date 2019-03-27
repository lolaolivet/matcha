<template>
  <div class='login-page'>
    <div class="login-page__form login-page__form--top">
      <h1 class='login-page__form__title'>Login ❤️</h1>
    </div>
    <div
      class="login-page__form"
      :class="{'login-page__form--veiled' : veiled}"
      >
      <div class="login-page__form__veil">
        <form>
          <br>
          <input-wrapper class='login-page__form__input'>
            <input
              v-on:keydown.enter="focusPwdInput"
              slot='input'
              type="text"
              v-model='identifier'
              name="identifier"
              placeholder="Login or Email"
              >
          </input-wrapper>
          <br>
          <br>
          <input-wrapper class='login-page__form__input'>
            <input
              v-on:keydown.enter="submit"
              ref="pwdInput"
              slot='input'
              type="password"
              v-model='password'
              name="password"
              placeholder="Password"
              >
          </input-wrapper>
          <br>
          <router-link to="/forgot-password">Forgot your password ?</router-link>
        </form>
        <form-alert
          @dismiss-error='dismissAlert()'
          button-face-error='Ok'
          msg-success='""'
          :msg-error='msgErr'
          :state='response'
        >
        </form-alert>
      </div>
    </div>
    <div class='login-page__form login-page__form--end'>
      <div class="login-page__form__submit-button-container">
        <button
          @click.prevent='submit'
          class='login-page__form__submit-button'
          >
          Login
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import InputWrapper from '@/components/InputWrapper';
import FormAlert from '@/components/FormAlert';

export default {
  name: 'Login',
  components: {'input-wrapper': InputWrapper, 'form-alert': FormAlert},
  data () {
    return ({
      identifier: '',
      password: '',
      failKey: '',
      response: '',
      msgErr: '',
      veiled: false
    });
  },
  methods: {
    async submit () {
      if (this.identifier !== '' && this.password !== '') {
        // Log in
        const response = await this.$store.dispatch('login', { identifier: this.identifier, password: this.password });
        if (response.status === 200) {
        // Clear the form
          this.clearForm();
        // Redirect to app
          window.location.pathname = '/app';
        } else if (response.error) {
          // buttonFaceError
          this.showAlert(response.error);
        }
      }
    },
    showAlert (msg) {
      this.veiled = true;
      this.msgErr = msg;
      this.response = 'error';
    },
    dismissAlert () {
      this.veiled = false;
      this.response = '';
    },
    clearForm () {
      this.login = '';
      this.password = '';
      this.response = '';
      this.msgErr = '';
      this.veiled = false;
    },
    focusPwdInput () {
      this.$refs.pwdInput.focus();
    }
  }
};
</script>

<style lang="css">
  .login-page__form--veiled, .login-page__form--problem, .login-page__form--sent {
    max-height: 300px;
    overflow: hidden;
  }
  .login-page__form {
    box-shadow: 0 -5px 30px rgba(200, 200, 200, .2);
    background-color: white;
    max-width: 700px;
    margin: auto;
    padding: 20px 20px 30px;
    box-sizing: border-box;
  }

  .login-page__form a {
    color: black;
  }

  .login-page__form__title {
    text-align: left;
    line-height: 120%;
    margin: 60px 10% 20px;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 2.1rem;
    font-family: 'Avant Garde', sans-serif;
    font-weight: 300;
  }

  .login-page__form--end {
    padding: 30px 20px;
    text-align: right;
  }

  .login-page__form--top {
    position: relative;
  }

  .login-page__form--end {
    height: 100px;
    position: relative;
  }
  .login-page__form .global__alert {
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    transform: none;
  }
  .login-page__form .global__alert button {
    display: inline-block;
  }
  .login-page__form .global__alert p {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -60%);
  }
  @media all and (min-width: 650px) {

    .login-page__form  .global__alert button {
        margin-right: 20px;
    }

    .login-page__form .global__alert button:last-of-type {
        margin-right: 0;
    }

    .login-page__form--top {
      border-radius: 5px 5px 0 0;
    }
    .login-page__form--end {
      border-radius: 0 0 5px 5px;
    }
  }

  .login-page__form .login-page__form__submit-button {
    outline: none;
    cursor: pointer;
  }

  .login-page__form__submit-button-container {
    max-width: 80%;
    margin: auto;
  }

  .login-page__form .login-page__form__submit-button {
    border: 1px solid var(--form-grey);
    background-color: white;
    border-radius: 50px;
    font-size: .8rem;
    padding: 10px;
    width: 150px;
    color: var(--blue-1-dark);
    transition: border-color 200ms, background-color 200ms;
  }
  .login-page__form .login-page__form__submit-button:hover {
    border-color: var(--blue-1-dark);
    background-color: var(--blue-1-dark);
    font-weight: bold;
    color: white;
  }
  .login-page__form .login-page__form__submit-button:focus {
    border-width: 2px;
    border-color: var(--blue-1-dark);
  }

  .login-page__form__message {
    width: 80%;
    outline: none;
    border: 1px solid var(--form-grey);
    padding: 5px;
    border-radius: 2px;
    box-sizing: border-box;
    transition: border 200ms;
    margin: 30px 0 0 0;
  }
  .login-page__form__message:focus {
    border: 2px solid var(--blue-1);
  }

  .login-page__form__select {
    padding-top: 30px;
  }

  .login-page__form__input, .login-page__form__select {
    width: 80%;
    max-width: 400px;
    margin-left: 10%;
    text-align: left;
  }
  .login-page__form input, .login-page__form textarea, .login-page__form__select label {
    font-size: .7rem;
    font-family: Roboto, arial, sans-serif;
  }

  .login-page__form__veil {
    position: relative;
  }
</style>
