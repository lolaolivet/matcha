<template>
  <div class='container'>
    <div class="img" ref='img'>
      <spin-loader v-if="loading"></spin-loader>
    </div>
  </div>
</template>

<script>
  import Loader from './Loader.vue';

  export default {
    components: {
      'spin-loader': Loader
    },
    props: {
      src: {
        type: [String],
        required: true,
      },
    },
    data () {
      return ({
        loading: true,
      });
    },
    mounted () {
      var image = new Image();
      image.onload = () => {
        const img = this.$refs.img;
        img.style.backgroundImage = `url(${image.src})`;
        this.loading = false;
      };
      image.src = this.src;
    }
  };
</script>

<style scoped >
  .container {
    position: relative;
  }
  .img {
    position: absolute;
    width: 100%;
    height: 100%;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
  }
</style>
