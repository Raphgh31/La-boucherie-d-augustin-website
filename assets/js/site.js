/* La Boucherie d'Augustin — navigation entre pages et horaires en direct */
(function () {
  "use strict";

  /* Horaires (heure de Paris). 0 = dimanche … 6 = samedi */
  var HOURS = {
    0: [7 * 60, 12 * 60 + 30],
    1: [9 * 60, 19 * 60],
    2: [7 * 60, 19 * 60],
    3: [7 * 60, 19 * 60],
    4: [7 * 60, 19 * 60],
    5: [7 * 60, 19 * 60],
    6: [7 * 60, 19 * 60]
  };
  var DAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

  function fmt(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return h + "h" + (m ? String(m).padStart(2, "0") : "");
  }

  function parisNow() {
    try {
      var parts = new Intl.DateTimeFormat("fr-FR", {
        timeZone: "Europe/Paris", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false
      }).formatToParts(new Date());
      var map = {};
      parts.forEach(function (p) { map[p.type] = p.value; });
      var wd = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."].indexOf(map.weekday);
      if (wd < 0) throw new Error("jour");
      return { day: wd, min: (parseInt(map.hour, 10) % 24) * 60 + parseInt(map.minute, 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function statusText() {
    var now = parisNow();
    var today = HOURS[now.day];
    if (now.min >= today[0] && now.min < today[1]) {
      return { open: true, text: "Ouvert maintenant · jusqu'à " + fmt(today[1]) };
    }
    if (now.min < today[0]) {
      return { open: false, text: "Fermé · ouvre aujourd'hui à " + fmt(today[0]) };
    }
    var next = (now.day + 1) % 7;
    return { open: false, text: "Fermé · ouvre demain " + DAYS[next] + " à " + fmt(HOURS[next][0]) };
  }

  function paintStatus() {
    var s = statusText();
    document.querySelectorAll("[data-status]").forEach(function (el) {
      el.textContent = s.text;
      el.classList.toggle("is-open", s.open);
      el.classList.toggle("is-closed", !s.open);
    });
    var day = parisNow().day;
    document.querySelectorAll("[data-day]").forEach(function (row) {
      row.classList.toggle("today", Number(row.getAttribute("data-day")) === day);
    });
  }
  paintStatus();
  setInterval(paintStatus, 60000);

  /* ---- Pages qui glissent de gauche à droite ---- */
  var page = document.querySelector(".page");
  var current = page ? Number(page.getAttribute("data-index")) : 0;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function store(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  function read(k) { try { var v = sessionStorage.getItem(k); sessionStorage.removeItem(k); return v; } catch (e) { return null; } }

  var dir = read("augustin-dir");
  if (page && !reduce) {
    page.classList.add(dir === "left" ? "enter-from-left" : "enter-from-right");
  }

  function go(href, targetIndex) {
    var forward = targetIndex >= current;
    store("augustin-dir", forward ? "right" : "left");
    if (!page || reduce) { window.location.href = href; return; }
    page.classList.remove("enter-from-left", "enter-from-right");
    page.classList.add(forward ? "leave-to-left" : "leave-to-right");
    setTimeout(function () { window.location.href = href; }, 260);
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[data-index]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var idx = Number(a.getAttribute("data-index"));
    if (idx === current && a.getAttribute("aria-current") === "page") { e.preventDefault(); return; }
    e.preventDefault();
    go(a.getAttribute("href"), idx);
  });

  /* Balayage horizontal sur mobile : page précédente / suivante */
  var prev = document.querySelector(".pager .prev");
  var next = document.querySelector(".pager .next");
  var sx = 0, sy = 0, tracking = false;
  document.addEventListener("touchstart", function (e) {
    if (e.touches.length !== 1) return;
    var t = e.target;
    if (t.closest && t.closest(".tabs, .carte, table, input, textarea")) { tracking = false; return; }
    tracking = true; sx = e.touches[0].clientX; sy = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (!tracking) return;
    tracking = false;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) < 90 || Math.abs(dy) > Math.abs(dx) * 0.5) return;
    var target = dx < 0 ? next : prev;
    if (target) go(target.getAttribute("href"), Number(target.getAttribute("data-index")));
  }, { passive: true });

  /* L'onglet actif reste visible dans la bande d'onglets sur mobile */
  var active = document.querySelector('.tabs a[aria-current="page"]');
  if (active && active.scrollIntoView) {
    var bar = active.parentElement.parentElement;
    if (bar && bar.scrollWidth > bar.clientWidth) {
      bar.scrollLeft = active.offsetLeft - bar.clientWidth / 2 + active.offsetWidth / 2;
    }
  }

  /* Bouton « copier » pour le téléphone et l'e-mail */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy");
      var done = function () { btn.textContent = "Copié"; setTimeout(function () { btn.textContent = "Copier"; }, 1600); };
      try {
        navigator.clipboard.writeText(value).then(done, function () { selectText(btn.previousElementSibling); });
      } catch (err) { selectText(btn.previousElementSibling); }
    });
  });
  function selectText(el) {
    if (!el) return;
    var r = document.createRange(); r.selectNodeContents(el);
    var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  }

  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
