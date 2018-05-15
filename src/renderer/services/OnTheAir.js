import request from 'request'
import { NOVA_URL, NOVA_BASE_URL, NOTIFICATION_DELAY, REFRESH_DELAY } from '../config'

const OnTheAir = {
  showTitle: null,
  songTitle: null,
  songArtist: null,
  songImage: null,
  datas: {},
  vm: null,

  /**
   * Define vm property with the current Vue Instance
   */
  setVM (vm) {
    OnTheAir.vm = vm
    return OnTheAir
  },

  /**
   * Start the notifier service and retrieve
   * datas for each interval defined in ../config/index.js
   */
  start () {
    this.getTrack()
    setInterval(this.getTrack, REFRESH_DELAY)
  },

  /**
   * Request to Radio Nova Website and send the
   * the notification if datas are retrieved
   */
  getTrack () {
    request(
      NOVA_URL,
      function (error, response, body) {
        if (error == null && body != null && body.length > 0) {
          OnTheAir.datas = JSON.parse(body)
          OnTheAir.notify()
        }
      }
    )
  },

  /**
   * Build the content
   * and use system built-in notification
   */
  notify () {
    let title, subtitle, image, notify, notificationTitle, notificationBody

    if (this.datas.currentTrack === null && this.datas.currentShow === null) {
      title = this.datas.radio.name
      subtitle = this.datas.radio.name
      image = this.datas.radio.image
    } else {
      if (this.datas.currentTrack !== null) {
        title = this.datas.currentTrack.title
        subtitle = this.datas.currentTrack.artist
        image = this.datas.currentTrack.image
      } else {
        title = this.datas.currentShow.title
        subtitle = this.datas.currentShow.artist
        image = this.datas.currentShow.image
      }
    }

    if (subtitle !== this.subtitle) {
      this.subtitle = subtitle
      notificationBody = subtitle
      notify = true
    }

    if (title !== this.title) {
      this.title = title
      notificationTitle = title
      notify = true
    }

    if (notify) {
      this.datas['title'] = notificationTitle
      this.datas['subtitle'] = notificationBody
      this.datas['image'] = NOVA_BASE_URL + image

      OnTheAir.vm.$emit('song_changed', this.datas)

      setTimeout(function () {
        return new Notification(notificationTitle, {
          body: notificationBody,
          silent: true,
          icon: NOVA_BASE_URL + image
        })
      }, NOTIFICATION_DELAY)
    }
  }
}

export default OnTheAir
