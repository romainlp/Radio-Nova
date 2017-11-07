<template>
  <div id="wrapper" v-bind:style="backgroundImage()" v-bind:class="{ muted: mute, 'has-link': true }">
    <audio ref="audioplayer" class="hidden"></audio>
    <div class="meta" v-bind:style="getBackgroundColor()">
      <h1 v-if="title" v-bind:style="getTextColor()">{{ title }}</h1>
      <h2 v-if="subtitle" v-bind:style="getTextColor()">{{ subtitle }}</h2>
    </div>
    <div class="links" v-if="trackAsLinks" v-bind:style="getBackgroundColor()">
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
  </div>
</template>

<script>
  import { NOTIFICATION_DELAY, DEFAULT_IMAGE } from '../config'
  import OnTheAir from '../services/OnTheAir'
  var { ipcRenderer } = require('electron')
  var Vibrant = require('node-vibrant')
  var Plyr = require('plyr')

  export default {
    name: 'homepage',
    components: {},
    data: function () {
      return {
        datas: {},
        image: null,
        title: '...',
        subtitle: '...',
        spotify: null,
        deezer: null,
        itunes: null,
        mute: false,
        stream: undefined,
        player: null,
        textColor: '#fff',
        backgroundColor: 'transparent'
      }
    },
    mounted () {
      var vm = this
      OnTheAir.setVM(this).start()
      this.$on('song_changed', function (datas) {
        vm.datas = datas
      })
      ipcRenderer.on('MediaPlayPause', function (event, datas) {
        vm.toggleMute()
      })
    },
    watch: {
      datas: function (datas) {
        var vm = this
        setTimeout(function () {
          vm.title = datas.title
          vm.subtitle = datas.subtitle
          vm.setImage(datas)
          if (datas.currentTrack != null) {
            vm.deezer = datas.currentTrack.deezer_url
            vm.spotify = datas.currentTrack.spotify_url
            vm.itunes = datas.currentTrack.itunes_url
          }
        }, NOTIFICATION_DELAY)
        if (this.stream === undefined) {
          this.setPlayer()
        }
      },
      player: function (player) {
        player.play()
      }
    },
    methods: {
      /**
       * Check if the current track have at least one commercial link
       */
      trackAsLinks () {
        if (this.spotify === null &&
          this.deezer === null &&
          this.itunes === null) {
          return false
        }
        return true
      },
      /**
       * Set background image and set title colors
       */
      setImage (datas) {
        var vm = this
        if (datas.image) {
          this.image = datas.image
          Vibrant.from(this.image).getPalette(function (err, palette) {
            if (err) {
              vm.textColor = '#fff'
            } else {
              if (palette.Muted) {
                vm.textColor = palette.Muted.getBodyTextColor()
                vm.backgroundColor = palette.Muted.getHex()
              }
            }
          })
        } else {
          this.textColor = '#fff'
          this.backgroundColor = 'transparent'
        }
      },
      /**
       * Toogle volume when pause media keys pressed
       * and pause button clicked
       */
      toggleMute () {
        if (this.player.isMuted()) {
          this.player.toggleMute()
          this.mute = false
        } else {
          this.player.toggleMute()
          this.mute = true
        }
      },
      /**
       * Open external link function
       */
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      /**
       * CSS Class: get text color base on background image
       */
      getTextColor: function () {
        return {
          color: this.textColor
        }
      },
      /**
       * CSS Class: background and text color based on the background image
       */
      getBackgroundColor: function () {
        return {
          backgroundColor: this.backgroundColor,
          color: this.backgroundColor
        }
      },
      /**
       * CSS Class: Set the background image url as inline property
       */
      backgroundImage: function () {
        if (this.image) {
          return {
            backgroundImage: 'url(' + this.image + ')'
          }
        } else {
          return {
            backgroundImage: 'url(' + DEFAULT_IMAGE + ')'
          }
        }
      },
      /**
       * Init player and load source
       */
      setPlayer: function () {
        var vm = this
        setTimeout(function () {
          var players = Plyr.setup()
          vm.player = players[0]
          vm.player.source({
            type: 'audio',
            title: 'Radio Nova',
            sources: [{
              src: vm.datas.radio.high_def_stream_url,
              type: 'audio/mp3'
            }]
          })
        }, 200)
      }
    }
  }
</script>

<style lang="scss">
  /**
   * Variables
   */
  $animation-duration: 0.3s;
  $background: #f9f9f9;
  $foreground: #fff;
  $foreground-light: #34495e;
  $size: 10px;
  $ratio: .2;

  /**
   * Base
   */
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  body { 
    overflow: hidden;
    -ms-overflow-style: scrollbar;
    -webkit-app-region: drag;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  }
  /**
   * CSS Tools
   */
  .hidden,
  .plyr--audio {
    display: none;
  }
  .fade-enter-active, 
  .fade-leave-active {
    transition: opacity $animation-duration;
  }
  .fade-enter, 
  .fade-leave-to {
    opacity: 0
  }
  [class^="socicon-"],
  [class*=" socicon-"] {
    font-family: 'Socicon' !important;
    speak: none;
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  /**
   * Controls
   */
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
          content:'';
          opacity:0;
          transition: opacity ($animation-duration * 2);
          -webkit-transition: opacity ($animation-duration * 2);
          -moz-transition: opacity ($animation-duration * 2);
        }
        &:hover, &:focus {
          &:before {
             transform: scale(1.1);
             -webkit-transform: scale(1.1);
             -moz-transform: scale(1.1);
          }
        }
        &.muted {
          border-color:transparent;
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
  /**
   * Track informations
   */
  .meta {
    position: absolute;
    -webkit-transition: transform 0.3s ease-in-out;
    transition: transform 0.3s ease-in-out;
    width: 100%;
    left: 0;
    bottom: 0px;
    padding: 10px 12px 10px;
    h1, h2 {
      color: #fff;
      font-size: 16px;
      font-weight: 500;
    }
    h2 {
      font-size: 14px;
    }
  }
  #wrapper {
    height: 100vh;
    width: 100vw;
    background-size: cover;
    background-position: center center;
    &:hover {
      .meta {
        -webkit-transition: transform 0.3s ease-in-out;
        transition: transform 0.3s ease-in-out;
        transform: translateY(-60px);
      }
      .links {
        -webkit-transition: transform 0.3s ease-in-out;
        transition: transform 0.3s ease-in-out;
        transform: translateY(-60px);
      }
    }
    &.muted {
      .meta {
        h1, h2 {
          text-decoration: line-through;
          font-style: italic;
        }
      }
    }
  }
</style>
