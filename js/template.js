(function () {
  "use strict";

  var data = window.WEDDING_DATA;
  if (!data) {
    return;
  }

  var onReady = function (fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  };

  var setText = function (selector, value) {
    if (value === undefined || value === null) {
      return;
    }
    var node = document.querySelector(selector);
    if (node) {
      node.textContent = String(value);
    }
  };

  var setAttr = function (selector, attr, value) {
    if (value === undefined || value === null) {
      return;
    }
    var node = document.querySelector(selector);
    if (node) {
      node.setAttribute(attr, String(value));
    }
  };

  var setMeta = function (selector, value) {
    setAttr(selector, "content", value);
  };

  var setBackground = function (node, url) {
    if (!node || !url) {
      return;
    }
    node.style.backgroundImage = "url(" + url + ")";
  };

  var padTwo = function (value) {
    return value.length === 1 ? "0" + value : value;
  };

  var normalizeDate = function (value) {
    if (!value) {
      return "";
    }
    var raw = String(value).trim();
    if (/^\d{8}$/.test(raw)) {
      return raw;
    }
    var parts = raw.split(/[^\d]/).filter(Boolean);
    if (parts.length < 3) {
      return "";
    }
    return parts[0] + padTwo(parts[1]) + padTwo(parts[2]);
  };

  var buildGoogleCalendarUrl = function (event) {
    if (!event) {
      return "";
    }
    var start = normalizeDate(event.startDate);
    var end = normalizeDate(event.endDate || event.startDate);
    if (!start || !end) {
      return "";
    }
    var params = [
      "action=TEMPLATE",
      "text=" + encodeURIComponent(event.title || ""),
      "dates=" + start + "/" + end,
      "details=" + encodeURIComponent(event.description || ""),
      "location=" + encodeURIComponent(event.location || "")
    ];
    return "https://www.google.com/calendar/render?" + params.join("&");
  };

  var escapeIcsValue = function (value) {
    return String(value || "")
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\r?\n/g, "\\n");
  };

  var buildIcs = function (calendar) {
    if (!calendar || !calendar.event) {
      return "";
    }
    var event = calendar.event;
    var start = normalizeDate(event.startDate);
    var end = normalizeDate(event.endDate || event.startDate);
    if (!start || !end) {
      return "";
    }
    var prodId = calendar.prodId || "-//Wedding Invitation//EN";
    var uid = event.uid || ("wedding-" + start + "@event");
    var dtstamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    var lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:" + prodId,
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      "UID:" + uid,
      "DTSTAMP:" + dtstamp,
      "DTSTART;VALUE=DATE:" + start,
      "DTEND;VALUE=DATE:" + end
    ];
    if (event.title) {
      lines.push("SUMMARY:" + escapeIcsValue(event.title));
    }
    if (event.description) {
      lines.push("DESCRIPTION:" + escapeIcsValue(event.description));
    }
    if (event.location) {
      lines.push("LOCATION:" + escapeIcsValue(event.location));
    }
    lines.push("END:VEVENT", "END:VCALENDAR");
    return lines.join("\r\n");
  };

  var renderEvents = function (tbody, events) {
    if (!tbody || !Array.isArray(events)) {
      return;
    }
    tbody.innerHTML = "";
    events.forEach(function (event) {
      var row = document.createElement("tr");
      var cells = [event.name, event.date, event.time, event.venue];
      cells.forEach(function (value) {
        var cell = document.createElement("td");
        cell.textContent = value || "";
        row.appendChild(cell);
      });
      tbody.appendChild(row);
    });
  };

  var renderVenues = function (container, venues) {
    if (!container || !Array.isArray(venues)) {
      return;
    }
    container.innerHTML = "";
    venues.forEach(function (venue) {
      var column = document.createElement("div");
      column.className = "col-md-6 col-sm-6";

      var box = document.createElement("div");
      box.className = "event-venue-box";

      var icon = document.createElement("i");
      icon.className = "icon-location2";

      var title = document.createElement("h3");
      title.textContent = venue.label || "";

      var link = document.createElement("a");
      link.className = "map-link";
      if (venue.url) {
        link.href = venue.url;
      }
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = venue.text || "";

      var paragraph = document.createElement("p");
      paragraph.appendChild(link);

      box.appendChild(icon);
      box.appendChild(title);
      box.appendChild(paragraph);
      column.appendChild(box);
      container.appendChild(column);
    });
  };

  onReady(function () {
    var site = data.site || {};
    var hero = data.hero || {};
    var gallery = data.gallery || {};
    var highlights = data.highlights || {};
    var groom = data.groomEvents || {};
    var bride = data.brideEvents || {};
    var calendar = data.calendar || {};
    var audio = data.audio || {};
    var footer = data.footer || {};

    if (site.title) {
      document.title = site.title;
    }
    setMeta('meta[name="description"]', site.description);
    if (site.keywords) {
      var keywords = Array.isArray(site.keywords)
        ? site.keywords.join(", ")
        : site.keywords;
      setMeta('meta[name="keywords"]', keywords);
    }
    setMeta('meta[name="author"]', site.author);
    setMeta('meta[property="og:site_name"]', site.ogSiteName || site.title);
    setMeta('meta[property="og:title"]', site.ogTitle || site.title);
    setMeta('meta[property="og:description"]', site.ogDescription || site.description);
    setMeta('meta[property="og:url"]', site.url);
    setMeta('meta[property="og:image"]', site.ogImage);
    if (site.ogImageWidth) {
      setMeta('meta[property="og:image:width"]', site.ogImageWidth);
    }
    if (site.ogImageHeight) {
      setMeta('meta[property="og:image:height"]', site.ogImageHeight);
    }
    if (site.ogImageType) {
      setMeta('meta[property="og:image:type"]', site.ogImageType);
    }

    setText('[data-template="hero-title"]', hero.title);
    setText('[data-template="hero-date"]', hero.dateDisplay);
    setText('[data-template="hero-quote-text"]', hero.quoteText);
    setText('[data-template="hero-quote-source"]', hero.quoteSource);
    setText('[data-template="hero-description"]', hero.description);

    setAttr('[data-template="hero-fingerprint"]', "src", hero.fingerprintImage);
    setAttr('[data-template="hero-fingerprint"]', "alt", hero.fingerprintAlt);

    var header = document.getElementById("fh5co-header");
    setBackground(header, hero.backgroundImage);

    setText('[data-template="gallery-title"]', gallery.title);
    var galleryCarousel = document.getElementById("fh5co-gallery-carousel");
    if (galleryCarousel) {
      if (gallery.dir) {
        galleryCarousel.setAttribute("data-gallery-dir", gallery.dir);
      }
      if (gallery.json) {
        galleryCarousel.setAttribute("data-gallery-json", gallery.json);
      }
      if (gallery.interval) {
        galleryCarousel.setAttribute("data-gallery-interval", String(gallery.interval));
      }
    }

    setText('[data-template="highlights-title"]', highlights.title);
    var highlightVideo = document.querySelector('[data-template="highlights-video"]');
    setBackground(highlightVideo, highlights.backgroundImage);
    if (highlights.videoUrl) {
      setAttr('[data-template="highlights-link"]', "href", highlights.videoUrl);
    }

    setText('[data-template="groom-title"]', groom.title);
    renderEvents(
      document.querySelector('[data-template="groom-events"]'),
      groom.events
    );
    setText('[data-template="groom-address-label"]', groom.addressLabel);
    setAttr('[data-template="groom-address-link"]', "href", groom.addressUrl);
    setText('[data-template="groom-address-link"]', groom.addressText);

    setText('[data-template="bride-title"]', bride.title);
    renderEvents(
      document.querySelector('[data-template="bride-events"]'),
      bride.events
    );
    renderVenues(
      document.querySelector('[data-template="bride-venues"]'),
      bride.venues
    );

    setText('[data-template="save-date-button"]', calendar.ctaText);
    setText('[data-template="calendar-title"]', calendar.title);
    setText('[data-template="calendar-options"]', calendar.optionsText);
    setText('[data-template="calendar-google-link"]', calendar.googleText);
    setText('[data-template="calendar-ics-link"]', calendar.icsText);

    var googleLink = document.querySelector('[data-template="calendar-google-link"]');
    var googleUrl = calendar.googleUrl || buildGoogleCalendarUrl(calendar.event);
    if (googleLink && googleUrl) {
      googleLink.href = googleUrl;
    }

    var icsLink = document.querySelector('[data-template="calendar-ics-link"]');
    if (icsLink) {
      var icsContent = buildIcs(calendar);
      if (icsContent) {
        if (window.Blob && window.URL && window.URL.createObjectURL) {
          var blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
          icsLink.href = window.URL.createObjectURL(blob);
        } else {
          icsLink.href = "data:text/calendar;charset=utf-8," + encodeURIComponent(icsContent);
        }
        if (calendar.icsFilename) {
          icsLink.setAttribute("download", calendar.icsFilename);
        }
      }
    }

    setAttr('[data-template="audio-mp3"]', "src", audio.mp3);
    setAttr('[data-template="audio-ogg"]', "src", audio.ogg);

    setText('[data-template="footer-text"]', footer.text);
  });
}());
