import { H as Hls } from './hls-dru42stk.js';

function setStatus(node, text) {
  if (node) {
    node.textContent = text;
  }
}

function initPlayer() {
  var video = document.getElementById('movie-player');

  if (!video) {
    return;
  }

  var shell = video.closest('.player-shell');
  var playButton = document.querySelector('[data-play-button]');
  var status = document.querySelector('[data-player-status]');
  var source = video.getAttribute('data-src');
  var isAttached = false;
  var hlsInstance = null;

  function attachSource() {
    if (isAttached || !source) {
      return Promise.resolve();
    }

    setStatus(status, '正在加载高清线路');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      isAttached = true;
      return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      isAttached = true;

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus(status, '线路加载完成，正在播放');
      });

      hlsInstance.on(Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal) {
          setStatus(status, '线路加载失败，请刷新页面后重试');
        }
      });

      return Promise.resolve();
    }

    video.src = source;
    isAttached = true;
    return Promise.resolve();
  }

  function play() {
    attachSource().then(function () {
      return video.play();
    }).then(function () {
      if (shell) {
        shell.classList.add('is-playing');
      }
    }).catch(function () {
      setStatus(status, '浏览器阻止自动播放，请再次点击播放器');
    });
  }

  if (playButton) {
    playButton.addEventListener('click', play);
  }

  video.addEventListener('play', function () {
    if (shell) {
      shell.classList.add('is-playing');
    }
  });

  video.addEventListener('pause', function () {
    if (shell && video.currentTime === 0) {
      shell.classList.remove('is-playing');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

initPlayer();
