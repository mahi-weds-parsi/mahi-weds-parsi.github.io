document.addEventListener("DOMContentLoaded", function () {
  var list = document.getElementById("fh5co-gallery-list");
  if (!list) {
    return;
  }

  var galleryDir = list.getAttribute("data-gallery-dir") || "images/gallery/";
  var galleryJson = list.getAttribute("data-gallery-json") || "images/gallery.json";
  var initialCount = parseInt(list.getAttribute("data-gallery-initial") || "5", 10);
  if (!initialCount || initialCount < 1) {
    initialCount = 5;
  }

  var imagePattern = /\.(png|jpe?g|gif|webp)$/i;

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

  var initLightbox = function () {
    if (
      !window.jQuery ||
      !window.jQuery.fn ||
      !window.jQuery.fn.magnificPopup ||
      list.getAttribute("data-popup-init")
    ) {
      return;
    }
    window.jQuery(list).magnificPopup({
      delegate: "a.image-popup",
      type: "image",
      removalDelay: 300,
      mainClass: "mfp-with-zoom",
      gallery: {
        enabled: true,
        navigateByImgClick: true,
        arrows: true,
        tPrev: "Previous",
        tNext: "Next"
      },
      zoom: {
        enabled: true,
        duration: 300,
        easing: "ease-in-out",
        opener: function (openerElement) {
          return openerElement;
        }
      }
    });
    list.setAttribute("data-popup-init", "true");
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

  var createItem = function (name) {
    var path = resolvePath(name);
    var item = document.createElement("li");
    item.className = "one-third animate-box animated-fast fadeIn";
    item.style.backgroundImage = "url(" + path + ")";

    var link = document.createElement("a");
    link.href = path;
    link.className = "image-popup";

    var summary = document.createElement("div");
    summary.className = "case-studies-summary";

    link.appendChild(summary);
    item.appendChild(link);

    return item;
  };

  var createMoreItem = function (names) {
    var item = document.createElement("li");
    item.className = "one-third animate-box animated-fast fadeIn gallery-more";
    item.style.backgroundImage = "url(" + resolvePath(names[0]) + ")";

    var link = document.createElement("a");
    link.href = "#";
    link.className = "gallery-more-link";
    link.setAttribute("aria-label", "Show more photos");

    var summary = document.createElement("div");
    summary.className = "case-studies-summary";

    var count = document.createElement("span");
    count.className = "more-count";
    count.textContent = "+" + names.length;

    var label = document.createElement("span");
    label.className = "more-label";
    label.textContent = "More Photos";

    summary.appendChild(count);
    summary.appendChild(label);
    link.appendChild(summary);
    item.appendChild(link);

    link.addEventListener("click", function (event) {
      event.preventDefault();
      item.parentNode.removeChild(item);
      names.forEach(function (name) {
        list.appendChild(createItem(name));
      });
    });

    return item;
  };

  fetchImages().then(function (names) {
    list.innerHTML = "";
    if (!names.length) {
      return;
    }
    var initial = names.slice(0, initialCount);
    var rest = names.slice(initialCount);

    initial.forEach(function (name) {
      list.appendChild(createItem(name));
    });

    if (rest.length) {
      list.appendChild(createMoreItem(rest));
    }
    initLightbox();
  });
});
