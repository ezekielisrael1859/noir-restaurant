/* ============================================================
   NOIR RESTAURANT — MAIN JAVASCRIPT
   File: js/main.js
   Author: Orokpo Israel | israelorokpo.github.io
   ============================================================ */

'use strict';

/* ── CONSTANTS ── */
const WHATSAPP_NUMBER = '2348000000000';

/* ── DOM READY ── */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initHero();
  initScrollReveal();
  initFAQ();
  initReservationForm();
  initBottomNav();
  initFooterYear();
});


/* ============================================================
   NAV — scroll state + active link highlight
============================================================ */
function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}


/* ============================================================
   HERO — trigger loaded class for subtle Ken Burns release
============================================================ */
function initHero() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const img = hero.querySelector('.hero__img');

  const activate = () => hero.classList.add('loaded');

  if (img) {
    if (img.complete) {
      activate();
    } else {
      img.addEventListener('load', activate, { once: true });
      img.addEventListener('error', activate, { once: true });
    }
  } else {
    activate();
  }
}


/* ============================================================
   SCROLL REVEAL — IntersectionObserver
============================================================ */
function initScrollReveal() {
  const els = document.querySelectorAll(
    '.reveal, .reveal--left, .reveal--right'
  );
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  els.forEach((el) => observer.observe(el));
}


/* ============================================================
   FAQ — accordion
============================================================ */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach((item) => {
    const trigger = item.querySelector('.faq-item__trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close all
      items.forEach((i) => {
        i.classList.remove('is-open');
        const t = i.querySelector('.faq-item__trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      });

      // Open clicked if it was closed
      if (!isOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}


/* ============================================================
   RESERVATION FORM — validate + send to WhatsApp
============================================================ */
function initReservationForm() {
  const form = document.getElementById('reserveForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name     = getValue('res-name');
    const phone    = getValue('res-phone');
    const email    = getValue('res-email');
    const date     = getValue('res-date');
    const time     = getValue('res-time');
    const guests   = getValue('res-guests');
    const requests = getValue('res-requests');

    // Validate required fields
    const missing = [];
    if (!name)   missing.push('Full Name');
    if (!phone)  missing.push('Phone Number');
    if (!email)  missing.push('Email Address');
    if (!date)   missing.push('Preferred Date');
    if (!time)   missing.push('Preferred Time');
    if (!guests) missing.push('Number of Guests');

    if (missing.length) {
      showFormError(form, `Please fill in: ${missing.join(', ')}`);
      return;
    }

    if (!isValidEmail(email)) {
      showFormError(form, 'Please enter a valid email address.');
      return;
    }

    if (!isValidDate(date)) {
      showFormError(form, 'Please select a future date (Tuesday – Sunday).');
      return;
    }

    clearFormError(form);

    // Format date nicely
    const formatted = formatDate(date);

    // Build WhatsApp message
    const message = [
      `*🍷 Noir Restaurant — Table Reservation*`,
      ``,
      `*Name:* ${name}`,
      `*Phone:* ${phone}`,
      `*Email:* ${email}`,
      `*Date:* ${formatted}`,
      `*Time:* ${time}`,
      `*Guests:* ${guests}`,
      requests ? `*Special Requests:* ${requests}` : null,
      ``,
      `_Sent from noirrestaurant.com_`,
    ]
      .filter((line) => line !== null)
      .join('\n');

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
}

function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidDate(dateStr) {
  const selected = new Date(dateStr);
  const today    = new Date();
  today.setHours(0, 0, 0, 0);

  if (selected < today) return false;

  // 0 = Sunday, 1 = Monday (closed)
  const day = selected.getDay();
  return day !== 1; // Monday closed
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });
}

function showFormError(form, message) {
  clearFormError(form);

  const err = document.createElement('p');
  err.className   = 'reserve-form__error';
  err.textContent = message;
  err.style.cssText = `
    color: #E07070;
    font-size: 0.75rem;
    letter-spacing: 0.04em;
    padding: 0.75rem 1rem;
    border: 1px solid rgba(224,112,112,0.3);
    background: rgba(224,112,112,0.08);
    margin-top: -0.5rem;
  `;

  const btn = form.querySelector('button[type="submit"]');
  form.insertBefore(err, btn);

  err.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearFormError(form) {
  const existing = form.querySelector('.reserve-form__error');
  if (existing) existing.remove();
}


/* ============================================================
   BOTTOM NAV — highlight active section
============================================================ */
function initBottomNav() {
  const navItems = document.querySelectorAll('.bottom-nav__item');
  if (!navItems.length) return;

  const sections = ['menu', 'reserve', 'testimonials', 'faq'];
  const targets  = sections
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;

        navItems.forEach((item) => {
          const href = item.getAttribute('href');
          item.classList.toggle('is-active', href === `#${id}`);
        });
      });
    },
    { threshold: 0.4 }
  );

  targets.forEach((el) => observer.observe(el));
}


/* ============================================================
   FOOTER — dynamic year
============================================================ */
function initFooterYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}