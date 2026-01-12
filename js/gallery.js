document.addEventListener("DOMContentLoaded", function () {
  var carousel = document.getElementById("fh5co-gallery-carousel");
  if (!carousel) {
    return;
  }

  var frameImage = carousel.querySelector(".gallery-image");
  var thumbs = carousel.querySelector(".gallery-thumbs");
  var prevBtn = carousel.querySelector(".gallery-prev");
  var nextBtn = carousel.querySelector(".gallery-next");
  var playBtn = carousel.querySelector(".gallery-play");
  var fullscreenBtn = carousel.querySelector(".gallery-fullscreen");
  if (!frameImage || !thumbs || !prevBtn || !nextBtn || !playBtn || !fullscreenBtn) {
    return;
  }

  var galleryDir = carousel.getAttribute("data-gallery-dir") || "images/gallery/";
  var galleryJson = carousel.getAttribute("data-gallery-json") || "images/gallery.json";
  var slideInterval = parseInt(carousel.getAttribute("data-gallery-interval") || "3500", 10);
  if (!slideInterval || slideInterval < 1000) {
    slideInterval = 3500;
  }

  var imagePattern = /\.(webp|png|jpe?g|gif)$/i;
  var names = [];
  var currentIndex = 0;
  var autoplayTimer = null;

  var normalizeName = function (href) {
    if (!href) {
      return "";
    }
    var cleaned = href.split("#")[0].split("?")[0];
    if (cleaned.charAt(cleaned.length - 1) === "/") {
      return "";
    }
    var parts = cleaned.split("/");
    return parts[parts.length - 1];
  };

  var resolvePath = function (name) {
    if (!name) {
      return "";
    }
    if (/^https?:\/\//i.test(name) || name.indexOf("/") === 0) {
      return name;
    }
    if (name.indexOf(galleryDir) === 0) {
      return name;
    }
    return galleryDir + name;
  };

  var parseDirectoryListing = function (htmlText) {
    var results = [];
    var doc = new DOMParser().parseFromString(htmlText, "text/html");
    var anchors = doc.querySelectorAll("a");
    anchors.forEach(function (anchor) {
      var href = anchor.getAttribute("href") || "";
      var name = normalizeName(href);
      if (imagePattern.test(name)) {
        results.push(name);
      }
    });
    return results;
  };

  var uniqueNames = function (names) {
    var seen = {};
    return names.filter(function (name) {
      if (!name || seen[name]) {
        return false;
      }
      seen[name] = true;
      return true;
    });
  };

  var fetchImages = function () {
    return fetch(galleryDir, { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Directory list unavailable");
        }
        return response.text();
      })
      .then(function (text) {
        var names = parseDirectoryListing(text);
        if (!names.length) {
          throw new Error("No images found in directory listing");
        }
        return uniqueNames(names);
      })
      .catch(function () {
        return fetch(galleryJson, { cache: "no-store" })
          .then(function (response) {
            if (!response.ok) {
              throw new Error("Gallery JSON unavailable");
            }
            return response.json();
          })
          .then(function (data) {
            if (!Array.isArray(data)) {
              return [];
            }
            return uniqueNames(
              data
                .map(function (name) {
                  return normalizeName(name);
                })
                .filter(function (name) {
                  return imagePattern.test(name);
                })
            );
          })
          .catch(function () {
            return [];
          });
      });
  };

  var updatePlayState = function (isPlaying) {
    if (isPlaying) {
      carousel.classList.add("is-playing");
      playBtn.setAttribute("aria-label", "Pause slideshow");
    } else {
      carousel.classList.remove("is-playing");
      playBtn.setAttribute("aria-label", "Start slideshow");
    }
  };

  var startAutoplay = function () {
    if (autoplayTimer || names.length < 2) {
      return;
    }
    autoplayTimer = setInterval(function () {
      setActive(currentIndex + 1);
    }, slideInterval);
    updatePlayState(true);
  };

  var stopAutoplay = function () {
    if (!autoplayTimer) {
      return;
    }
    clearInterval(autoplayTimer);
    autoplayTimer = null;
    updatePlayState(false);
  };

  var resetAutoplay = function () {
    if (!autoplayTimer) {
      return;
    }
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(function () {
      setActive(currentIndex + 1);
    }, slideInterval);
  };

  var setActive = function (index) {
    if (!names.length) {
      return;
    }
    if (index < 0) {
      index = names.length - 1;
    } else if (index >= names.length) {
      index = 0;
    }
    currentIndex = index;
    var name = names[currentIndex];
    frameImage.src = resolvePath(name);
    frameImage.alt = "Gallery photo " + (currentIndex + 1);

    var activeThumb = null;
    thumbs.querySelectorAll(".gallery-thumb").forEach(function (thumb) {
      var thumbIndex = parseInt(thumb.getAttribute("data-index"), 10);
      if (thumbIndex === currentIndex) {
        thumb.classList.add("is-active");
        activeThumb = thumb;
      } else {
        thumb.classList.remove("is-active");
      }
    });

    if (activeThumb) {
      var target =
        activeThumb.offsetLeft -
        (thumbs.clientWidth - activeThumb.offsetWidth) / 2;
      var maxScroll = thumbs.scrollWidth - thumbs.clientWidth;
      if (target < 0) {
        target = 0;
      } else if (target > maxScroll) {
        target = maxScroll;
      }
      if (thumbs.scrollTo) {
        thumbs.scrollTo({ left: target, behavior: "smooth" });
      } else {
        thumbs.scrollLeft = target;
      }
    }
  };

  var buildThumbs = function () {
    thumbs.innerHTML = "";
    names.forEach(function (name, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "gallery-thumb";
      button.setAttribute("data-index", String(index));
      button.setAttribute("aria-label", "Show photo " + (index + 1));

      var img = document.createElement("img");
      img.src = resolvePath(name);
      img.alt = "";
      img.loading = "lazy";

      button.appendChild(img);
      button.addEventListener("click", function () {
        setActive(index);
        resetAutoplay();
      });

      thumbs.appendChild(button);
    });
  };

  var updateFullscreenButton = function () {
    var fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
    var isFullscreen = fullscreenElement === carousel;
    fullscreenBtn.setAttribute("aria-label", isFullscreen ? "Exit full screen" : "Enter full screen");
  };

  prevBtn.addEventListener("click", function () {
    setActive(currentIndex - 1);
    resetAutoplay();
  });
  nextBtn.addEventListener("click", function () {
    setActive(currentIndex + 1);
    resetAutoplay();
  });
  playBtn.addEventListener("click", function () {
    if (autoplayTimer) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });
  fullscreenBtn.addEventListener("click", function () {
    var fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
    if (fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      return;
    }
    if (carousel.requestFullscreen) {
      carousel.requestFullscreen().catch(function () {});
    } else if (carousel.webkitRequestFullscreen) {
      carousel.webkitRequestFullscreen();
    }
  });
  document.addEventListener("fullscreenchange", updateFullscreenButton);
  document.addEventListener("webkitfullscreenchange", updateFullscreenButton);

  fetchImages().then(function (data) {
    if (!data.length) {
      return;
    }
    names = data;
    buildThumbs();
    setActive(0);
    updateFullscreenButton();
  });
});
