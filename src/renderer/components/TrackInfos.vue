<template>
  <div class="track-infos">
    <div>
      <h1 v-if="title">{{ title }}</h1>
      <h2 v-if="subtitle">{{ subtitle }}</h2>
    </div>
  </div>
</template>

<script>
  export default {

    name: 'TrackInfos',

    props: {
      title: String,
      subtitle: String
    }

  }
</script>

<style lang="scss">
  .track-infos {
    width: 100vw;
    height: 100vh;
    background-color: rgba(51, 51, 51, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    h1 {
      font-size: 16px;
      color: #fff;
      font-weight: 300;
    }
    h2 {
      color: #fff;
      font-size: 13px;
    }
  }
</style>