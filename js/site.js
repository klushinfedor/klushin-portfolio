/* Фёдор Клушин — портфолио. Прогрессивное улучшение. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---- mobile nav ---- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    var setNavOpen = function (open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      var label = open ? "Закрыть меню" : "Открыть меню";
      toggle.setAttribute("aria-label", window.PortfolioI18n ? window.PortfolioI18n.t(label) : label);
    };
    toggle.addEventListener("click", function () {
      setNavOpen(!nav.classList.contains("is-open"));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        setNavOpen(false);
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setNavOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("is-open") && !nav.contains(e.target) && !toggle.contains(e.target)) {
        setNavOpen(false);
      }
    });
  }

  /* ---- live clock, Europe/Moscow ---- */
  var clock = document.getElementById("clock");
  if (clock) {
    var tick = function () {
      try {
        var t = new Intl.DateTimeFormat("ru-RU", {
          hour: "2-digit", minute: "2-digit", second: "2-digit",
          timeZone: "Europe/Moscow", hour12: false
        }).format(new Date());
        clock.textContent = "СПб " + t;
      } catch (e) {
        clock.textContent = "";
      }
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---- reveal + wordmark ---- */
  if (!reduce) {
    document.body.classList.add("js-anim");

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var lines = document.querySelectorAll(".wordmark .line > span");
        lines.forEach(function (el, i) {
          el.style.transition = "transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) " + (0.08 + i * 0.11) + "s";
          el.style.transform = "translateY(0)";
        });
      });
    });

    var pending = [].slice.call(document.querySelectorAll(".reveal"));
    var reveal = function (el) {
      el.style.transition = "opacity 0.6s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
      el.style.opacity = "1";
      el.style.transform = "none";
    };
    var sweep = function () {
      var h = window.innerHeight || document.documentElement.clientHeight;
      pending = pending.filter(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < h * 0.92 && r.bottom > 0) { reveal(el); return false; }
        return true;
      });
      if (!pending.length) {
        window.removeEventListener("scroll", sweep);
        window.removeEventListener("resize", sweep);
      }
    };
    sweep();
    window.addEventListener("scroll", sweep, { passive: true });
    window.addEventListener("resize", sweep);
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) sweep();
    });
    /* ultimate safety net — never leave content hidden */
    setTimeout(function () { pending.forEach(reveal); pending = []; }, 1500);
  }

  /* ---- cursor-follow preview (home work list) ---- */
  var preview = document.getElementById("preview");
  var rows = document.querySelectorAll("[data-preview] .row");
  if (preview && rows.length && fine) {
    var figures = preview.querySelectorAll(".preview__fig");
    var tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    var cx = tx, cy = ty, sc = 0.92, active = false, raf = null;

    var loop = function () {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      sc += ((active ? 1 : 0.92) - sc) * 0.16;
      preview.style.transform =
        "translate(" + cx + "px," + cy + "px) translate(-50%,-50%) scale(" + sc.toFixed(3) + ") rotate(-3deg)";
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", function (e) {
      tx = e.clientX;
      ty = e.clientY;
      if (!raf) loop();
    });

    rows.forEach(function (row) {
      row.addEventListener("mouseenter", function () {
        var idx = row.getAttribute("data-thumb");
        figures.forEach(function (f) {
          f.classList.toggle("is-active", f.getAttribute("data-thumb") === idx);
        });
        active = true;
        preview.classList.add("is-on");
      });
      row.addEventListener("mouseleave", function () {
        active = false;
        preview.classList.remove("is-on");
      });
    });
  }

  /* ---- lightbox (case pages) ---- */
  var lb = document.getElementById("lightbox");
  if (lb) {
    var lbImg = document.getElementById("lightbox-img");
    var open = function (src) {
      lbImg.src = src;
      lb.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };
    var close = function () {
      lb.classList.remove("is-open");
      lbImg.src = "";
      document.body.style.overflow = "";
    };
    document.querySelectorAll("[data-full]").forEach(function (b) {
      b.addEventListener("click", function () { open(b.getAttribute("data-full")); });
    });
    lb.addEventListener("click", function (e) {
      if (e.target === lb || e.target.classList.contains("lightbox__close")) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* Quiet exit before same-site page navigation; native navigation remains the fallback. */
  var leaving = false;
  document.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest("a[href]");
    if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || reduce || leaving) return;
    if (link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
    var dest = new URL(link.href, window.location.href);
    if (dest.protocol !== window.location.protocol || dest.host !== window.location.host) return;
    if (dest.pathname === window.location.pathname && dest.search === window.location.search) return;
    e.preventDefault();
    leaving = true;
    document.body.classList.add("is-leaving");
    setTimeout(function () { window.location.assign(dest.href); }, 320);
  });
  window.addEventListener("pageshow", function () {
    leaving = false;
    document.body.classList.remove("is-leaving");
  });
})();
