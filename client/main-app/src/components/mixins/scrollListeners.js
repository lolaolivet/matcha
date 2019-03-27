export const scrollListener = {
  data () {
    return {
      scrolledY: false,
      scrolledX: false
    };
  },
  methods: {
    handleScroll (event) {
      this.scrolledY = window.scrollY > 0;
      this.scrolledX = window.scrollX > 0;
    }
  },
  beforeMount () {
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeDestroy () {
    window.removeEventListener('scroll', this.handleScroll);
  }
};

export const preventScrollDefault = {
  methods: {
    preventDefault (e) {
      e = e || window.event;
      if (e.preventDefault)
        e.preventDefault();
      e.returnValue = false;
    },
    disableScroll () {
      if (window.addEventListener) // older FF
        window.addEventListener('DOMMouseScroll', this.preventDefault, false);
      window.onwheel = this.preventDefault; // modern standard
      window.onmousewheel = document.onmousewheel = this.preventDefault; // older browsers, IE
      window.ontouchmove = this.preventDefault; // mobile
    },
    enableScroll () {
      if (window.removeEventListener)
        window.removeEventListener('DOMMouseScroll', this.preventDefault, false);
      window.onmousewheel = document.onmousewheel = null;
      window.onwheel = null;
      window.ontouchmove = null;
    }
  }
};
