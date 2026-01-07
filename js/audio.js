document.addEventListener("DOMContentLoaded", function () {
  var audio = document.getElementById("background-audio");

  if (!audio) {
    return;
  }

  var hasUserStarted = false;
  audio.autoplay = false;
  audio.removeAttribute("autoplay");
  audio.pause();
  try {
    audio.currentTime = 0;
  } catch (error) {
    // Ignore seek errors before metadata is ready.
  }

  var tryPlay = function () {
    var playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  };

  var startPlayback = function () {
    if (hasUserStarted) {
      return;
    }
    hasUserStarted = true;
    var seekAndPlay = function () {
      audio.currentTime = 0;
      tryPlay();
    };

    if (audio.readyState >= 1) {
      seekAndPlay();
    } else {
      audio.addEventListener("loadedmetadata", seekAndPlay, { once: true });
      audio.load();
    }
  };

  document.addEventListener("click", startPlayback, { once: true });
  document.addEventListener("touchstart", startPlayback, { once: true });
  document.addEventListener("keydown", startPlayback, { once: true });
});
