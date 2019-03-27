<template>
  <div
    class='global__alert'
    :class='{
        "global__alert--on": state !== "",
        "global__alert--good": state === "success",
        "global__alert--bad": state === "error"
      }'
    >
    <p>
      {{ state === "success"
          ? msgSuccess
          : msgError }}
      <br>
      <br>
      <button
        class='global__alert__button global__alert__button--no'
        v-if='buttonFaceAction !== ""'
        @click='action()'
        >
        <span>
          Try again
        </span>
      </button>
      <button
        ref='button'
        class='global__alert__button global__alert__button--no'
        @click='dismiss()'
        >
        <span>
          {{ state === "success"
              ? buttonFaceSuccess
              : buttonFaceError }}
        </span>
      </button>
      <!-- <span class='global__alert__btw'>(<em>dépubliez</em> pour si vous souhaitez seulement que l'article ne soit plus en ligne)</span> -->
    </p>
  </div>
</template>

<script>
export default {
  name: 'FormAlert',
  props: {
    state: {
      type: [String],
      required: true,
      default: ''
    },
    msgSuccess: {
      type: [String],
      required: true,
      default: ''
    },
    msgError: {
      type: [String],
      required: true,
      default: ''
    },
    buttonFaceAction: {
      type: [String],
      required: false,
      default: ''
    },
    buttonFaceSuccess: {
      type: [String],
      required: false,
      default: 'Ok'
    },
    buttonFaceError: {
      type: [String],
      required: false,
      default: 'Cancel'
    }
  },
  watch: {
    state (newval, oldval) {
      if (newval !== '') {
        this.$refs.button.focus();
      }
    }
  },
  methods: {
    dismiss () {
      this.state === 'success'
        ? this.$emit('dismiss-success')
        : this.$emit('dismiss-error');
    },
    action () {
      this.$emit('action');
    }
  }
};
</script>
