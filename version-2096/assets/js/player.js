function initPlayer(playerId, source) {
    var player = document.getElementById(playerId);
    if (!player) {
        return;
    }

    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var hlsInstance = null;
    var loaded = false;

    function bindSource() {
        if (loaded || !video) {
            return;
        }

        loaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.load();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hlsInstance.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hlsInstance.recoverMediaError();
                } else {
                    hlsInstance.destroy();
                }
            });
        } else {
            video.src = source;
            video.load();
        }
    }

    function startPlayback() {
        bindSource();
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
        if (!loaded) {
            startPlayback();
        }
    });

    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });
}
