/*!
 * Ribbon & Twine Gift & Card Co. — main.js
 * Vanilla JS only. Handles: theme toggle, RTL/LTR toggle, mobile drawer,
 * Home dropdown, sticky header state, scroll-reveal, horizontal strip
 * wheel/drag scrolling, accordions, occasion/gallery filters, counters,
 * confetti micro-interactions, and form validation.
 */
(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     0. Year stamp
     --------------------------------------------------------------------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------------------------------------------------------------------
     1. Theme (dark/light) — Tailwind class strategy + localStorage
     --------------------------------------------------------------------- */
  var THEME_KEY = "rt-theme";
  var root = document.documentElement;

  function applyTheme(theme) {
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    document.querySelectorAll("[data-theme-icon]").forEach(function (el) {
      el.textContent = theme === "dark" ? "☀️" : "🌙";
    });
    document.querySelectorAll("[data-theme-label]").forEach(function (el) {
      el.textContent = theme === "dark" ? "Light mode" : "Dark mode";
    });
  }

  var storedTheme = null;
  try {
    storedTheme = localStorage.getItem(THEME_KEY);
  } catch (e) {
    /* storage unavailable */
  }
  applyTheme(storedTheme || (root.classList.contains("dark") ? "dark" : "light"));

  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = root.classList.contains("dark") ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {}
    });
  });

  /* ---------------------------------------------------------------------
     2. Direction (RTL/LTR) — localStorage
     --------------------------------------------------------------------- */
  var DIR_KEY = "rt-dir";
  function applyDir(dir) {
    root.setAttribute("dir", dir);
    document.querySelectorAll("[data-dir-label]").forEach(function (el) {
      el.textContent = dir === "rtl" ? "LTR" : "RTL";
    });
  }
  var storedDir = null;
  try {
    storedDir = localStorage.getItem(DIR_KEY);
  } catch (e) {}
  applyDir(storedDir || root.getAttribute("dir") || "ltr");

  document.querySelectorAll("[data-dir-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = root.getAttribute("dir") === "rtl" ? "ltr" : "rtl";
      applyDir(next);
      try {
        localStorage.setItem(DIR_KEY, next);
      } catch (e) {}
    });
  });

  /* ---------------------------------------------------------------------
     3. Sticky header shrink state
     --------------------------------------------------------------------- */
  var header = document.querySelector("[data-site-header]");
  if (header) {
    var onScrollHeader = function () {
      if (window.scrollY > 18) {
        header.classList.add("shadow-lg", "shadow-plum-900/5");
      } else {
        header.classList.remove("shadow-lg", "shadow-plum-900/5");
      }
    };
    window.addEventListener("scroll", onScrollHeader, { passive: true });
    onScrollHeader();
  }

  /* ---------------------------------------------------------------------
     4. Mobile drawer (left slide-in, ticket-perforation edge)
     --------------------------------------------------------------------- */
  var drawer = document.querySelector("[data-mobile-drawer]");
  var backdrop = document.querySelector("[data-drawer-backdrop]");
  var openBtns = document.querySelectorAll("[data-drawer-open]");
  var closeBtns = document.querySelectorAll("[data-drawer-close]");

  function openDrawer() {
    if (!drawer || !backdrop) return;
    drawer.classList.add("is-open");
    backdrop.classList.add("is-open");
    document.body.classList.add("overflow-hidden");
    drawer.setAttribute("aria-hidden", "false");
    var firstLink = drawer.querySelector("a, button");
    if (firstLink) firstLink.focus();
  }
  function closeDrawer() {
    if (!drawer || !backdrop) return;
    drawer.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    document.body.classList.remove("overflow-hidden");
    drawer.setAttribute("aria-hidden", "true");
  }
  openBtns.forEach(function (b) {
    b.addEventListener("click", openDrawer);
  });
  closeBtns.forEach(function (b) {
    b.addEventListener("click", closeDrawer);
  });
  if (backdrop) backdrop.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDrawer();
  });

  /* Mobile "Home" accordion toggle inside drawer */
  var drawerHomeToggle = document.querySelector("[data-drawer-home-toggle]");
  var drawerHomePanel = document.querySelector("[data-drawer-home-panel]");
  if (drawerHomeToggle && drawerHomePanel) {
    drawerHomeToggle.addEventListener("click", function () {
      var open = drawerHomePanel.classList.toggle("hidden");
      drawerHomeToggle.setAttribute("aria-expanded", String(!open));
    });
  }

  /* ---------------------------------------------------------------------
     5. Home dropdown (desktop) — click + keyboard support (only nav item
        permitted a submenu, per project requirement)
     --------------------------------------------------------------------- */
  var homeDropdown = document.querySelector("[data-home-dropdown]");
  if (homeDropdown) {
    var trigger = homeDropdown.querySelector("[data-home-dropdown-trigger]");
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      var isOpen = homeDropdown.classList.toggle("is-open");
      trigger.setAttribute("aria-expanded", String(isOpen));
    });
    document.addEventListener("click", function (e) {
      if (!homeDropdown.contains(e.target)) {
        homeDropdown.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        homeDropdown.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------------------------------------------------------------------
     6. Scroll-reveal via IntersectionObserver
     --------------------------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal-tag");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var delay = entry.target.getAttribute("data-reveal-delay");
            if (delay) {
              entry.target.style.transitionDelay = delay + "ms";
            }
            entry.target.classList.add("is-revealed");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-revealed");
    });
  }

  /* ---------------------------------------------------------------------
     7. Horizontal scroll strips — wheel-redirect + drag-to-scroll
        (generic, selector-based, per project requirement)
     --------------------------------------------------------------------- */
  function initHorizontalScrollStrips() {
    var strips = document.querySelectorAll("[data-scroll-strip]");
    strips.forEach(function (strip) {
      strip.addEventListener(
        "wheel",
        function (e) {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            strip.scrollLeft += e.deltaY;
            e.preventDefault();
          }
        },
        { passive: false }
      );

      var isDown = false;
      var startX = 0;
      var startScroll = 0;

      strip.addEventListener("pointerdown", function (e) {
        isDown = true;
        startX = e.clientX;
        startScroll = strip.scrollLeft;
        strip.setPointerCapture(e.pointerId);
      });
      strip.addEventListener("pointermove", function (e) {
        if (!isDown) return;
        var dx = e.clientX - startX;
        strip.scrollLeft = startScroll - dx;
      });
      ["pointerup", "pointercancel", "pointerleave"].forEach(function (evt) {
        strip.addEventListener(evt, function () {
          isDown = false;
        });
      });
    });
  }
  initHorizontalScrollStrips();

  /* ---------------------------------------------------------------------
     8. Accordion (FAQ / personalization steps)
     --------------------------------------------------------------------- */
  document.querySelectorAll("[data-accordion-trigger]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".accordion-item");
      if (!item) return;
      var isOpen = item.getAttribute("data-open") === "true";
      var group = item.closest("[data-accordion-group]");
      if (group && group.getAttribute("data-accordion-single") === "true") {
        group.querySelectorAll(".accordion-item").forEach(function (other) {
          if (other !== item) {
            other.setAttribute("data-open", "false");
            var otherBtn = other.querySelector("[data-accordion-trigger]");
            if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
          }
        });
      }
      item.setAttribute("data-open", String(!isOpen));
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  /* ---------------------------------------------------------------------
     9. Occasion filter tabs (shop.html)
     --------------------------------------------------------------------- */
  var filterGroup = document.querySelector("[data-occasion-filters]");
  if (filterGroup) {
    var chips = filterGroup.querySelectorAll(".chip");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-product-card]"));
    var personalizeOnly = document.querySelector("[data-personalize-only]");
    var emptyState = document.querySelector("[data-shop-empty]");
    var introEl = document.querySelector("[data-category-intro]");
    var countEl = document.querySelector("[data-shop-count]");
    var shopGrid = document.querySelector("[data-shop-grid]");
    var paginationEl = document.querySelector("[data-shop-pagination]");
    var pageSize = (shopGrid && parseInt(shopGrid.getAttribute("data-page-size"), 10)) || 9;
    var currentPage = 1;
    var CATEGORY_INFO = {
      all: { icon: "🎁", name: "All Occasions", desc: "Every gift and card in the shop, organized by what you’re celebrating." },
      birthday: { icon: "🎂", name: "Birthday", desc: "Balloons, cards and engravable keepsakes for another trip around the sun." },
      anniversary: { icon: "💐", name: "Anniversary", desc: "Romantic gift boxes, cards and engraved jewelry keepsakes." },
      wedding: { icon: "💍", name: "Wedding & Engagement", desc: "Congratulations cards, boxed sets and engraved keepsakes for the couple." },
      newbaby: { icon: "🍼", name: "New Baby", desc: "Soft gift bundles, cards and engraved photo frames to welcome the newest arrival." },
      holiday: { icon: "🎄", name: "Holiday & Festive", desc: "Seasonal wrapped gifts, boxed card sets and monogrammed totes." },
      sympathy: { icon: "🤍", name: "Sympathy & Get Well", desc: "Gentle cards, comfort candles and engraved remembrance keepsakes." },
      graduation: { icon: "🎓", name: "Graduation & Congrats", desc: "Bold congratulations cards, gift bundles and engraved journals for every big win." }
    };

    function renderPagination(totalPages) {
      if (!paginationEl) return;
      if (totalPages <= 1) {
        paginationEl.classList.add("hidden");
        paginationEl.innerHTML = "";
        return;
      }
      paginationEl.classList.remove("hidden");
      var html = "";
      html +=
        '<button type="button" class="pagination-btn" data-page-nav="prev"' +
        (currentPage === 1 ? " disabled" : "") +
        ' aria-label="Previous page">' +
        '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>';
      for (var p = 1; p <= totalPages; p++) {
        html +=
          '<button type="button" class="pagination-btn' +
          (p === currentPage ? " is-active" : "") +
          '" data-page-num="' +
          p +
          '" aria-current="' +
          (p === currentPage ? "page" : "false") +
          '">' +
          p +
          "</button>";
      }
      html +=
        '<button type="button" class="pagination-btn" data-page-nav="next"' +
        (currentPage === totalPages ? " disabled" : "") +
        ' aria-label="Next page">' +
        '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>';
      paginationEl.innerHTML = html;

      paginationEl.querySelectorAll("[data-page-num]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          currentPage = parseInt(btn.getAttribute("data-page-num"), 10);
          applyFilters(false);
          if (shopGrid) shopGrid.scrollIntoView({ block: "start", behavior: "smooth" });
        });
      });
      var prevBtn = paginationEl.querySelector('[data-page-nav="prev"]');
      var nextBtn = paginationEl.querySelector('[data-page-nav="next"]');
      if (prevBtn) {
        prevBtn.addEventListener("click", function () {
          if (currentPage > 1) {
            currentPage--;
            applyFilters(false);
            if (shopGrid) shopGrid.scrollIntoView({ block: "start", behavior: "smooth" });
          }
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener("click", function () {
          if (currentPage < totalPages) {
            currentPage++;
            applyFilters(false);
            if (shopGrid) shopGrid.scrollIntoView({ block: "start", behavior: "smooth" });
          }
        });
      }
    }

    function applyFilters(resetPage) {
      var activeChip = filterGroup.querySelector('.chip[aria-pressed="true"]');
      var category = activeChip ? activeChip.getAttribute("data-filter") : "all";
      var wantPersonalize = personalizeOnly ? personalizeOnly.checked : false;

      if (resetPage !== false) currentPage = 1;

      var matching = cards.filter(function (card) {
        var matchesCategory = category === "all" || card.getAttribute("data-category") === category;
        var matchesPersonalize = !wantPersonalize || card.getAttribute("data-personalize") === "true";
        return matchesCategory && matchesPersonalize;
      });

      var totalPages = Math.max(1, Math.ceil(matching.length / pageSize));
      if (currentPage > totalPages) currentPage = totalPages;
      var start = (currentPage - 1) * pageSize;
      var end = start + pageSize;

      cards.forEach(function (card) {
        var idx = matching.indexOf(card);
        var show = idx !== -1 && idx >= start && idx < end;
        card.classList.toggle("hidden", !show);
      });

      renderPagination(totalPages);

      if (emptyState) {
        emptyState.classList.toggle("hidden", matching.length !== 0);
      }

      if (introEl) {
        var info = CATEGORY_INFO[category] || CATEGORY_INFO.all;
        var iconEl = introEl.querySelector("[data-intro-icon]");
        var nameEl = introEl.querySelector("[data-intro-name]");
        var descEl = introEl.querySelector("[data-intro-desc]");
        if (iconEl) iconEl.textContent = info.icon;
        if (nameEl) nameEl.textContent = info.name;
        if (descEl) descEl.textContent = info.desc;
      }
      if (countEl) {
        var noun = wantPersonalize ? " personalizable gift" : " gift";
        if (matching.length === 0) {
          countEl.textContent = "Showing 0" + noun + "s";
        } else {
          var shownFrom = start + 1;
          var shownTo = Math.min(end, matching.length);
          countEl.textContent =
            "Showing " + shownFrom + "–" + shownTo + " of " + matching.length + noun + (matching.length === 1 ? "" : "s") +
            (category === "all" ? "" : " for " + (CATEGORY_INFO[category] ? CATEGORY_INFO[category].name : category));
        }
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) {
          c.setAttribute("aria-pressed", "false");
        });
        chip.setAttribute("aria-pressed", "true");
        applyFilters();
      });
    });

    if (personalizeOnly) {
      personalizeOnly.addEventListener("change", applyFilters);
    }

    /* Hero collage tiles jump straight to a filtered occasion (shop.html only) */
    document.querySelectorAll("[data-jump-filter]").forEach(function (el) {
      el.addEventListener("click", function () {
        var target = filterGroup.querySelector('.chip[data-filter="' + el.getAttribute("data-jump-filter") + '"]');
        if (target) target.click();
      });
    });

    /* Deep-link support: shop.html?occasion=birthday&personalize=1 */
    var params = new URLSearchParams(window.location.search);
    var pre = params.get("occasion");
    if (pre) {
      var match = filterGroup.querySelector('.chip[data-filter="' + pre + '"]');
      if (match) {
        chips.forEach(function (c) {
          c.setAttribute("aria-pressed", "false");
        });
        match.setAttribute("aria-pressed", "true");
        match.scrollIntoView({ block: "nearest", inline: "center" });
      }
    }
    if (personalizeOnly && (params.get("personalize") === "1" || params.get("personalize") === "true")) {
      personalizeOnly.checked = true;
    }
    applyFilters();
  }

  /* ---------------------------------------------------------------------
     10. Gallery filter (gallery.html)
     --------------------------------------------------------------------- */
  var galleryFilters = document.querySelector("[data-gallery-filters]");
  if (galleryFilters) {
    var gChips = galleryFilters.querySelectorAll(".chip");
    var tiles = document.querySelectorAll("[data-gallery-tile]");
    var galleryGrid = document.querySelector("[data-gallery-grid]");
    var gridTiles = Array.prototype.slice.call(document.querySelectorAll("[data-gallery-grid] [data-gallery-tile]"));
    var spotlightTile = document.querySelector(".gallery-spotlight[data-gallery-tile]");
    var galleryCountEl = document.querySelector("[data-gallery-count]");
    var galleryEmptyEl = document.querySelector("[data-gallery-empty]");
    var galleryPaginationEl = document.querySelector("[data-gallery-pagination]");
    var galleryPageSize = (galleryGrid && parseInt(galleryGrid.getAttribute("data-page-size"), 10)) || 8;
    var galleryCurrentCat = "all";
    var galleryCurrentPage = 1;

    function renderGalleryPagination(totalPages) {
      if (!galleryPaginationEl) return;
      if (totalPages <= 1) {
        galleryPaginationEl.classList.add("hidden");
        galleryPaginationEl.innerHTML = "";
        return;
      }
      galleryPaginationEl.classList.remove("hidden");
      var html = "";
      html +=
        '<button type="button" class="pagination-btn" data-gallery-page-nav="prev"' +
        (galleryCurrentPage === 1 ? " disabled" : "") +
        ' aria-label="Previous page">' +
        '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>';
      for (var p = 1; p <= totalPages; p++) {
        html +=
          '<button type="button" class="pagination-btn' +
          (p === galleryCurrentPage ? " is-active" : "") +
          '" data-gallery-page-num="' +
          p +
          '" aria-current="' +
          (p === galleryCurrentPage ? "page" : "false") +
          '">' +
          p +
          "</button>";
      }
      html +=
        '<button type="button" class="pagination-btn" data-gallery-page-nav="next"' +
        (galleryCurrentPage === totalPages ? " disabled" : "") +
        ' aria-label="Next page">' +
        '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>';
      galleryPaginationEl.innerHTML = html;

      galleryPaginationEl.querySelectorAll("[data-gallery-page-num]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          galleryCurrentPage = parseInt(btn.getAttribute("data-gallery-page-num"), 10);
          applyGalleryFilter(galleryCurrentCat, false);
          if (galleryGrid) galleryGrid.scrollIntoView({ block: "start", behavior: "smooth" });
        });
      });
      var prevBtn = galleryPaginationEl.querySelector('[data-gallery-page-nav="prev"]');
      var nextBtn = galleryPaginationEl.querySelector('[data-gallery-page-nav="next"]');
      if (prevBtn) {
        prevBtn.addEventListener("click", function () {
          if (galleryCurrentPage > 1) {
            galleryCurrentPage--;
            applyGalleryFilter(galleryCurrentCat, false);
            if (galleryGrid) galleryGrid.scrollIntoView({ block: "start", behavior: "smooth" });
          }
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener("click", function () {
          if (galleryCurrentPage < totalPages) {
            galleryCurrentPage++;
            applyGalleryFilter(galleryCurrentCat, false);
            if (galleryGrid) galleryGrid.scrollIntoView({ block: "start", behavior: "smooth" });
          }
        });
      }
    }

    function applyGalleryFilter(cat, resetPage) {
      galleryCurrentCat = cat;
      if (resetPage !== false) galleryCurrentPage = 1;

      var showSpotlight = !!spotlightTile && (cat === "all" || spotlightTile.getAttribute("data-category") === cat);
      if (spotlightTile) spotlightTile.classList.toggle("hidden", !showSpotlight);

      var matching = gridTiles.filter(function (tile) {
        return cat === "all" || tile.getAttribute("data-category") === cat;
      });

      var totalPages = Math.max(1, Math.ceil(matching.length / galleryPageSize));
      if (galleryCurrentPage > totalPages) galleryCurrentPage = totalPages;
      var start = (galleryCurrentPage - 1) * galleryPageSize;
      var end = start + galleryPageSize;

      gridTiles.forEach(function (tile) {
        var idx = matching.indexOf(tile);
        var show = idx !== -1 && idx >= start && idx < end;
        tile.classList.toggle("hidden", !show);
      });

      renderGalleryPagination(totalPages);

      var visible = matching.length + (showSpotlight ? 1 : 0);
      if (galleryCountEl) {
        galleryCountEl.textContent = "Showing " + visible + " of " + tiles.length + " photo" + (tiles.length === 1 ? "" : "s");
      }
      if (galleryEmptyEl) {
        galleryEmptyEl.classList.toggle("hidden", visible !== 0);
      }
    }

    gChips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        gChips.forEach(function (c) {
          c.setAttribute("aria-pressed", "false");
        });
        chip.setAttribute("aria-pressed", "true");
        applyGalleryFilter(chip.getAttribute("data-filter"));
      });
    });

    applyGalleryFilter("all");
  }

  /* ---------------------------------------------------------------------
     11. Count-up stats (hand-rolled requestAnimationFrame)
     --------------------------------------------------------------------- */
  var counters = document.querySelectorAll("[data-count-to]");
  if (counters.length && "IntersectionObserver" in window) {
    var countIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var target = parseInt(el.getAttribute("data-count-to"), 10) || 0;
          var suffix = el.getAttribute("data-count-suffix") || "";
          var duration = 1400;
          var startTime = null;

          function step(ts) {
            if (!startTime) startTime = ts;
            var progress = Math.min((ts - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target).toLocaleString() + suffix;
            if (progress < 1) {
              requestAnimationFrame(step);
            }
          }
          requestAnimationFrame(step);
          countIO.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) {
      countIO.observe(el);
    });
  }

  /* ---------------------------------------------------------------------
     12. Confetti micro-interaction (lightweight vanilla canvas burst —
         no external dependency; fired on form success + celebratory CTAs)
     --------------------------------------------------------------------- */
  function fireConfetti(originEl) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.inset = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");

    var originX = window.innerWidth / 2;
    var originY = window.innerHeight / 2.6;
    if (originEl) {
      var rect = originEl.getBoundingClientRect();
      originX = rect.left + rect.width / 2;
      originY = rect.top;
    }

    var colors = ["#9B2C6F", "#1F7A5C", "#EE97A8", "#B84C8C", "#7AC6A5"];
    var pieces = [];
    for (var i = 0; i < 90; i++) {
      pieces.push({
        x: originX,
        y: originY,
        vx: (Math.random() - 0.5) * 11,
        vy: Math.random() * -11 - 3,
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        shape: Math.random() > 0.5 ? "rect" : "circle"
      });
    }

    var gravity = 0.32;
    var frame = 0;
    var maxFrames = 110;

    function tick() {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(function (p) {
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
      if (frame < maxFrames) {
        requestAnimationFrame(tick);
      } else {
        canvas.remove();
      }
    }
    requestAnimationFrame(tick);
  }

  document.querySelectorAll("[data-confetti-trigger]").forEach(function (el) {
    el.addEventListener("click", function () {
      fireConfetti(el);
    });
  });

  /* ---------------------------------------------------------------------
     13. Form validation (newsletter, contact, personalization enquiry)
     --------------------------------------------------------------------- */
  function validateField(field) {
    var value = field.value.trim();
    var errorEl = document.querySelector('[data-error-for="' + field.name + '"]');
    var message = "";

    if (field.hasAttribute("required") && !value) {
      message = "This field is required.";
    } else if (field.type === "email" && value) {
      var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(value)) message = "Enter a valid email address.";
    } else if (field.type === "tel" && value) {
      var telRe = /^[0-9()+\-\s]{7,}$/;
      if (!telRe.test(value)) message = "Enter a valid phone number.";
    } else if (field.hasAttribute("minlength") && value.length < parseInt(field.getAttribute("minlength"), 10)) {
      message = "Please enter at least " + field.getAttribute("minlength") + " characters.";
    }

    if (message) {
      field.classList.add("field-error");
      field.setAttribute("aria-invalid", "true");
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove("hidden");
      }
      return false;
    } else {
      field.classList.remove("field-error");
      field.removeAttribute("aria-invalid");
      if (errorEl) {
        errorEl.textContent = "";
        errorEl.classList.add("hidden");
      }
      return true;
    }
  }

  document.querySelectorAll("[data-validate-form]").forEach(function (form) {
    var fields = form.querySelectorAll("input, textarea, select");

    fields.forEach(function (field) {
      field.addEventListener("blur", function () {
        validateField(field);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var allValid = true;
      fields.forEach(function (field) {
        if (!validateField(field)) allValid = false;
      });

      if (!allValid) {
        var firstInvalid = form.querySelector(".field-error");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var successEl = form.parentElement.querySelector("[data-form-success]");
      form.classList.add("hidden");
      if (successEl) {
        successEl.classList.remove("hidden");
        fireConfetti(successEl);
        successEl.setAttribute("tabindex", "-1");
        successEl.focus();
      }
      form.reset();
    });
  });

  /* ---------------------------------------------------------------------
     14. GLightbox init (gallery.html) — guarded so pages without it don't
         error out
     --------------------------------------------------------------------- */
  if (window.GLightbox) {
    window.GLightbox({
      selector: ".glightbox",
      touchNavigation: true,
      loop: true
    });
  }

  /* ---------------------------------------------------------------------
     15. Active nav link (aria-current) based on document location
     --------------------------------------------------------------------- */
  var currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav-link]").forEach(function (link) {
    var href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.setAttribute("aria-current", "page");
    }
  });

  /* ---------------------------------------------------------------------
     16. Back-to-top button
     --------------------------------------------------------------------- */
  var backToTopBtn = document.querySelector("[data-back-to-top]");
  if (backToTopBtn) {
    var toggleBackToTop = function () {
      backToTopBtn.classList.toggle("is-visible", window.scrollY > 480);
    };
    window.addEventListener("scroll", toggleBackToTop, { passive: true });
    toggleBackToTop();
    backToTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
