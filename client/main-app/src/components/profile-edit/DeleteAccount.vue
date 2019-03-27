<template>
  <div class="apopup__box">
    <h4>Type your password here if you really want to delete your account:</h4>
    <form>
      <input-wrapper class="profile-page__form__input">
          <input
            slot="input"
            type="password"
            v-model="passwd"
            name="password"
            placeholder="password"
            required
          >
      </input-wrapper>
    </form>
    <div class="apopup__box__buttons">
      <button class="profile-edit__button"
        @click="$emit('cancel')"
      >
      Cancel
      </button>
      <button class="profile-edit__button"
        @click="$emit('action', passwd)"
      >
      Confirm
      </button>
    </div>
  </div>
</template>

<script>
import InputWrapper from '@/components/ui-elements/InputWrapper';

export default {
  name: 'ProfileEdit',
  components: { 'input-wrapper': InputWrapper },
  props: {
  },
  data () {
    return ({
      passwd: ''
    });
  },
};
</script>

<style>

.apopup__box {
    border: 2px solid var(--accent-color);
    margin: auto;
    font-weight: bold;
    padding: 2em;
    margin-top: 2em;
}

.apopup__box__buttons {
    max-width: 100%;
    margin: auto;
    display: flex;
    justify-content: space-around;
    padding: inherit;
}

</style>