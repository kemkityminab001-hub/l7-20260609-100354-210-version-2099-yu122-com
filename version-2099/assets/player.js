(function () {
    window.initMoviePlayer = function (source) {
        var video = document.querySelector('[data-player-video]');
        var overlay = document.querySelector('[data-player-overlay]');
        var button = document.querySelector('[data-player-button]');
        var hlsInstance = null;
        var sourceReady = false;

        if (!video || !source) {
            return;
        }

        function attachSource() {
            if (sourceReady) {
                return;
            }
            sourceReady = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = source;
        }

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add('hidden');
            }
        }

        function showOverlay() {
            if (overlay) {
                overlay.classList.remove('hidden');
            }
        }

        function playVideo() {
            attachSource();
            hideOverlay();
            var playResult = video.play();
            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {
                    showOverlay();
                });
            }
        }

        attachSource();

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                playVideo();
            });
        }

        if (overlay) {
            overlay.addEventListener('click', function () {
                playVideo();
            });
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener('play', hideOverlay);
        video.addEventListener('ended', showOverlay);

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
