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

<style scoped lang='css'>
:root {
  --loader-size: 50px;
  --loader-rotation-time: 4s;
}

.loading {
  width: calc(var(--loader-size) * 1.8);
  height: calc(var(--loader-size) * 1.8);
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 100%;
  background: rgba(0, 0, 0, .3);
}

.loading .planet {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-image: url(/static/img/logos/rock.svg);
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  width: var(--loader-size);
  height: var(--loader-size);
}

.dot {
  position: absolute;
  bottom: -5%;
  left: -5%;
  -webkit-animation: xAxis var(--loader-rotation-time) infinite cubic-bezier(.15,-0.21,1,1);
  animation: xAxis var(--loader-rotation-time) infinite cubic-bezier(.15,-0.21,1,1);
  width: 10%;
  height: 10%;
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
