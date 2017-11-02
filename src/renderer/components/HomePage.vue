<template>
  <div id="wrapper" v-bind:style="backgroundImage()" v-bind:class="{ muted: mute, 'has-link': isLink() }">
    <audio v-if="stream" ref="audioplayer">
      <source :src="stream" type="audio/mp3">
    </audio>

    <div class="meta">
      <h1 v-if="title">{{ title }}</h1>
      <h2 v-if="subtitle">{{ subtitle }}</h2>
    </div>

    <div class="links" v-if="isLink">
      <a href="" v-if="spotify" v-on:click.prevent="openSpotify" class="socicon-spotify"></a>
      <a href="" v-if="deezer" v-on:click.prevent="openDeezer" class="socicon-deezer"></a>
      <a href="" v-if="itunes" v-on:click.prevent="openItunes" class="socicon-apple"></a>
    </div>
  </div>
</template>

<script>
  import { NOVA_URL, NOVA_BASE_URL } from '../config';
  import OnTheAir from '../services/OnTheAir';
  var { ipcRenderer } = require('electron');
  var Plyr = require('plyr');

  export default {

    name: 'homepage',
    components: {},

    data: function () {
      return {
        datas: {},
        image: null,
        title: null,
        subtitle: null,
        spotify: null,
        deezer: null,
        itunes: null,
        mute: false,
        stream: undefined,
        player: null,
      } 
    },

    mounted () {
      var vm = this;
      OnTheAir.setVM(this).start();
      this.$on('song_changed', function (datas) {
        vm.datas = datas;
      })
      ipcRenderer.on('MediaPlayPause', function(event, datas) {
        if (vm.player.isMuted()) {
          vm.player.toggleMute();
          vm.mute = false;
        } else {
          vm.player.toggleMute();
          vm.mute = true;
        }
      });
    },

    watch: {
      datas: function (datas) {
        this.title = datas.title;
        this.subtitle = datas.subtitle;
        this.image = datas.image;
        console.log(datas.currentTrack);
        if (datas.currentTrack != null) {
          this.deezer = datas.currentTrack.deezer_url;
          this.spotify = datas.currentTrack.spotify_url;
          this.itunes = datas.currentTrack.itunes_url;
        }
        if (this.stream == undefined) {
          this.stream = datas.radio.high_def_stream_url;
          this.setPlayer();
        }
      },
      player: function (player) {
        player.play();
      }
    },

    methods: {

      isLink () {
        if (this.spotify == null
          && this.deezer == null
          && this.itunes == null) {
          return false;
        }
        return true;
      },

      open (link) {
        this.$electron.shell.openExternal(link)
      },

      backgroundImage: function () {
        if (this.image) {
          return {
            backgroundImage: 'url(' + this.image + ')',
          }
        } else {
          return null;
        }
        
      },

      openSpotify: function () {
        if (this.datas.currentTrack.spotify_url) {
          this.open(this.datas.currentTrack.spotify_url);
        }
      },

      openDeezer: function () {
        if (this.datas.currentTrack.deezer_url) {
          this.open(this.datas.currentTrack.deezer_url);
        }
      },

      openItunes: function () {
        if (this.datas.currentTrack.itunes_url) {
          this.open(this.datas.currentTrack.itunes_url);
        }
      },

      setPlayer: function () {
        var vm = this;
        setTimeout(function() {
          var players = Plyr.setup();
          vm.player = players[0];
        }, 200);
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
      .links {
        -webkit-transition: transform 0.3s ease-in-out;
        transition: transform 0.3s ease-in-out;
        transform: translateY(-70px);
      }
      .meta {
        -webkit-transition: transform 0.3s ease-in-out;
        transition: transform 0.3s ease-in-out;
        transform: translateY(-70px);
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
    position: absolute;
    width: 100%;
    background: #F55656;
    text-align: center;
    padding: 15px 12px;
    -webkit-transition: transform 0.3s ease-in-out;
    transition: transform 0.3s ease-in-out;
    height: 70px;
    bottom: -70px;
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
        &:before {
          background: #fff;
          color: #F55656;
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
    bottom: 10px;
    padding: 10px 12px 5px;
  }
  h1, h2 {
    color: #fff;
    text-shadow: 1px 1px 1px #222;
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
