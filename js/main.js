/* Sparkle Maid Cleaning Services — shared behaviour */
(function () {
  'use strict';

  // ---- Config -------------------------------------------------------------
  // Quote requests need somewhere to go. Paste a form-handling URL here
  // (for example a Formspree or Netlify Forms endpoint) and submissions will be
  // POSTed to it. Until it is set, the form validates and shows the success
  // message but does NOT deliver the request anywhere.
  var FORM_ENDPOINT = '';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Header: shadow on scroll + mobile menu -----------------------------
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('mobile-menu');
  if (toggle && menu) {
    var setMenu = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.classList.toggle('is-open', open);
    };
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 960) setMenu(false); });
  }

  // ---- Scroll reveal ------------------------------------------------------
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  // ---- Testimonial slider -------------------------------------------------
  var slider = document.querySelector('[data-slider]');
  if (slider) {
    var track = slider.querySelector('.slider-track');
    var cards = Array.prototype.slice.call(track.children);
    var prev = slider.querySelector('[data-prev]');
    var next = slider.querySelector('[data-next]');
    var dotsWrap = slider.querySelector('.slider-dots');
    var dots = [];

    cards.forEach(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Go to review ' + (i + 1));
      b.addEventListener('click', function () { goTo(i); });
      dotsWrap.appendChild(b);
      dots.push(b);
    });

    var step = function () { return cards[0].getBoundingClientRect().width + 24; };
    var current = function () { return Math.min(cards.length - 1, Math.round(track.scrollLeft / step())); };
    var goTo = function (i) { track.scrollTo({ left: i * step(), behavior: reduceMotion ? 'auto' : 'smooth' }); };
    var update = function () {
      var i = current();
      var max = track.scrollWidth - track.clientWidth - 4;
      dots.forEach(function (d, n) { d.setAttribute('aria-current', String(n === i)); });
      slider.querySelector('.slider').classList.toggle('is-static', track.scrollWidth <= track.clientWidth + 4);
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft >= max;
    };
    prev.addEventListener('click', function () { goTo(current() - 1); });
    next.addEventListener('click', function () { goTo(current() + 1); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // ---- Footer year --------------------------------------------------------
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // ---- Contact form -------------------------------------------------------
  var form = document.getElementById('quote-form');
  if (form) {
    var card = form.closest('.form-card');
    var status = form.querySelector('.form-status');
    var dateInput = form.elements.date;

    if (dateInput) {
      var t = new Date();
      dateInput.min = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
    }

    // Preselect the service when arriving from a "Request a Quote" button.
    var wanted = new URLSearchParams(window.location.search).get('service');
    if (wanted && form.elements.service) {
      Array.prototype.forEach.call(form.elements.service.options, function (o) {
        if (o.value === wanted) form.elements.service.value = wanted;
      });
    }

    var rules = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Please enter your full name.'; },
      phone: function (v) { return v.replace(/\D/g, '').length >= 10 ? '' : 'Please enter a phone number with area code, e.g. (762) 867-9326.'; },
      email: function (v) { return !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'That email address doesn’t look right.'; },
      service: function (v) { return v ? '' : 'Please choose the service you need.'; },
      date: function (v) { return !v || !dateInput.min || v >= dateInput.min ? '' : 'Please choose today or a future date.'; }
    };

    var check = function (input) {
      var field = input.closest('.field');
      var msg = rules[input.name] ? rules[input.name](input.value) : '';
      field.classList.toggle('has-error', !!msg);
      field.querySelector('.field-error').textContent = msg;
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    };

    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      input.addEventListener('blur', function () { check(input); });
      input.addEventListener('input', function () { if (input.closest('.field').classList.contains('has-error')) check(input); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.textContent = '';
      if (form.elements.company && form.elements.company.value) return; // honeypot

      var firstBad = null;
      Object.keys(rules).forEach(function (name) {
        if (!check(form.elements[name]) && !firstBad) firstBad = form.elements[name];
      });
      if (firstBad) { firstBad.focus(); status.textContent = 'Please fix the highlighted fields and try again.'; return; }

      var btn = form.querySelector('[type="submit"]');
      var finish = function () {
        card.querySelector('[data-sent-name]').textContent = form.elements.name.value.trim().split(/\s+/)[0];
        card.classList.add('is-sent');
        card.querySelector('.form-success').setAttribute('tabindex', '-1');
        card.querySelector('.form-success').focus();
        form.reset();
      };

      if (!FORM_ENDPOINT) {
        console.warn('Sparkle Maid: FORM_ENDPOINT is not set in js/main.js — this request was not sent anywhere.');
        finish();
        return;
      }

      btn.disabled = true;
      fetch(FORM_ENDPOINT, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
        .then(function (r) { if (!r.ok) throw new Error('bad status'); finish(); })
        .catch(function () { status.textContent = 'Sorry, something went wrong. Please call (762) 867-9326 and we’ll help right away.'; })
        .then(function () { btn.disabled = false; });
    });

    var again = card.querySelector('[data-again]');
    if (again) again.addEventListener('click', function () { card.classList.remove('is-sent'); form.elements.name.focus(); });
  }
})();
