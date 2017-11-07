<template>
  <div id="wrapper" v-bind:style="backgroundImage()" v-bind:class="{ muted: mute, 'has-link': trackAsLinks() }">
    <audio v-if="stream" ref="audioplayer">
      <source :src="stream" type="audio/mp3">
    </audio>

    <div class="meta" v-bind:style="getBackgroundColor()">
      <transition name="fade"><h1 v-if="title" v-bind:style="getTextColor()">{{ title }}</h1></transition>
      <transition name="fade"><h2 v-if="subtitle" v-bind:style="getTextColor()">{{ subtitle }}</h2></transition>
    </div>

    <div class="links" v-if="trackAsLinks" v-bind:style="getBackgroundColor()">
      <div class="toggle-mute">
        <a href="" class="play" v-on:click.prevent="toggleMute" v-bind:class="{ muted: mute }"></a>
      </div>
      <div class="social-list">
        <a 
          href="" 
          v-if="spotify" 
          v-on:click.prevent="openSpotify" 
          class="socicon-spotify social"></a>
        <a 
          href="" 
          v-if="deezer" 
          v-on:click.prevent="openDeezer" 
          class="socicon-deezer social"></a>
        <a 
          href="" 
          v-if="itunes" 
          v-on:click.prevent="openItunes" 
          class="socicon-apple social"></a>
      </div>
    </div>

  </div>
</template>

<script>
  import { NOTIFICATION_DELAY, DEFAULT_IMAGE } from '../config'
  import OnTheAir from '../services/OnTheAir'
  var Vibrant = require('node-vibrant')
  var { ipcRenderer } = require('electron')
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
        if (vm.player.isMuted()) {
          vm.player.toggleMute()
          vm.mute = false
        } else {
          vm.player.toggleMute()
          vm.mute = true
        }
      })
    },

    watch: {
      datas: function (datas) {
        var vm = this
        setTimeout(function () {
          vm.title = datas.title
          vm.subtitle = datas.subtitle
          if (datas.image) {
            vm.setImage(datas)
          }
          if (datas.currentTrack != null) {
            vm.deezer = datas.currentTrack.deezer_url
            vm.spotify = datas.currentTrack.spotify_url
            vm.itunes = datas.currentTrack.itunes_url
          }
        }, NOTIFICATION_DELAY)
        if (this.stream === undefined) {
          this.stream = datas.radio.high_def_stream_url
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
       *
       */
      setImage (datas) {
        var vm = this
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
      },
      toggleMute () {
        if (this.player.isMuted()) {
          this.player.toggleMute()
          this.mute = false
        } else {
          this.player.toggleMute()
          this.mute = true
        }
      },

      open (link) {
        this.$electron.shell.openExternal(link)
      },

      getTextColor: function () {
        return {
          color: this.textColor
        }
      },

      getInvertTextColor: function () {
        return {
          color: this.backgroundColor
        }
      },

      getBackgroundColor: function () {
        return {
          backgroundColor: this.backgroundColor,
          color: this.backgroundColor
        }
      },

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

      openSpotify: function () {
        if (this.datas.currentTrack.spotify_url) {
          this.open(this.datas.currentTrack.spotify_url)
        }
      },

      openDeezer: function () {
        if (this.datas.currentTrack.deezer_url) {
          this.open(this.datas.currentTrack.deezer_url)
        }
      },

      openItunes: function () {
        if (this.datas.currentTrack.itunes_url) {
          this.open(this.datas.currentTrack.itunes_url)
        }
      },

      setPlayer: function () {
        var vm = this
        setTimeout(function () {
          var players = Plyr.setup()
          vm.player = players[0]
        }, 200)
      }
    }
  }
</script>

<style lang="scss">
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  .hidden {
    display: none;
  }
  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s
  }
  .fade-enter, .fade-leave-to {
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
  body { 
    overflow: hidden;
    -ms-overflow-style: scrollbar;
    -webkit-app-region: drag;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  }
  .plyr--audio {
    display: none;
  }

  $background: #f9f9f9;
  $foreground: #fff;

  $foreground-light: #34495e;
  $size: 10px;
  $ratio: .2;
  $transition-time: 0.3s;

  .toggle-mute {
    width: 60px;
    height: 60px;
    background: transparent url(../assets/play-noise.png) no-repeat center center;
    margin-left: 0;
    text-align: center;
    padding-top: 10px;
    float: left;
  }
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
    transition: all $transition-time;
    -webkit-transition: all $transition-time;
    -moz-transition: all $transition-time;
  
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
      transition: all $transition-time;
      -webkit-transition: all $transition-time;
      -moz-transition: all $transition-time;
    }
    &:after {
      content:'';
      opacity:0;
      transition: opacity ($transition-time * 2);
      -webkit-transition: opacity ($transition-time * 2);
      -moz-transition: opacity ($transition-time * 2);
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

  #wrapper {
    height: 100vh;
    width: 100vw;
    background-size: cover;
    background-position: center center;


    &.has-link:hover {
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
  .cover img {
    display: block;
    width: 100%;
    object-fit: cover;
  }
  .links {
    width: 100%;
    background: #F55656;
    padding: 0;
    -webkit-transition: transform 0.3s ease-in-out;
    transition: transform 0.3s ease-in-out;
    height: 60px;
    bottom: -60px;
    position: absolute;


    .social-list {
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      background: #333;
      a {
        margin: 0 15px;
      }
    }
    a {
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
  .meta {
    position: absolute;
    -webkit-transition: transform 0.3s ease-in-out;
    transition: transform 0.3s ease-in-out;
    width: 100%;
    left: 0;
    bottom: 0px;
    padding: 10px 12px 10px;
  }
  h1, h2 {
    color: #fff;
    font-size: 16px;
    font-weight: 300;
  }
  h2 {
    font-size: 14px;
  }
  audio {
    margin-top: 40px;
  }
</style>
