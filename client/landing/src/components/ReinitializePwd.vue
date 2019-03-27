<template>
  <div class='new-pwd'>
    <div class="new-pwd__form new-pwd__form--top">
      <h1 class='new-pwd__form__title'>Réinitialiser le mot de passe</h1>
    </div>
      <div
        class="new-pwd__form"
        :class="{'new-pwd__form--veiled' : veiled}"
      >
        <div class="new-pwd__form__veil">
          <form>
            <br>
            <input-wrapper class='new-pwd__form__input' 
              :class="{'new-pwd__form__input--password--incorrect':displayPasswError}" 
              :incorrect="displayPasswError"
            >
              <input
                slot='input'
                type="password"
                v-model='passw1'
                name="E-mail"
                placeholder="New password"
                >
            </input-wrapper>
            <br>
            <br>
            <input-wrapper class='new-pwd__form__input' 
            :class="{'new-pwd__form__input--password--incorrect':displayPasswError}"
            :incorrect="displayPasswRepeatError"
            >
              <input
                slot='input'
                type="password"
                v-model='passw2'
                name="password"
                placeholder="Repeat new password*"
              >
            </input-wrapper>
            <br>
          </form>
          <form-alert
              @action='dismissAlert("action")()'
              @dismiss-success='dismissAlert("success")()'
              @dismiss-error='dismissAlert("error")()'
              msg-success='Your password has been successfully updated'
              :msg-error='msgErr'
              :state='response'
            >
            </form-alert>
        </div>
      </div>
    <div class='new-pwd__form new-pwd__form--end'>
      <div class="new-pwd__form__submit-button-container">
        <button
          @click='reinitialize'
          class='new-pwd__form__submit-button'
          >
          Reinitialiser
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
  name: 'ReinitializePwd',
  components: { 'form-alert': FormAlert, 'input-wrapper': InputWrapper },
  data () {
    return ({
      passw1: '',
      passw2: '',
      response: '',
      msgErr: '',
      veiled: false
    });
  },
  computed: {
    passwOk () {
      const passwordRgx = regex.password;
      return (
        (typeof this.passw1) === 'string' && // should be a string
        this.passw1 !== '' && // should not be an empty string
        this.passw1.match(passwordRgx) // is good as a password
      );
    },
    passwRepeatOk () {
      return (
        (typeof this.passw2) === 'string' && // should be a string
        this.passw2 !== '' && // should not be an empty string
        this.passw2 === this.passw1 && // should be the same as the password
        this.passwOk // the password itself should be good
      );
    },
    displayPasswError () {
      return (this.passw1 !== '' && !this.passwOk); // not empty and not ok
    },
    displayPasswRepeatError () {
      return (this.passw1 !== '' && this.passw2 !== '' && !this.passwRepeatOk); // not empty and not ok
    }
  },
  methods: {
    reinitialize () {
      var creds = {
        passw1: this.passw1,
        passw2: this.passw2,
        userid: this.$route.query.uid,
        tokenMail: this.$route.query.tid
      };
      if (this.passwOk && this.passwRepeatOk) {
        this.$store.dispatch('reinitializePwd', creds)
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
              else if (err.response.data.code === 4003)
                this.msgErr = 'Passwords don\'t match';
              else if (err.response.data.code === 403)
                this.msgErr = 'Sorry, this link is not valid anymore';
              else if (err.response.data.code === 400)
                this.msgErr = 'Bad request';
            }
            this.response = 'error';
          });
      }
    },
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
      this.passw1 = '';
      this.passw2 = '';
      this.response = '';
      this.msgErr = '';
      this.veiled = false;
    }
  }
};
</script>

<style lang="css">

  .new-pwd__form {
    box-shadow: 0 -5px 30px rgba(200, 200, 200, .2);
    background-color: white;
    max-width: 700px;
    margin: auto;
    padding: 20px 20px 30px;
    box-sizing: border-box;
  }

  .new-pwd__form__title {
    text-align: left;
    line-height: 120%;
    margin: 60px 10% 20px;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 2.1rem;
    font-family: 'Avant Garde', sans-serif;
    font-weight: 300;
  }

  .new-pwd__form--end {
    padding: 30px 20px;
    text-align: right;
  }

  .new-pwd__form--top {
    position: relative;
  }

  .new-pwd__form--end {
    height: 100px;
    position: relative;
  }

  @media all and (min-width: 650px) {
    .new-pwd__form--top {
      border-radius: 5px 5px 0 0;
    }
    .new-pwd__form--end {
      border-radius: 0 0 5px 5px;
    }
  }

  .new-pwd__form .new-pwd__form__submit-button {
    outline: none;
    cursor: pointer;
  }

  .new-pwd__form__submit-button-container {
    max-width: 80%;
    margin: auto;
  }

  .new-pwd__form .new-pwd__form__submit-button {
    border: 1px solid var(--form-grey);
    background-color: white;
    border-radius: 50px;
    font-size: .8rem;
    padding: 10px;
    width: 150px;
    color: var(--blue-1-dark);
    transition: border-color 200ms, background-color 200ms;
  }
  .new-pwd__form .new-pwd__form__submit-button:hover {
    border-color: var(--blue-1-dark);
    background-color: var(--blue-1-dark);
    font-weight: bold;
    color: white;
  }
  .new-pwd__form .new-pwd__form__submit-button:focus {
    border-width: 2px;
    border-color: var(--blue-1-dark);
  }

  .new-pwd__form__message {
    width: 80%;
    outline: none;
    border: 1px solid var(--form-grey);
    padding: 5px;
    border-radius: 2px;
    box-sizing: border-box;
    transition: border 200ms;
    margin: 30px 0 0 0;
  }
  .new-pwd__form__message:focus {
    border: 2px solid var(--blue-1);
  }

  .new-pwd__form__select {
    padding-top: 30px;
  }

  .new-pwd__form__input, .new-pwd__form__select {
    width: 80%;
    max-width: 400px;
    margin-left: 10%;
    text-align: left;
  }
  .new-pwd__form input, .new-pwd__form textarea, .new-pwd__form__select label {
    font-size: .7rem;
    font-family: Roboto, arial, sans-serif;
  }


  .new-pwd__form--veiled, .new-pwd__form--problem, .new-pwd__form--sent {
    max-height: 300px;
    overflow: hidden;
  }
  .new-pwd__form__veil {
    position: relative;
  }

</style>
