<template>
  <div class="register-page">
    <div class="register-page__form register-page__form--top">
      <h1 class="register-page__form__title">REGISTER 🤝</h1>
    </div>
    <div
      class="register-page__form"
      :class="{'register-page__form--veiled' : veiled}"
      >
      <div class="register-page__form__veil">
        <transition name='load-fade'>
          <form>
            <br>
            <!-- Date of birth -->
            <div class="register-page__form__input register-page__form__input--birthdate" :class="{'register-page__form__input--birthdate--incorrect':displayDobError}">
              <label>Date of birth</label><br>
              <datepicker
                class='register-page__form__input__datepicker'
                placeholder="Select date of Birth"
                v-model="formValues.dob"
                name="dob"
                :incorrect="displayDobError">
              </datepicker>
            </div>
            <br>
            <!-- Gender -->
            <div class="register-page__form__input register-page__form__input--gender" :class="{'register-page__form__input--gender--incorrect':displayGenderError}">
              <select required v-model="formValues.gender">
                <option value="" disabled hidden>gender</option>
                <option>other</option>
                <option>female</option>
                <option>male</option>
              </select>
            </div>
            <br>
            <!-- Firstname -->
            <input-wrapper class="register-page__form__input" :class="{'register-page__form__input--name--incorrect':displayFirstnameError}">
              <input
                slot="input"
                type="text"
                v-model="formValues.firstname"
                name="firstname"
                placeholder="Firstname"
                required
              >
            </input-wrapper>
            <br>
            <!-- Lastname -->
            <input-wrapper class="register-page__form__input" :class="{'register-page__form__input--name--incorrect':displayLastnameError}">
              <input
                slot="input"
                type="text"
                v-model="formValues.lastname"
                name="lastname"
                placeholder="Lastname"
                required
              >
            </input-wrapper>
            <br>
            <!-- Login -->
            <input-wrapper class="register-page__form__input" :class="{'register-page__form__input--name--incorrect':displayLoginError}" :incorrect="displayLoginError">
              <input
                slot="input"
                type="text"
                v-model="formValues.login"
                name="login"
                placeholder="login"
                required
              >
            </input-wrapper>
            <br>
            <!-- Email -->
            <input-wrapper class="register-page__form__input" :class="{'register-page__form__input--email--incorrect':displayEmailError}" :incorrect="displayEmailError">
              <input
                slot="input"
                type="text"
                v-model="formValues.email"
                name="E-mail"
                placeholder="name@email.web"
                required
              >
            </input-wrapper >
            <br>
            <!-- password -->
            <input-wrapper class="register-page__form__input" :class="{'register-page__form__input--password--incorrect':displayPasswError}" :incorrect="displayPasswError">
              <input
                slot="input"
                type="password"
                v-model="formValues.password"
                name="password"
                placeholder="password"
                required
              >
            </input-wrapper>
            <br>
            <!-- password repeat -->
            <input-wrapper class="register-page__form__input" :incorrect="displayPasswRepeatError">
              <input
                slot="input"
                type="password"
                v-model="formValues.passwRepeat"
                name="password"
                placeholder="repeat your password"
                required
              >
            </input-wrapper>
            <br>
            <br>
          </form>
        </transition>
        <form-alert
          @action='dismissAlert("action")()'
          @dismiss-success='dismissAlert("success")()'
          @dismiss-error='dismissAlert("error")()'
          msg-success='Your subscription was successful, please check your emails (:'
          :msg-error='msgErr'
          :state='response'
        >
        </form-alert>
      </div>
    </div>
    <div class="register-page__form register-page__form--end">
      <div class="register-page__form__submit-button-container">
        <button @click="register" class="register-page__form__submit-button" :disabled="!formOk">Sign in !</button>
      </div>
    </div>
  </div>
</template>

