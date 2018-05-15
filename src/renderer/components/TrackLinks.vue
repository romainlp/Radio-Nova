<template>
  <div class="links">
    <div class="toggle-mute">
      <a href="" class="play" v-on:click.prevent="toggleMute" v-bind:class="{ muted: mute }"></a>
    </div>
    <div class="social-list">
      <a 
        href="" 
        v-if="spotify" 
        v-on:click.prevent="open(spotify)" 
        class="socicon-spotify social"></a>
      <a 
        href="" 
        v-if="deezer" 
        v-on:click.prevent="open(deezer)" 
        class="socicon-deezer social"></a>
      <a 
        href="" 
        v-if="itunes" 
        v-on:click.prevent="open(itunes)" 
        class="socicon-apple social"></a>
    </div>
  </div>
</template>

<script>
  export default {

    name: 'TrackLinks',

    props: {
      deezer: String,
      spotify: String,
      itunes: String
    },

    data () {
      return {
        mute: false
      }
    },

    mounted () {
      this.$on('mute', () => {
        this.mute = this.mute === false
      })
    }

  }
</script>

<style lang="scss" scoped>

</style>