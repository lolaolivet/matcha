<template>
  <div class='contact-page'>
    <div class="contact-page__form contact-page__form--top">
      <h1 class='contact-page__form__title'>Nous<br>contacter</h1>
    </div>
    <div
      class="contact-page__form"
      :class="{'contact-page__form--veiled' : veiled}"
      >
      <div class="contact-page__form__veil">
        <div
          class='global__alert'
          :class='{
              "global__alert--on": response !== "",
              "global__alert--good": response === "ok",
              "global__alert--bad": response === "problem"
            }'
          >
          <p>
            {{ response === "ok"
                ? "Votre message a été envoyé avec succès."
                : "Un problème est survenu lors de l'envoi de votre message." }}
            <br>
            <br>
            <button
              class='global__alert__button global__alert__button--no'
              v-if='response === "problem"'
              @click='send()'
              >
              <span>
                Réessayer
              </span>
            </button>
            <button
              class='global__alert__button global__alert__button--no'
              @click='unveil()'
              >
              <span>
                {{ response === "ok"
                    ? "Ok"
                    : "Annuler" }}
              </span>
            </button>
            <!-- <span class='global__alert__btw'>(<em>dépubliez</em> pour si vous souhaitez seulement que l'article ne soit plus en ligne)</span> -->
          </p>
        </div>
        <transition name='load-fade'>
          <div class='loading' v-if='$store.state.localLoading'>
            <div class='planet'>
              <div class='dot'></div>
            </div>
          </div>
        </transition>
      </div>
      <form class="" action="" method="post">
        <div>
          <br>
          <input-wrapper class='contact-page__form__input' :class="{'contact-page__form__input--email--incorrect': emailFail}" :incorrect='emailFail'>
            <input slot='input' type="text" name="" value="" v-model='email' placeholder="Votre email*" required>
          </input-wrapper>
          <br>
          <br>
          <input-wrapper class='contact-page__form__input'>
            <input slot='input' type="text" name="" value="" v-model='subject' placeholder="Sujet" required>
          </input-wrapper>
          <div class='contact-page__form__message__container' :class='{"contact-page__form__message__container--incorrect": contentFail}'>
            <textarea-autosize class='contact-page__form__message' :min-height="100" name="name" v-model='content' placeholder="Message*" required></textarea-autosize>
          </div>
        </div>
        <div class='contact-page__form__select'>
          <label>De quoi s'agit-il ?</label>
          <div>
            <input type='radio' v-model="contact" value="project" ref='selectedRadio' id='radio-project'>
            <label for="radio-project">Proposition de projet artistique</label>
          </div>
          <div>
            <input type='radio' v-model="contact" value="pro" id='radio-pro'>
            <label for="radio-pro">Partenariat</label>
          </div>
          <div>
            <input type='radio' v-model="contact" value="press" id='radio-press'>
            <label for="radio-press">Presse</label>
          </div>
          <div>
            <input type='radio' v-model="contact" value="love" id='radio-love'>
            <label for="radio-love">Envoyer de l'amour</label>
          </div>
        </div>
      </form>
    </div>
    <div class='contact-page__form contact-page__form--end'>
      <div class="contact-page__form__submit-button-container">
        <button class='contact-page__form__submit-button' type="button" name="button" @click='send()' :disabled='veiled'>Envoyer</button>
      </div>
    </div>
  </div>
</template>

<script>
// import { loadingOnOff } from '@/components/mixins/loaderMethods';
import { localLoading } from '@/components/mixins/loaderMethods';
import InputWrapper from '@/components/InputWrapper';
import AutoResize from '@/components/TextareaAutoResize';

export default {
  components: {'input-wrapper': InputWrapper, 'textarea-autosize': AutoResize},
  watch: {
    email (newVal) {
      this.email = this.escHTML(this.email);
      this.validateEmail();
    },
    contact (newVal) {
      this.contact = this.escHTML(this.contact);
    },
    content (newVal) {
      this.content = this.escHTML(this.content);
      if (this.contentFail)
        this.validateContent();
    },
    subject (newVal) {
      this.content = this.escHTML(this.content);
    }
  },
  data () {
    return ({
      email: this.$store.state.isLoggedIn ? localStorage.getItem('email') : '',
      emailFail: false,
      contact: 'love',
      content: '',
      contentFail: false,
      subject: '',
      veiled: false,
      response: ''
    });
  },
  mixins: [localLoading],
  methods: {
    escHTML (str) {
      return (str.replace(/</g, '﹤').replace(/>/g, '﹥'));
    },
    validateForm () {
      this.validateContent();
      this.validateEmail();
      return (!this.emailFail && !this.contentFail);
    },
    validateContent () {
      this.contentFail = this.content === '';
    },
    validateEmail () {
      var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      this.emailFail = !re.test(this.email);
    },
    clearForm () {
      this.contact = 'global';
      this.content = '';
      this.subject = '';
      this.emailFail = false;
      this.contentFail = false;
    },
    unveil () {
      this.veiled = false;
      this.clearForm();
      this.response = '';
    },
    send () {
      // if (this.validateForm()) {
      //   this.localLoadingOn();
      //   this.response = '';
      //   this.veiled = true;
        // delegate to the store
        // this.axios.post(config.serverURL + '/mail', {
        //   email: this.email,
        //   contact: this.contact,
        //   content: this.content,
        //   subject: this.subject
        // })
        // .then((res) => {
        //   this.localLoadingOff();
        //   this.response = 'ok';
        // })
        // .catch((res) => {
        //   setTimeout(() => {
        //     this.localLoadingOff();
        //     this.response = 'problem';
        //   }, 1000);
        // });
      // }
    }
  }
};
</script>

<style lang="css">

  .contact-page__form {
    position: relative;
    box-shadow: 0 -5px 30px rgba(200, 200, 200, .2);
    background-color: white;
    max-width: 700px;
    max-height: 1000px;
    margin: auto;
    padding: 20px 20px 30px;
    box-sizing: border-box;
    transition: max-height 400ms ease-in-out;
  }

  .contact-page .global__alert {
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    transform: none;
  }

  .contact-page .global__alert button {
    display: inline-block;
  }

  .contact-page .global__alert p {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -60%);
  }

  .contact-page__form__veil, .contact-page__form__problem, .contact-page__form__sent {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: white;
    z-index: 1;
    visibility: hidden;
    opacity: 0;
    transition: opacity 200ms, visibility 200ms;
  }

  .contact-page__form__veil .loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .contact-page__form--veiled, .contact-page__form--problem, .contact-page__form--sent {
    max-height: 300px;
    overflow: hidden;
  }

  .contact-page__form--problem .contact-page__form__problem,
  .contact-page__form--sent .contact-page__form__sent,
  .contact-page__form--veiled .contact-page__form__veil {
    visibility: visible;
    opacity: 1;
  }

  .contact-page__form__title {
    text-align: left;
    line-height: 120%;
    margin: 60px 10% 20px;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 2.1rem;
    font-family: "Avant Garde", sans-serif;
    font-weight: 300;
  }

  .contact-page__form--end {
    padding: 30px 20px;
    text-align: right;
    height: 100px;
    position: relative;
    z-index: 2;
  }

  .contact-page__form--top {
    position: relative;
    z-index: 2;
  }

  @media all and (min-width: 650px) {
    .contact-page__form--top {
      border-radius: 5px 5px 0 0;
    }
    .contact-page__form--end {
      border-radius: 0 0 5px 5px;
    }
    .contact-page .global__alert button {
      margin-right: 20px;
    }
    .contact-page .global__alert button:last-of-type {
      margin-right: 0;
    }
  }

  .contact-page__form .contact-page__form__submit-button {
    outline: none;
    cursor: pointer;
  }
  .contact-page__form .contact-page__form__submit-button:disabled,
  .contact-page__form .contact-page__form__submit-button:disabled:hover {
    cursor: default;
    background-color: inherit;
    color: var(--form-grey);
    font-weight: inherit;
    border-color: var(--form-grey);
  }

  .contact-page__form__submit-button-container {
    max-width: 80%;
    margin: auto;
  }

  .contact-page__form .contact-page__form__submit-button {
    border: 1px solid var(--form-grey);
    background-color: white;
    border-radius: 50px;
    font-size: 1rem;
    padding: 10px;
    width: 150px;
    color: var(--blue-1-dark);
    transition: border-color 200ms, background-color 200ms;
  }
  .contact-page__form .contact-page__form__submit-button:hover {
    border-color: var(--blue-1-dark);
    background-color: var(--blue-1-dark);
    font-weight: bold;
    color: white;
  }
  .contact-page__form .contact-page__form__submit-button:focus {
    border-width: 2px;
    border-color: var(--blue-1-dark);
  }

  .contact-page__form__message {
    width: 80%;
    outline: none;
    border: 1px solid var(--form-grey);
    padding: 5px;
    border-radius: 2px;
    box-sizing: border-box;
    transition: border 200ms;
    margin: 30px 0 0 0;
  }
  .contact-page__form__message:focus {
    border: 2px solid var(--blue-1);
  }
  .contact-page__form__message__container--incorrect .contact-page__form__message {
    border-color: red;
  }
  .contact-page__form__message__container {
    position: relative;
  }
  .contact-page__form__message__container--incorrect::after {
    content: 'Ne peut pas être vide.';
    bottom: -12px;
    left: 10%;
  }
  .contact-page__form__input--email--incorrect::after {
    content: 'Email incorrect';
    left: 0;
    bottom: -22px;
  }
  .contact-page__form__input--email--incorrect::after,
  .contact-page__form__message__container--incorrect::after {
    position: absolute;
    font-size: x-small;
    color: red;
    font-family: Roboto, arial, sans-serif;
  }

  .contact-page__form__select {
    padding-top: 30px;
  }

  .contact-page__form__input, .contact-page__form__select {
    width: 80%;
    max-width: 400px;
    margin-left: 10%;
    text-align: left;
  }
  .contact-page__form input, .contact-page__form textarea, .contact-page__form__select label, .contact-page__form__select strong {
    font-size: .8rem;
    font-family: Roboto, arial, sans-serif;
  }
  .contact-page__form__select div {
    margin: 5px 0;
  }
  .contact-page__form__select div:first-of-type {
    margin-top: 10px;
  }
  .contact-page__form__select strong {
    font-weight: bold;
  }

</style>
