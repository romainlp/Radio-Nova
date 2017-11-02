<template>
  <div id="wrapper" v-bind:style="backgroundImage()">
    <audio v-if="stream" ref="audioplayer">
      <source :src="stream" type="audio/mp3">
    </audio>

    <div class="meta">
      <h1 v-if="title">{{ title }}</h1>
      <h2 v-if="artist">{{ artist }}</h2>
    </div>
    <div class="links" v-if="spotify == false">
      <ul>
        <li v-if="spotify" class="spotify">
          <a href="" v-on:click="openSpotify">
            <img src="~@/assets/logos/spotify.png" />
          </a>
        </li>
        <li v-if="deezer" class="deezer">
          <a href="" v-on:click="openDeezer">
            <img src="~@/assets/logos/deezer.png" />
          </a>
        </li>
        <li v-if="itunes" class="itunes">
          <a href="" v-on:click="openItunes">
            <img src="~@/assets/logos/itunes.png" />
          </a>
        </li>
      </ul>
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
        artist: null,
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
        if (vm.player.isPaused()) {
          vm.player.play();
        } else {
          vm.player.pause();
        }
      });
    },

    watch: {
      datas: function (datas) {
        this.artist = datas.currentTrack.artist;
        this.title = datas.currentTrack.title;
        this.image = NOVA_BASE_URL + datas.currentTrack.image;
        this.deezer = datas.currentTrack.deezer_url;
        this.spotify = datas.currentTrack.spotify_url;
        this.itunes = datas.currentTrack.itunes_url;

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

      open (link) {
        this.$electron.shell.openExternal(link)
      },

      backgroundImage: function () {
        return {
          backgroundImage: 'url(' + this.image + ')'
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

  body { 
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
  }
  .cover img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .links {
    position: absolute;
    top: 40px;
    left: 12px;
    width: calc(100% - 24px);
    ul {
      text-align: center;
      width: 100%;
    }
    li {
      display: block;
      text-align: center;
      a {
        display: inline-block;
        height: 40px;
      }
    }
    .spotify {
      a {
        width: 40px;
        img {
        }
      }
    }
    .itunes {
      a {
        width: 110px;
        img {
        }
      }
    }
    .deezer {
      a {
        width: 182px;
        img {
        }
      }
    }
  }
  .meta {
    position: absolute;
    bottom: 10px;
    left: 12px;
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
