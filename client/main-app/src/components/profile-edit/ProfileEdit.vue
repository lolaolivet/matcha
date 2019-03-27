<template>
  <div class='profile-edit window window--wide'>
    <h1>Images</h1>
    <image-upload></image-upload>
    <h1>Public informations</h1>
    <public-info :info='publicInfo' :initial='initial.publicInfo' :minimal='minimal' @send='sendPublicInfo'></public-info>
    <h1 v-if='!minimal'>Location</h1>
    <google-map @send='logPlace'></google-map>
    <h1 v-if='!minimal'>Private informations</h1>
    <private-info v-if='!minimal' :info='privateInfo' @send='sendPrivateInfo'></private-info>
    <h1 v-if='!minimal'>Change password</h1>
    <password-edit v-if='!minimal' :info='password' @send='sendPassword'></password-edit>
    <h1 v-if='!minimal'>Account</h1>
    <div v-if='!minimal'>
      <h3 class="pe___delete-account" :class='{"pe___delete-account--open" : popUpConfirmation}' v-on:click="askDeleteAccount">Delete Account</h3>
      <delete-account 
        v-if="popUpConfirmation === true"
        @action="deleteAccount"
        @cancel="askDeleteAccount"
        >
      </delete-account>
    </div>
  </div>
</template>


<script>
  import Private from './Private.vue';
  import ImageUploadVue from './ImageUpload.vue';
  import DeleteAccount from './DeleteAccount.vue';
  import Public from './Public.vue';
  import Password from './Password.vue';
  import GoogleMap from './GoogleMap';
  
  import validators from '../../../../_common/profile-validators';
  export default {
    components: {
      'image-upload': ImageUploadVue,
      'private-info': Private,
      'public-info': Public,
      'password-edit': Password,
      'google-map': GoogleMap,
      'delete-account': DeleteAccount,
    },
    props: {
      'minimal': {
        type: Boolean,
        default: false,
      }
    },
    data () {
      return ({
        initial: {
          publicInfo: {
            firstname: '',
            lastname: '',
            login: '',
            gender: '',
            bio: '',
            birthDate: '',
          },
          privateInfo: {
            email: '',
          },
        },
        publicInfo: {
          firstname: '',
          lastname: '',
          login: '',
          gender: '',
          bio: '',
          birthDate: '',
        },
        privateInfo: {
          email: '',
        },
        password: {
          oldPassword: '',
          password: '',
          passwRepeat: '',
        },
        veiled: false,
        popUpConfirmation: false,
        confirmationPwd: '',
      });
    },
    computed: {
      userInfosProfile () {
        return ({
          ...this.publicInfo,
          ...this.privateInfo,
          ...this.password,
        });
      },
      firstnameFail () {
        if (
          this.publicInfo.firstname !== '' &&
          this.publicInfo.firstname !== undefined
        ) {
          return (!validators.firstnameOk(this.publicInfo.firstname));
        }
      },
      lastnameFail () {
        if (
          this.publicInfo.lastname !== '' &&
          this.publicInfo.lastname !== undefined
        ) {
          return (!validators.lastnameOk(this.publicInfo.lastname));
        }
      },
      loginFail () {
        if (this.publicInfo.login !== '') {
          return (!validators.loginOk(this.publicInfo.login));
        }
      },
      bioFail () {
        if (this.publicInfo.bio !== '') {
          return (!validators.bioOk(this.publicInfo.bio));
        }
      },
      birthDateFail () {
        const date = this.publicInfo.birthDate;
        return (!validators.dobOk(date));
      },
      genderFail () {
        if (this.publicInfo.gender !== '') {
          return (!validators.genderOk(this.publicInfo.gender));
        }
      },
      emailFail () {
        if (this.privateInfo.email !== '') {
          return (!validators.emailOk(this.privateInfo.email));
        }
      },
      passwordFail () {
        if (this.password.password) {
          return (!validators.passwOk(this.password.password));
        }
      },
      passwRepeatFail () {
        if (this.password.passwRepeat && this.password.password) {
          return (this.password.password !== this.password.passwRepeat);
        }
      },
      allOk () {
        return (
          !this.loginFail &&
          !this.firstnameFail &&
          !this.lastnameFail &&
          !this.birthDateFail &&
          !this.genderFail &&
          !this.emailFail &&
          !this.passwordFail &&
          !this.passwRepeatFail
        );
      }
    },
    async beforeMount () {
      await this.loadUser();
    },
    methods: {
      async loadUser () {
        const data = await this.$store.dispatch('getProfileInfos');
        this.publicInfo = {
          firstname: data.firstname,
          lastname: data.lastname,
          birthDate: this.setBirthday(data.birthDate),
          login: data.login,
          gender: data.gender,
          bio: data.bio,
        };
        this.initial.publicInfo = {
          ...this.publicInfo,
        };
        this.privateInfo = {
          email: data.email,
        };
        this.initial.privateInfo = {
          ...this.privateInfo,
        };
        await this.$store.dispatch('saveLocation', data.location);
      },
      setBirthday (date) {
        // transforms a timestamp into a Date
        // to not display the timestamp in placeholder
        date = new Date(date);
        return date;
      },
      sendPublicInfo (infos) {
        this.publicInfo = { ...infos };
        this.updateProfileInfos();
      },
      sendPrivateInfo (infos) {
        this.privateInfo = { ...infos };
        this.updateProfileInfos();
      },
      sendPassword (infos) {
        this.password = { ...infos };
        this.updatePassword();
      },
      async updateProfileInfos () {
        if (this.allOk) {
          const newEmail = this.userInfosProfile.email;
          let newData = this.userInfosProfile;
          newData.birthDate = newData.birthDate ? newData.birthDate.getTime() : undefined;
          // Request
          const res = await this.$store.dispatch('putProfileInfos', newData);
          if (res && newEmail !== res.email) {
            this.privateInfo = {
              email: res.email
            };
            this.$store.dispatch('temporaryFlag', { message: 'Please check you emails, your new address will be updated after you validate it', type: 'positive' });
          }
        }
      },
      updatePassword () {
        if (!this.passwordFail &&
            !this.passwRepeatFail &&
            this.userInfosProfile.password &&
            this.userInfosProfile.passwRepeat) {
          let newData = {
            old: this.userInfosProfile.oldPassword,
            passw1: this.userInfosProfile.password,
            passw2: this.userInfosProfile.passwRepeat,
            userid: this.$store.getters.userid,
            tokenMail: ''
          };
          this.$store.dispatch('reinitializePwd', newData);
        }
      },
      async logPlace (marker) {
        const coordinates = {
          latitude: marker.lat,
          longitude: marker.lng
        };
        const creds = {
          userid: this.$store.getters.userid,
          coordinates
        };

        await this.$store.dispatch('postLocationLog', creds);
        await this.$store.dispatch('saveLocation', coordinates);
        await this.$store.commit('CLEAR_SUGGESTIONS');
      },
      askDeleteAccount () {
        // confirmation pop up
        this.popUpConfirmation = !this.popUpConfirmation;
      },
      async deleteAccount (password) {
        this.$store.dispatch('deleteAccount', password);
      }
    },
  };
