<template>
  <div id="wrapper" class="has-link" v-bind:class="{ infos: trackInfos }">
    <audio ref="audioplayer" class="hidden"></audio>

    <div class="app-bg">
      <img :src="image" />
    </div>

    <a href="" class="show-infos" v-if="title" v-on:click.prevent="showTrackInfos">
      <icon v-if="trackInfos == false" name="info-circle"></icon>
      <icon v-if="trackInfos" name="times-circle"></icon>
    </a>

    <transition name="fade">
      <track-infos v-if="trackInfos" :title="title" :subtitle="subtitle"></track-infos>
    </transition>

    <track-links 
      v-if="trackAsLinks" 
      ref='control'
      :spotify="spotify" 
      :deezer="deezer" 
      :itunes="itunes"></track-links>
  </div>
</template>

<script>
  import Plyr from 'plyr'
  import { ipcRenderer } from 'electron'
  import OnTheAir from './services/OnTheAir'
  import TrackInfos from './components/TrackInfos.vue'
  import TrackLinks from './components/TrackLinks.vue'
  import { NOTIFICATION_DELAY, DEFAULT_IMAGE } from './config'

  export default {

    name: 'radionova',

    components: {
      TrackInfos,
      TrackLinks
    },

    data: function () {
      return {
        datas: {},
        image: DEFAULT_IMAGE,
        title: '...',
        subtitle: '...',
        spotify: null,
        deezer: null,
        itunes: null,
        mute: false,
        stream: undefined,
        player: null,
        backgroundColor: 'transparent',
        trackInfos: false
      }
    },

    mounted () {
      OnTheAir.setVM(this).start()
      this.$on('song_changed', (datas) => {
        this.datas = datas
      })
      ipcRenderer.on('MediaPlayPause', (event, datas) => {
        this.toggleMute()
      })
    },

    watch: {
      datas (datas) {
        setTimeout(() => {
          this.title = datas.title
          this.subtitle = datas.subtitle
          this.setImage(datas)
          if (datas.currentTrack != null) {
            this.deezer = datas.currentTrack.deezer_url
            this.spotify = datas.currentTrack.spotify_url
            this.itunes = datas.currentTrack.itunes_url
          }
        }, NOTIFICATION_DELAY)
        if (this.stream === undefined) {
          this.setPlayer()
        }
      },
      player (player) {

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
        if (datas.image) {
          this.image = datas.image
        } else {
          this.image = DEFAULT_IMAGE
          this.backgroundColor = 'transparent'
        }
      },
      /**
       * Toggle Track infos display
       */
      showTrackInfos () {
        if (this.trackInfos) {
          this.trackInfos = false
        } else {
          this.trackInfos = true
        }
      },
      /**
       * Toogle volume when pause media keys pressed
       * and pause button clicked
       */
      toggleMute () {
        this.$refs.control.$emit('mute')
        this.mute = this.mute === false
      },
      /**
       * Open external link function
       */
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      /**
       * Init player and load source
       */
      setPlayer () {
        const player = new Plyr(this.$refs.audioplayer)
        player.source = {
          type: 'audio',
          title: 'Radio Nova',
          sources: [{
            src: this.datas.radio.high_def_stream_url,
            type: 'audio/mp3'
          }]
        }
        player.on('canplay', () => {
          player.play()
        })
        this.player = player
      }
    }
  }
</script>

<style lang="scss">
  @import './assets/scss/variables';

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
   * Layout
   */
  .app-bg {
    position: absolute;
    z-index: -1;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    object-fit: cover;
    img {
      transition: all $animation-duration ease-in-out;
      object-fit: cover;
      display: block;
      width: 100%;
      height: 100%;
    }
  }
  #wrapper.infos {
    .app-bg {
      img {
        transition: all $animation-duration ease-in-out;
        transform: scale(1.1);
        filter: blur(6px);
      }
    }
    .links {
      bottom: -60px;
    }
  }

  /**
   * Controls
   */
  .show-infos {
    position: absolute;
    top: 12px;
    right: 20px;
    svg {
      fill: #fff;
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
    top: -60px;
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
      &.infos {

      }
    }
    &.infos {
      &:hover {
        .links {
          -webkit-transition: transform 0.3s ease-in-out;
          transition: transform 0.3s ease-in-out;
          transform: translateY(60px);
        }
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
