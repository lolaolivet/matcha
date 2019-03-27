<template>
  <div class='loading'>
    <div class='planet'>
      <div class='dot'></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Test'
};
</script>

<style lang='css'>
:root {
  --loader-size: 2rem;
  --loader-rotation-time: 2s;
}

.loading {
  width: calc(var(--loader-size) * 1.8);
  height: calc(var(--loader-size) * 1.8);
  border-radius: 100%;
  background: rgba(0, 0, 0, .3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9;
}

.loading .planet {
  position: relative;
  top: -3%;
  transform: rotate(45deg);
  background-image: url(/app/static/img/logos/heart-rotate.svg);
  background-repeat: no-repeat;
  background-position: center;
  background-size: 90%;
  width: var(--loader-size);
  height: var(--loader-size);
}

.dot {
  position: absolute;
  bottom: -17%;
  left: -6%;
  -webkit-animation: xAxis var(--loader-rotation-time) infinite cubic-bezier(.15,-0.21,1,1);
  animation: xAxis var(--loader-rotation-time) infinite cubic-bezier(.15,-0.21,1,1);
  width: 20%;
  height: 20%;
}

.dot::after {
  content: '';
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 100%;
  background-color: #fff;
  -webkit-animation: yAxis var(--loader-rotation-time) infinite cubic-bezier(0,0,.82,1.16);
  animation: yAxis var(--loader-rotation-time) infinite cubic-bezier(0,0,.82,1.16);
}

@-webkit-keyframes yAxis {
  50% {
    -webkit-animation-timing-function: cubic-bezier(0,0,.82,1.16);
    animation-timing-function: cubic-bezier(0,0,.82,1.16);
    -webkit-transform: translateY(calc(var(--loader-size) * -1));
    transform: translateY(calc(var(--loader-size) * -1));
  }
}

@keyframes yAxis {
  50% {
    -webkit-animation-timing-function: cubic-bezier(0,0,.82,1.16);
    animation-timing-function: cubic-bezier(0,0,.82,1.16);
    -webkit-transform: translateY(calc(var(--loader-size) * -1));
    transform: translateY(calc(var(--loader-size) * -1));
  }
}

@-webkit-keyframes xAxis {
  50% {
    -webkit-animation-timing-function: cubic-bezier(.15,-0.21,1,1);
    animation-timing-function: cubic-bezier(.15,-0.21,1,1);
    -webkit-transform: translateX(var(--loader-size));
    transform: translateX(var(--loader-size));
  }
}

@keyframes xAxis {
  50% {
    -webkit-animation-timing-function: cubic-bezier(.15,-0.21,1,1);
    animation-timing-function: cubic-bezier(.15,-0.21,1,1);
    -webkit-transform: translateX(var(--loader-size));
    transform: translateX(var(--loader-size));
  }
}
</style>
