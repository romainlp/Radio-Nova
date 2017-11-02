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
                    OnTheAir.notify();
                }
            }
        );
    },

    notify: function () {
        var title;
        var subtitle;
        var image;
        var notify;
        var notificationTitle;
        var notificationBody;

        if (this.datas.currentTrack == null && this.datas.currentShow == null) {
            title = this.datas.radio.name;
            subtitle = this.datas.radio.name;
            image = this.datas.radio.image;
        } else {
            if (this.datas.currentTrack != null) {
                title = this.datas.currentTrack.title;
                subtitle = this.datas.currentTrack.artist;
                image = this.datas.currentTrack.image;
            } else {
                title = this.datas.currentShow.title;
                subtitle = this.datas.currentShow.artist;
                image = this.datas.currentShow.image;
            }
        }

        if (subtitle != this.subtitle) {
            this.subtitle = subtitle;
            notificationBody = subtitle;
            notify = true;
        }

        if (title != this.title) {
            this.title = title;
            notificationTitle = title;
            notify = true;
        }

        if (notify) {
            let myNotification = new Notification(notificationTitle, {
                body: notificationBody,
                silent: true,
                icon: NOVA_BASE_URL + image
            });

            this.datas['title'] = notificationTitle;
            this.datas['subtitle'] = notificationBody;
            this.datas['image'] = NOVA_BASE_URL + image;

            OnTheAir.vm.$emit('song_changed', this.datas);
        }
    }
}

export default OnTheAir;