<script>
  import InputWrapper from '@/components/InputWrapper';
  import Datepicker from 'vuejs-datepicker';
  import FormAlert from '@/components/FormAlert';
  import validators from '../../../_common/profile-validators';

  export default {
    name: 'Register',
    components: { 'form-alert': FormAlert, 'input-wrapper': InputWrapper, Datepicker },
    data () {
      return {
        formValues: {
          firstname: '',
          lastname: '',
          login: '',
          email: '',
          password: '',
          gender: '',
          dob: new Date(),
          passwRepeat: ''
        },
        response: '',
        msgErr: '',
        veiled: false
      };
    },
    computed: {
      firstnameOk () { return validators.firstnameOk(this.formValues.firstname); },
      lastnameOk () { return validators.lastnameOk(this.formValues.lastname); },
      emailOk () { return validators.emailOk(this.formValues.email); },
      loginOk () { return validators.loginOk(this.formValues.login); },
      dobOk () { return validators.dobOk(this.formValues.dob); },
      genderOk () { return validators.genderOk(this.formValues.gender); },
      passwOk () { return validators.passwOk(this.formValues.password); },
      passwRepeatOk () { return validators.passwRepeatOk(this.formValues.passwRepeat, this.formValues.password); },
      formOk () {
        return (
          this.firstnameOk &&
          this.lastnameOk &&
          this.loginOk &&
          this.dobOk &&
          this.genderOk &&
          this.emailOk &&
          this.passwOk &&
          this.passwRepeatOk
        );
      },
      displayFirstnameError () {
        return (this.formValues.firstname !== '' && !this.firstnameOk); // not empty and not ok
      },
      displayLastnameError () {
        return (this.formValues.lastname !== '' && !this.lastnameOk); // not empty and not ok
      },
      displayEmailError () {
        return (this.formValues.email !== '' && !this.emailOk); // not empty and not ok
      },
      displayLoginError () {
        return (this.formValues.login !== '' && !this.loginOk); // not empty and not ok
      },
      displayDobError () {
        return (!this.dobOk);
      },
      displayGenderError () {
        return (this.formValues.gender !== '' && !this.genderOk); // not empty and not ok
      },
      displayPasswError () {
        return (this.formValues.password !== '' && !this.passwOk); // not empty and not ok
      },
      displayPasswRepeatError () {
        return (this.formValues.password !== '' && this.passwordRepeat !== '' && !this.passwRepeatOk); // not empty and not ok
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
          };
        }
      },
      clearForm () {
        this.formValues = {
          firstname: '',
          lastname: '',
          login: '',
          email: '',
          password: '',
          gender: '',
          dob: new Date(),
          passwRepeat: ''
        };
        this.formErrors = {};
        this.response = '';
        this.msgErr = '';
        this.veiled = false;
      },
      async register () {
        // Create the object to send to server
        if (
          this.formOk
        ) {
          // Request
          let newData = { ...this.formValues };
          newData.dob = newData.dob.getTime();
          let response = await this.$store.dispatch('register', newData);
          if (response.status === 200) {
            this.clearForm();
            this.veiled = true;
            this.response = 'success';
          } else if (response.error) {
            this.veiled = true;
            this.msgErr = response.error;
            this.response = 'error';
          }
        }
      }
    }
  };

</script>

