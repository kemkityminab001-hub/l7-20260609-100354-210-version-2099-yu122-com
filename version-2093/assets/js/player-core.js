import { H as Hls } from "../vendor/video-vendor-dru42stk.js";

export function initPlayer(streamUrl) {
  const video = document.getElementById("movie-player");
  const trigger = document.getElementById("play-trigger");

  if (!video || !trigger || !streamUrl) {
    return;
  }

  let attached = false;
  let hls = null;

  function attachStream() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function startPlayback() {
    attachStream();
    trigger.classList.add("is-hidden");
    video.controls = true;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  trigger.addEventListener("click", startPlayback);
  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });
  video.addEventListener("play", function () {
    trigger.classList.add("is-hidden");
  });
}
