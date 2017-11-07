<template>
  <div id="wrapper" v-bind:style="backgroundImage()" v-bind:class="{ muted: mute, 'has-link': trackAsLinks() }">
    <audio v-if="stream" ref="audioplayer">
      <source :src="stream" type="audio/mp3">
    </audio>

    <div class="meta" v-bind:style="getBackgroundColor()">
      <transition name="fade"><h1 v-if="title" v-bind:style="getTextColor()">{{ title }}</h1></transition>
      <transition name="fade"><h2 v-if="subtitle" v-bind:style="getTextColor()">{{ subtitle }}</h2></transition>
      <div class="links" v-if="trackAsLinks" v-bind:style="getBackgroundColor()">
        <a href="" v-if="spotify" v-on:click.prevent="openSpotify" class="socicon-spotify" v-bind:style="getBackgroundColor()"></a>
        <a href="" v-if="deezer" v-on:click.prevent="openDeezer" class="socicon-deezer"></a>
        <a href="" v-if="itunes" v-on:click.prevent="openItunes" class="socicon-apple"></a>
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
        // player.play()
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
            console.log(err)
            vm.textColor = '#fff'
          } else {
            if (palette.Muted) {
              vm.textColor = palette.Muted.getBodyTextColor()
              vm.backgroundColor = palette.Muted.getHex()
            }
            console.log(palette)
          }
        })
      },

      open (link) {
        this.$electron.shell.openExternal(link)
      },

      getTextColor: function () {
        return {
          color: this.textColor
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

  #wrapper {
    height: 100vh;
    width: 100vw;
    background-size: cover;
    background-position: center center;


    &.has-link:hover {
      /*.links {
        -webkit-transition: transform 0.3s ease-in-out;
        transition: transform 0.3s ease-in-out;
        transform: translateY(-60px);
      }*/
      .meta {
        -webkit-transition: transform 0.3s ease-in-out;
        transition: transform 0.3s ease-in-out;
        transform: translateY(0px);
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
    text-align: center;
    padding: 15px 12px 15px;
    -webkit-transition: transform 0.3s ease-in-out;
    transition: transform 0.3s ease-in-out;
    height: 60px;
    a {
      text-decoration: none;
      font-size: 2em;
      display: inline-block;
      vertical-align: middle;
      color: white;
      -webkit-transition: transform 0.3s ease-in-out;
      transition: transform 0.3s ease-in-out;
      margin: 0 10px;
      &:hover {
        transform: translateY(-5%);
      }
      &.socicon-spotify {
        color: inherit;
        &:before {
          background: #fff;
          color: inherit;
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
    transform: translateY(60px);
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
