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
    },

    methods: {
      toggleMute () {
        this.$parent.player.toggleMute()
        this.mute = this.mute === false
      }
    }

  }
</script>

<style lang="scss">
@import '../assets/scss/variables';
.links {
  width: 100%;
  background: #F55656;
  padding: 0;
  -webkit-transition: transform 0.3s ease-in-out;
  transition: transform 0.3s ease-in-out;
  height: 60px;
  bottom: -60px;
  position: absolute;
  .toggle-mute {
    width: 60px;
    height: 60px;
    background: transparent url(../assets/play-noise.png) no-repeat center center;
    margin-left: 0;
    text-align: center;
    padding-top: 10px;
    float: left;
    .play {
      display:block;
      width: 0; 
      height: 0; 
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      border-left: 6px solid $foreground;
      margin: 15px auto;
      position: relative;
      z-index:1;
      transition: all $animation-duration;
      -webkit-transition: all $animation-duration;
      -moz-transition: all $animation-duration;
      &:before {
        content: '';
        position: absolute;
        top: ($size*-1.5);
        left: -20px;
        bottom: ($size*-1.5);
        right: -10px;
        border-radius: 50%;
        border: ($size*0.2) solid $foreground;
        z-index: 2;
        transition: all $animation-duration;
        -webkit-transition: all $animation-duration;
        -moz-transition: all $animation-duration;
      }
      &:after {
        content: '';
        opacity: 1;
        width: 8px;
        height: 12px;
        background: $foreground;
        position: absolute;
        right: -1px;
        top: -6px;
        border-left: ($size*0.4) solid $foreground;
        box-shadow: inset ($size*0.6) 0 0 0 $background;
      }
      
      &:hover, &:focus {
        &:before {
           transform: scale(1.1);
           -webkit-transform: scale(1.1);
           -moz-transform: scale(1.1);
        }
      }
      &.muted {
        &:after {
          content:'';
          opacity:0;
          transition: opacity ($animation-duration * 2);
          -webkit-transition: opacity ($animation-duration * 2);
          -moz-transition: opacity ($animation-duration * 2);
        }
      }
    }
  }
  .social-list {
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    background: #333;
    a {
      margin: 0 15px;
      text-decoration: none;
      font-size: 2em;
      display: inline-block;
      vertical-align: middle;
      color: white;
      &.socicon-spotify {
        margin-top: -6px;
        &:before {
          background: #fff;
          color: #333;
          width: 1.4em;
          height: 1.4em;
          -webkit-border-radius: 500px;
          -moz-border-radius: 500px;
          border-radius: 500px;
          background: white;
          font-size: .8em;
          text-align: center;
          line-height: 0;
          padding: 6px;
          font-size: 0.7em;
        }
      }
    }
  }
}
</style>