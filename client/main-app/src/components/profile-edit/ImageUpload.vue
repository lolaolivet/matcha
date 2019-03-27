<template>
  <div>
    <div class='img-upload'>
      <div
        v-for="src in sources"
        :key="src"
        class='img-upload__elem'
      >
        <div
          class='img-upload__elem__button'
        >
          <button-switch
            v-if="src"
            :state='src === main ? "on" : "off"'
            @switchOn='() => makeMain(src)'
            message-on='main'
            message-off='make main'
            :disabled="pendingMainRequest || deleting.includes(src) || $store.state.localLoading"
          >
          </button-switch>
        </div>

        <img-elem
          @add='upload'
          @remove='() => pressDelete(src)'
          :src='src'
          width='10em'
          height='10em'
          :disabled="deleting.includes(src) || $store.state.localLoading"
          :locked="src !== '' && main === src"
        ></img-elem>
      </div>
      <input
        type="file"
        name="pic"
        accept="image/x-png, image/jpeg"
        ref="input"
        class='img-upload__input'
        @change='processFile'
      >
    </div>
  </div>
</template>

<script>
  import ImgElem from './ImgElem';
  import ButtonSwitch from './ButtonSwitch';

  export default {
    components: {
      'img-elem': ImgElem,
      'button-switch': ButtonSwitch,
    },
    data () {
      return ({
        deleting: [],
        pendingMainRequest: false
      });
    },
    computed: {
      main () {
        return (this.$store.getters.mainImageSource);
      },
      sources () {
        const sources = this.$store.getters.imageSources;
        return (sources.length < 5 ? sources.concat(['']) : sources);
      },
    },
    mounted () {
      this.fetch();
    },
    methods: {
      fetch () {
        this.$store.dispatch('fetchImages');
      },
      removeSrc (src) {
        this.sources = this.sources.filter(el => el !== src);
        if (this.sources.length < 5 && this.sources.indexOf('') === -1) {
          this.sources = this.sources.concat(['']);
        }
      },
      // When the image input receives files
      async processFile (event) {
        // Check that the input is full
        if (event.target.files.length > 0) {
          // Consider only the first file
          var file = event.target.files[0];
          try {
            // Send the file
            const sources = await this.sendImage(file);
            // Save new sources
            this.saveSources(sources);
            // Clear the input no matter what
            this.$refs.input.value = '';
          } catch (error) {
            // Clear the input no matter what
            this.$refs.input.value = '';
          }
        }
      },
      upload () {
        if (!this.$store.state.localLoading) {
          this.$refs.input.click();
        }
      },
      sendImage (file) {
        return (this.$store.dispatch('sendImages', [file]));
      },
      pressDelete (src) {
        if (this.deleting.includes(src)) { return; }
        // Ask confirmation with flag
        this.$store.dispatch('showFlag', {
          type: 'positive',
          message: 'Are you sure you want to delete this picture',
          button: {
            message: 'Yes',
            fn: (done) => { this.deleteImage(src); done(); return; },
          },
        });
      },
      async deleteImage (src) {
        this.deleting = this.deleting.concat([src]);
        // Request delete
        await this.$store.dispatch('deleteImage', src);
        this.deleting = this.deleting.filter(s => s !== src);
      },
      async makeMain (src) {
        this.pendingMainRequest = true;
        await this.$store.dispatch('imageChooseMain', src);
        this.pendingMainRequest = false;
      },
    },
  };
</script>

<style scoped>
  .img-upload {
    text-align: left;
    max-width: 36em;
    margin: auto;
  }
  .img-upload__elem {
    padding-top: 1.5em;
    position: relative;
    margin: 1em;
    display: inline-block;
  }
  .img-upload__elem__button {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    /*  */
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .img-upload__input {
    display: none;
  }
</style>