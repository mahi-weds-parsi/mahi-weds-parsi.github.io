document.addEventListener("DOMContentLoaded", function () {
  var audio = document.getElementById("background-audio");
  var toggleButton = document.querySelector("[data-audio-toggle]");

  if (!audio) {
    if (toggleButton) {
      toggleButton.style.display = "none";
    }
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

  var updateToggle = function () {
    if (!toggleButton) {
      return;
    }
    var isPlaying = !audio.paused;
    toggleButton.textContent = isPlaying ? "Music On" : "Music Off";
    toggleButton.setAttribute("aria-pressed", isPlaying ? "true" : "false");
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

  ["pointerdown", "click", "touchstart", "keydown"].forEach(function (eventName) {
    document.addEventListener(eventName, startPlayback, { once: true, capture: true });
  });

  if (toggleButton) {
    toggleButton.addEventListener("click", function (event) {
      event.preventDefault();
      if (audio.paused) {
        if (!hasUserStarted) {
          startPlayback();
        } else {
          tryPlay();
        }
      } else {
        audio.pause();
      }
    });
  }

  audio.addEventListener("play", updateToggle);
  audio.addEventListener("pause", updateToggle);
  updateToggle();
});