</script>

<style>

.pe__form
.pe__form--veiled
.pe__form__veiled {
  position: relative;
}

form input, form textarea, form button, form select {
  font-size: .8em;
}
  .pe___delete-account {
    cursor: pointer;    
  }
  .pe___delete-account::after {
    display: inline-block;
    content: "⌃";
    position: relative;
    padding-left: .2em;
    top: .2em;
  }
  .pe___delete-account--open::after {
    content: " ⌃";
    position: relative;
    top: -.2em;
    transform: scaleY(-1);
  }
  .profile-edit {
    text-align: left;
    margin: 1em auto 3em;
  }
  .profile-edit h1 {
    margin: 2em auto .8em;
  }
  .profile-edit h1:first-of-type {
    margin: 0 auto .8em;
  }
  .profile-edit__button-container {
    max-width: 80%;
    text-align: right;
    margin-left: auto;
  }
  .profile-edit__button {
    margin: 1em auto;
  }
  .profile-edit__button,
  .profile-edit__button:disabled,
  .profile-edit__button:disabled:hover {
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
    transition: border-color 200ms, background-color 200ms;
  }
  .profile-edit__button:hover {
    background-color: var(--accent-color);
    font-weight: bold;
    color: var(--contrast-color);
  }
  .profile-edit__button:focus {
    border-width: 2px;
    border-color: var(--accent-color);
  }
  .profile-edit__button:disabled,
  .profile-edit__button:disabled:hover {
    cursor: default;
    opacity: var(--op);
  }


</style>
