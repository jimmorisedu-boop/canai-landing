/* CanAI landing — motion per skill B7/B11
   Base curve .22,1,.36,1; reveals once via IntersectionObserver;
   tagline words activate one by one across a trigger line (rAF throttled). */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- scroll reveals ---------- */

  var revealEls = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('on'); });
  } else {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('on');
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(function (el) { revealIO.observe(el); });
  }

  /* ---------- nav scrollspy ---------- */

  var spyLinks = Array.prototype.slice.call(document.querySelectorAll('[data-spy]'));
  var spySections = spyLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  function setCurrent(id) {
    spyLinks.forEach(function (a) {
      if (a.getAttribute('href') === '#' + id) {
        a.setAttribute('aria-current', 'true');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  if ('IntersectionObserver' in window && spySections.length) {
    var spyIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setCurrent(entry.target.id);
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    spySections.forEach(function (s) { spyIO.observe(s); });
  }

  /* ---------- mobile menu ---------- */

  var menuBtn = document.querySelector('.menu-btn');
  var menu = document.getElementById('mobile-menu');
  var menuHiddenTimer = null;

  function openMenu() {
    if (menuHiddenTimer) { clearTimeout(menuHiddenTimer); menuHiddenTimer = null; }
    menu.hidden = false;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { menu.classList.add('open'); });
    });
    document.body.classList.add('menu-open');
    document.body.style.overflow = 'hidden';
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Close menu');
    var first = menu.querySelector('a');
    if (first) first.focus({ preventScroll: true });
  }

  function closeMenu() {
    if (menu.hidden) return;
    menu.classList.remove('open');
    document.body.classList.remove('menu-open');
    document.body.style.overflow = '';
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
    menuHiddenTimer = setTimeout(function () { menu.hidden = true; }, 350);
  }

  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () {
      if (menu.hidden) openMenu(); else closeMenu();
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) {
        closeMenu();
        menuBtn.focus();
      }
    });

    menu.addEventListener('transitionend', function (e) {
      if (e.target === menu && e.propertyName === 'opacity' && !menu.classList.contains('open')) {
        menu.hidden = true;
      }
    });
  }

  /* ---------- tagline reveal: word by word across a trigger line ---------- */

  var tagline = document.querySelector('[data-tagline]');

  if (tagline) {
    var words = tagline.textContent.trim().split(/\s+/);
    tagline.innerHTML = words.map(function (w) {
      return '<span class="w">' + w + '</span>';
    }).join(' ');

    var spans = Array.prototype.slice.call(tagline.querySelectorAll('.w'));

    // Within one line, sweep left to right: delay by column index, capped at 400ms.
    function assignDelays() {
      var lines = [];
      spans.forEach(function (span) {
        var top = span.offsetTop;
        var line = lines.find(function (l) { return Math.abs(l.top - top) < 4; });
        if (!line) { line = { top: top, items: [] }; lines.push(line); }
        line.items.push(span);
      });
      lines.forEach(function (line) {
        line.items.forEach(function (span, i) {
          span.style.transitionDelay = Math.min(i * 45, 400) + 'ms';
        });
      });
    }

    if (reduceMotion) {
      var tagIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            spans.forEach(function (s) { s.classList.add('on'); });
            tagIO.disconnect();
          }
        });
      }, { threshold: 0.3 });
      tagIO.observe(tagline);
    } else {
      var pendingFrame = false;

      function tick() {
        pendingFrame = false;
        var trigger = window.innerHeight * 0.78;
        spans.forEach(function (span) {
          if (!span.classList.contains('on') && span.getBoundingClientRect().top < trigger) {
            span.classList.add('on');
          }
        });
      }

      function requestTick() {
        if (!pendingFrame) {
          pendingFrame = true;
          requestAnimationFrame(tick);
        }
      }

      function start() {
        assignDelays();
        tick();
        window.addEventListener('scroll', requestTick, { passive: true });
        window.addEventListener('resize', function () {
          assignDelays();
          requestTick();
        });
      }

      if (document.readyState === 'complete') {
        start();
      } else {
        window.addEventListener('load', start);
      }
    }
  }

  /* ---------- faq accordion ---------- */

  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      var open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (panel) panel.hidden = !open;
    });
  });
})();
