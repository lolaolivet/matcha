<template>
  <div class='forgot-pwd'>
    <div class="forgot-pwd__form forgot-pwd__form--top">
      <h1 class='forgot-pwd__form__title'>Password reset</h1>
    </div>
    <div
      class="forgot-pwd__form"
      :class="{'forgot-pwd__form--veiled' : veiled}"
      >
      <div class="forgot-pwd__form__veil">
        <form
          v-on:keydown.enter="preventFormAutoSubmition">
          <p>Give us your address we'll send you a password-reset email</p>
          <br>
            <input-wrapper class="forgot-pwd__form__input" 
            :class="{'forgot-pwd__form__input--email--incorrect':displayEmailError}" 
            :incorrect="displayEmailError">
            <input
              v-on:keyup.enter="focusButton"
              slot='input'
              type="email"
              v-model='email'
              name="email"
              placeholder="Your email*"
              required
              >
          </input-wrapper>
          <br>
        </form>
        <form-alert
          @action='dismissAlert("action")()'
          @dismiss-success='dismissAlert("success")()'
          @dismiss-error='dismissAlert("error")()'
          msg-success='You ordered a new password, Please check your emails (:'
          :msg-error='msgErr'
          :state='response'
        >
        </form-alert>
      </div>
    </div>
    <div class='forgot-pwd__form forgot-pwd__form--end'>
      <div class="forgot-pwd__form__submit-button-container">
        <button
          ref="submitButton"
          @click='orderNewPwd'
          class='forgot-pwd__form__submit-button'
          >
          Send
        </button>
      </div>
    </div>
  </div>
  
</template>

<script>
import InputWrapper from '@/components/InputWrapper';
import FormAlert from '@/components/FormAlert';
import * as regex from '../../../_common/regex.js';

export default {
  name: 'ForgotPassword',
  components: {'form-alert': FormAlert, 'input-wrapper': InputWrapper},
  data () {
    return ({
      email: '',
      passw: '',
      failKey: '',
      response: '',
      msgErr: '',
      veiled: false
    });
  },
  computed: {
    emailOk () {
      return (
        (typeof this.email) === 'string' && // should be a string
        this.email !== '' && // should not be an empty string
        this.email.match(regex.email) // is good as an email
      );
    },
    displayEmailError () {
      return (this.email !== '' && !this.emailOk); // not empty and not ok
    }
  },
  methods: {
    dismissAlert (type) {
      switch (type) {
      case 'action':
        return () => {};
      case 'success':
        return () => {
          this.$router.push('/login'); // Redirect there.
          this.veiled = false;
          this.response = '';
        };
      case 'error':
        return () => {
          this.veiled = false;
          this.response = '';
          this.clearForm();
        };
      }
    },
    clearForm () {
      this.email = '';
      this.response = '';
      this.msgErr = '';
      this.veiled = false;
    },
    focusButton (e) {
      this.$refs.submitButton.focus();
    },
    preventFormAutoSubmition (e) {
      e.preventDefault();
    },
    orderNewPwd () {
      if ((this.email.match(regex.email) ? true : undefined) && this.email !== '')
        this.$store.dispatch('newPasswordRequest', { email: this.email.trim() })
          .then((res) => {
            this.clearForm();
            this.veiled = true;
            this.response = 'success';
          })
          .catch((err) => {
            this.veiled = true;
            if ((typeof err) === 'string') {
              this.msgErr = err;
            } else {
              if (err.response.data.code === 404)
                this.msgErr = 'User not Found';
            }
            this.response = 'error';
          });
    }
  }
};
</script>

<style lang="css">

  .forgot-pwd__form {
    box-shadow: 0 -5px 30px rgba(200, 200, 200, .2);
    background-color: white;
    max-width: 700px;
    margin: auto;
    padding: 20px 20px 30px;
    box-sizing: border-box;
  }

  .forgot-pwd__form a {
    color: black;
  }

  .forgot-pwd__form__title {
    text-align: left;
    line-height: 120%;
    margin: 60px 10% 20px;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 2.1rem;
    font-family: 'Avant Garde', sans-serif;
    font-weight: 300;
  }

  .forgot-pwd__form--end {
    padding: 30px 20px;
    text-align: right;
  }

  .forgot-pwd__form--top {
    position: relative;
  }

  .forgot-pwd__form--end {
    height: 100px;
    position: relative;
  }

  .forgot-pwd__form__veil {
    position: relative;
  }

  .forgot-pwd__form--veiled, .forgot-pwd__form--problem, .forgot-pwd__form--sent {
    max-height: 300px;
    overflow: hidden;
  }

  .forgot-pwd__form--problem .forgot-pwd__form__problem,
  .forgot-pwd__form--sent .forgot-pwd__form__sent,
  .forgot-pwd__form--veiled .forgot-pwd__form__veil {
    visibility: visible;
    opacity: 1;
  }

  .forgot-pwd__form__veil .loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  @media all and (min-width: 650px) {
    .forgot-pwd__form--top {
      border-radius: 5px 5px 0 0;
    }
    .forgot-pwd__form--end {
      border-radius: 0 0 5px 5px;
    }
  }

  .forgot-pwd__form .forgot-pwd__form__submit-button {
    outline: none;
    cursor: pointer;
  }

  .forgot-pwd__form__submit-button-container {
    max-width: 80%;
    margin: auto;
  }

  .forgot-pwd__form .forgot-pwd__form__submit-button {
    border: 1px solid var(--form-grey);
    background-color: white;
    border-radius: 50px;
    font-size: .8rem;
    padding: 10px;
    width: 150px;
    color: var(--blue-1-dark);
    transition: border-color 200ms, background-color 200ms;
  }
  .forgot-pwd__form .forgot-pwd__form__submit-button:hover {
    border-color: var(--blue-1-dark);
    background-color: var(--blue-1-dark);
    font-weight: bold;
    color: white;
  }
  .forgot-pwd__form .forgot-pwd__form__submit-button:focus {
    border-width: 2px;
    border-color: var(--blue-1-dark);
  }

  .forgot-pwd__form__message {
    width: 80%;
    outline: none;
    border: 1px solid var(--form-grey);
    padding: 5px;
    border-radius: 2px;
    box-sizing: border-box;
    transition: border 200ms;
    margin: 30px 0 0 0;
  }
  .forgot-pwd__form__message:focus {
    border: 2px solid var(--blue-1);
  }

  .forgot-pwd__form__select {
    padding-top: 30px;
  }

  .forgot-pwd__form__input, .forgot-pwd__form__select {
    width: 80%;
    max-width: 400px;
    margin-left: 10%;
    text-align: left;
  }
  .forgot-pwd__form input, .forgot-pwd__form textarea, .forgot-pwd__form__select label {
    font-size: .7rem;
    font-family: Roboto, arial, sans-serif;
  }

  .forgot-pwd__form__input--email--incorrect::after {
    content: 'This is not an email';
    left: 0;
    bottom: -22px;
  }
  .forgot-pwd__form__input--email--incorrect::after {
    position: absolute;
    font-size: x-small;
    color: red;
    font-family: Roboto, arial, sans-serif;
  }

</style>
