import request from 'request';
import { NOVA_URL, NOVA_BASE_URL, NOTIFICATION_DELAY } from '../config';
import cheerio from 'cheerio';

const OnTheAir = {
    showTitle: null,
    songTitle: null,
    songArtist: null,
    songImage: null,
    datas: {},
    vm: null,

    setVM: function (vm) {
        OnTheAir.vm = vm;
        return OnTheAir;
    },

    start: function () {
        this.getTrack();
        setInterval(this.getTrack, NOTIFICATION_DELAY * 1000);
    },

    getTrack: function () {
        request(
            NOVA_URL,
            function (error, response, body) {
                if (error == null && body != null && body.length > 0) {
                    OnTheAir.datas = JSON.parse(body);
                    console.log(OnTheAir.datas);
                    OnTheAir.notify();
                }
            }
        );
    },

    notify: function () {
        if (this.datas.currentTrack == null && this.datas.currenShow == null) {
            var title = this.datas.radio.name;
            var thumbnail = this.datas.radio.image;
            var artist = this.datas.radio.name;
        } else {
            var title = this.datas.currentTrack.title;
            var artist = this.datas.currentTrack.artist;
            var thumbnail = this.datas.currentTrack.thumbnail;
        }

        var notify = false;
        var notificationTitle = null;
        var notificationBody = null;

        if (artist != this.songArtist) {
            this.songArtist = artist;
            notificationBody = artist;
            notify = true;
        }

        if (title != this.songTitle) {
            this.songTitle = title;
            notificationTitle = title;
            notify = true;
        }

        if (notify) {
            let myNotification = new Notification(notificationTitle, {
                body: notificationBody,
                silent: true,
                icon: NOVA_BASE_URL + thumbnail
            });

            OnTheAir.vm.$emit('song_changed', this.datas);
        }
    }
}

export default OnTheAir;