<style lang="css">
  .register-page__form--veiled, .register-page__form--problem, .register-page__form--sent {
    overflow: hidden;
  }
  .register-page__form--problem .register-page__form__problem,
  .register-page__form--sent .register-page__form__sent,
  .register-page__form--veiled .register-page__form__veil {
    visibility: visible;
    opacity: 1;
  }
  .register-page__form__input--birthdate,
  .register-page__form__input.register-page__form__input--gender {
    margin: auto;
    width: 80%;
    position: relative;
  }
  .register-page__form__input--birthdate label {
    color: grey;
  }
  .register-page__form__input--gender select:invalid {
    color: grey;
  }
  .register-page__form__input--gender select {
    border: 2px solid var(--blue-1-dark);
    margin: auto;
    display: inline-block;
    width: 120px;
    cursor: pointer;
  }
  select:-moz-focusring {
    color: transparent;
    text-shadow: 0 0 0 #000;
  }
  .register-page__form__input--birthdate label,
  .register-page__form__input--birthdate .register-page__form__input__datepicker {
    display: inline-block;
    width: 100%;
    text-align: center;
  }
  .register-page__form__input--birthdate .register-page__form__input__datepicker > div > input {
    text-align: center;
    border: 2px solid var(--blue-1-dark);
    cursor: pointer;
  }
  .register-page__form {
    box-shadow: 0 -5px 30px rgba(200, 200, 200, 0.2);
    background-color: white;
    max-width: 700px;
    margin: auto;
    padding: 20px 20px 30px;
    box-sizing: border-box;
  }
  .register-page__form__title {
    text-align: left;
    line-height: 120%;
    margin: 60px 10% 20px;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 2.1rem;
    font-family: 'Avant Garde', sans-serif;
    font-weight: 300;
  }
  .register-page__form--end {
    padding: 30px 20px;
    text-align: right;
  }
  .register-page__form--top {
    position: relative;
  }
  .register-page__form--end {
    height: 100px;
    position: relative;
  }
  @media all and (min-width: 650px) {
    .register-page__form--top {
      border-radius: 5px 5px 0 0;
    }
    .register-page__form--end {
      border-radius: 0 0 5px 5px;
    }
  }
  .register-page__form .register-page__form__submit-button {
    outline: none;
    cursor: pointer;
  }
  .register-page__form .register-page__form__submit-button:disabled,
  .register-page__form .register-page__form__submit-button:disabled:hover {
    cursor: default;
    background-color: inherit;
    color: var(--form-grey);
    font-weight: inherit;
    border-color: var(--form-grey);
  }

  .register-page__form__submit-button-container {
    max-width: 80%;
    margin: auto;
  }
  .register-page__form .register-page__form__submit-button {
    border: 1px solid var(--blue-1-dark);
    background-color: white;
    border-radius: 50px;
    font-size: 0.8rem;
    padding: 10px;
    width: 150px;
    color: var(--blue-1-dark);
    transition: border-color 200ms, background-color 200ms;
  }
  .register-page__form .register-page__form__submit-button:hover {
    border-color: var(--blue-1-dark);
    background-color: var(--blue-1-dark);
    font-weight: bold;
    color: white;
  }
  .register-page__form .register-page__form__submit-button:focus {
    border-width: 2px;
    border-color: var(--blue-1-dark);
  }
  .register-page__form__message {
    width: 80%;
    outline: none;
    border: 2px solid var(--blue-1-dark);
    padding: 5px;
    border-radius: 2px;
    box-sizing: border-box;
    transition: border 200ms;
    margin: 30px 0 0 0;
  }
  .register-page__form__message:focus {
    border: 2px solid var(--blue-1);
  }
  .register-page__form__select {
    padding-top: 30px;
  }
  .register-page__form__input,
  .register-page__form__select {
    width: 80%;
    margin-left: 10%;
    text-align: left;
  }
  .register-page__form input,
  .register-page__form textarea,
  .register-page__form__select label {
    font-size: 0.8rem;
    font-family: Roboto, arial, sans-serif;
  }
  .register-page .global__alert {
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    transform: none;
  }
  .register-page .global__alert button {
    display: inline-block;
  }
  .register-page .global__alert p {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -60%);
  }
  @media all and (min-width: 650px) {
    .register-page.global__alert button {
        margin-right: 20px;
    }
    .register-page .global__alert button:last-of-type {
        margin-right: 0;
    }
  }
  .register-page__form__veil {
    position: relative;
  }
  .register-page__form__input--email--incorrect::after {
    content: 'This is not an email';
    left: 0;
    bottom: -22px;
  }
  .register-page__form__input--password--incorrect::after {
    content: 'Must contain at least 8 characters (uppercase, lowercase and numerals)';
    left: 0;
    bottom: -22px;
  }
  .register-page__form__input--name--incorrect::after {
    content: 'Must contain at most 15 characters (uppercase, lowercase, numerals and _)';
    left: 0;
    bottom: -22px;
  }
  .register-page__form__input--gender--incorrect::after {
    content: 'Please juste say \'other\'...';
    left: 50%;
    top: -20px;
    transform: translate(-50%,0);
  }
  .register-page__form__input--email--incorrect::after,
  .register-page__form__input--gender--incorrect::after,
  .register-page__form__input--birthdate--incorrect::after,
  .register-page__form__input--name--incorrect::after,
  .register-page__form__input--password--incorrect::after {
    position: absolute;
    font-size: x-small;
    color: red;
    font-family: Roboto, arial, sans-serif;
  }
  .register-page__form__input--birthdate--incorrect::after {
    content: 'You must be over 18 to subscribe';
    width: 80%;
    margin-left: 10%;
    text-align: center;
    left: 0;
    font-size: medium;
    top: -30px;
  }

  .vdp-datepicker__calendar {
    left: 50%;
    transform: translate(-50%, 0);
    text-align: left;
  }
  .vdp-datepicker__calendar .cell.selected {
    background: var(--blue-1-dark);
    color: white;
  }
  .vdp-datepicker__calendar .cell:not(.blank):not(.disabled).day:hover,
  .vdp-datepicker__calendar .cell:not(.blank):not(.disabled).month:hover,
  .vdp-datepicker__calendar .cell:not(.blank):not(.disabled).year:hover {
    background: var(--form-grey);
    border: none;
  }
</style>
