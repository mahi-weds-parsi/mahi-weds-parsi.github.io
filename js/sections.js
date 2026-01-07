document.addEventListener("DOMContentLoaded", function () {
  var configPath = "config/sections.json";
  var defaultOrder = ["home", "gallery", "highlights", "groom-events", "bride-events"];

  var applyOrder = function (order) {
    var resolved = Array.isArray(order) && order.length ? order : defaultOrder;
    var page = document.getElementById("page") || document.body;
    var nav = page.querySelector(".fh5co-nav") || document.querySelector(".fh5co-nav");
    var navList = document.querySelector(".menu-1 .dropdown") || document.querySelector(".menu-1 > ul");

    var sectionMap = {};
    document.querySelectorAll("[data-section]").forEach(function (section) {
      sectionMap[section.getAttribute("data-section")] = section;
    });

    var navMap = {};
    document.querySelectorAll("[data-nav-section]").forEach(function (item) {
      navMap[item.getAttribute("data-nav-section")] = item;
    });

    Object.keys(sectionMap).forEach(function (key) {
      sectionMap[key].style.display = "none";
    });

    Object.keys(navMap).forEach(function (key) {
      navMap[key].style.display = "none";
    });

    var insertAfter = nav;
    resolved.forEach(function (key) {
      var section = sectionMap[key];
      if (section) {
        section.style.display = "";
        if (page && insertAfter && insertAfter.nextSibling) {
          page.insertBefore(section, insertAfter.nextSibling);
        } else if (page) {
          page.appendChild(section);
        }
        insertAfter = section;
      }
    });

    if (navList) {
      resolved.forEach(function (key) {
        var item = navMap[key];
        if (item) {
          item.style.display = "";
          navList.appendChild(item);
        }
      });
    }
  };

  fetch(configPath, { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Config not found");
      }
      return response.json();
    })
    .then(function (data) {
      applyOrder(data && data.order);
    })
    .catch(function () {
      applyOrder(defaultOrder);
    });
});
