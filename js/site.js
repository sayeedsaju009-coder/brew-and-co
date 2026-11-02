/* Brew & Co — shared site script: nav, menu data, events, reservation dialog. */
(function () {
  'use strict';

  /* ---------- Storage ---------- */
  const RESERVATIONS_KEY = 'brewAndCo.reservations.v1';

  function loadReservations() {
    try {
      const list = JSON.parse(localStorage.getItem(RESERVATIONS_KEY));
      return Array.isArray(list) ? list : [];
    } catch (e) { return []; }
  }
  function saveReservation(r) {
    try {
      const list = loadReservations();
      list.push(r);
      localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(list));
    } catch (e) { /* storage blocked: the confirmation still shows */ }
  }

  /* ---------- Menu data (CSV) ---------- */
  function parseCSV(text) {
    const rows = [];
    let row = [], field = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quoted) {
        if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
        else if (c === '"') quoted = false;
        else field += c;
      } else if (c === '"') quoted = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(field); field = '';
        if (row.some(v => v !== '')) rows.push(row);
        row = [];
      } else field += c;
    }
    row.push(field);
    if (row.some(v => v !== '')) rows.push(row);

    const head = rows.shift().map(h => h.trim());
    return rows.map(r => {
      const o = {};
      head.forEach((h, i) => { o[h] = (r[i] || '').trim(); });
      return {
        id: o.id,
        name: o.name,
        category: o.category,
        price: Number(o.price) || 0,
        description: o.description,
        tags: o.tags ? o.tags.split('|').filter(Boolean) : [],
        popular: o.popular.toLowerCase() === 'yes',
        image: o.image
      };
    });
  }

  // Opened straight from the folder (file://), browsers block fetch() of the CSV,
  // so fall back to data/menu-data.js, a copy of it a plain <script> can load.
  function loadMenuScript() {
    return new Promise((resolve, reject) => {
      if (window.BREW_MENU_CSV) return resolve(window.BREW_MENU_CSV);
      const s = document.createElement('script');
      s.src = 'data/menu-data.js';
      s.onload = () => window.BREW_MENU_CSV ? resolve(window.BREW_MENU_CSV) : reject(new Error('empty'));
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  let menuPromise = null;
  function loadMenu() {
    if (!menuPromise) {
      menuPromise = fetch('data/menu.csv')
        .then(res => { if (!res.ok) throw new Error(res.status); return res.text(); })
        .catch(loadMenuScript)
        .then(parseCSV);
    }
    return menuPromise;
  }

  /* ---------- Formatting ---------- */
  const TAG_LABELS = { vegan: 'Vegan', gf: 'Gluten-free', 'oat-milk': 'Oat milk' };
  const money = n => '$' + n.toFixed(2);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtDate = (d, opts) => d.toLocaleDateString('en-US', opts);
  function fmtTime(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    const suffix = h >= 12 ? 'pm' : 'am';
    const h12 = h % 12 || 12;
    return m ? `${h12}:${String(m).padStart(2, '0')}${suffix}` : `${h12}${suffix}`;
  }
  function isoDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function tagsHTML(item) {
    return item.tags.map(t => `<span class="tag">${esc(TAG_LABELS[t] || t)}</span>`).join('');
  }

  function loadFailedHTML() {
    return `<div class="notice warn" role="status"><div><strong>The menu couldn't load.</strong>
      Please refresh the page, or pop in and read the chalkboard instead.</div></div>`;
  }

  /* ---------- Events ---------- */
  const EVENT_TYPES = [
    {
      day: 5, start: '19:00', end: '22:00', title: 'Open Mic Night', kind: 'Music & spoken word',
      blurb: 'Songs, poems and the odd brave stand-up. Sign-up sheet goes up at 6:30pm. Five-minute slots.',
      image: 'public/images/event-open-mic.webp'
    },
    {
      day: 6, start: '09:30', end: '11:00', title: 'Saturday Cupping', kind: 'Coffee tasting',
      blurb: 'Taste three single origins side by side with Theo. Free, 12 seats, first come first served.',
      image: 'public/images/event-cupping.webp'
    }
  ];

  function upcomingEvents(count, from) {
    const now = from || new Date();
    const out = [];
    for (let offset = 0; out.length < count && offset < 60; offset++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
      EVENT_TYPES.forEach(ev => {
        if (d.getDay() !== ev.day) return;
        const [eh, em] = ev.end.split(':').map(Number);
        const ends = new Date(d.getFullYear(), d.getMonth(), d.getDate(), eh, em);
        if (ends > now) out.push(Object.assign({ date: d }, ev));
      });
    }
    return out.slice(0, count);
  }

  function renderEvents(el) {
    el.innerHTML = upcomingEvents(4).map(ev => `
      <article class="event-card card">
        <img class="event-img" src="${ev.image}" alt="" loading="lazy" width="800" height="533">
        <div class="event-body">
          <div class="event-date" aria-hidden="true">
            <span class="event-month">${fmtDate(ev.date, { month: 'short' })}</span>
            <span class="event-day">${ev.date.getDate()}</span>
          </div>
          <div>
            <p class="eyebrow">${esc(ev.kind)}</p>
            <h3 class="event-title">${esc(ev.title)}</h3>
            <p class="event-when">
              <time datetime="${isoDate(ev.date)}T${ev.start}">${fmtDate(ev.date, { weekday: 'long', month: 'long', day: 'numeric' })}</time>
              · ${fmtTime(ev.start)}–${fmtTime(ev.end)}
            </p>
            <p class="muted small">${esc(ev.blurb)}</p>
          </div>
        </div>
      </article>`).join('');
  }

  /* ---------- Home ---------- */
  function renderPopular(el) {
    loadMenu().then(items => {
      el.innerHTML = items.filter(i => i.popular).slice(0, 6).map(item => `
        <article class="dish-card card">
          <img class="dish-img" src="${esc(item.image)}" alt="" loading="lazy" width="600" height="600">
          <div class="dish-body">
            <div class="dish-top">
              <h3 class="dish-name">${esc(item.name)}</h3>
              <span class="dish-price num">${money(item.price)}</span>
            </div>
            <p class="muted small">${esc(item.description)}</p>
            ${item.tags.length ? `<div class="row">${tagsHTML(item)}</div>` : ''}
          </div>
        </article>`).join('');
    }).catch(() => { el.innerHTML = loadFailedHTML(); });
  }

  function renderHome() {
    renderPopular(document.getElementById('popular-grid'));
    renderEvents(document.getElementById('events-grid'));
  }

  /* ---------- Reservation dialog ---------- */
  const DIALOG_HTML = `
  <dialog class="modal reserve-dialog" id="reserve-dialog" aria-labelledby="reserve-title">
    <form id="reserve-form" novalidate>
      <div class="modal-head">
        <h2 id="reserve-title" class="modal-title">Reserve a table</h2>
        <button class="icon-btn" type="button" data-close-reserve aria-label="Close">✕</button>
      </div>
      <p class="muted small">We hold tables for 15 minutes. Walk-ins are always welcome too.</p>
      <div class="reserve-fields">
        <div class="field">
          <label for="r-name">Name</label>
          <input type="text" id="r-name" name="name" autocomplete="name" required maxlength="60" aria-describedby="r-name-err">
          <p class="form-error" id="r-name-err" role="alert"></p>
        </div>
        <div class="field">
          <label for="r-party">Party size</label>
          <select id="r-party" name="party" aria-describedby="r-party-help">
            ${[1, 2, 3, 4, 5, 6, 7, 8].map(n => `<option value="${n}"${n === 2 ? ' selected' : ''}>${n} ${n === 1 ? 'person' : 'people'}</option>`).join('')}
          </select>
          <p class="field-help" id="r-party-help">More than 8? Call us on (718) 555-0142.</p>
        </div>
        <div class="fields">
          <div class="field">
            <label for="r-date">Date</label>
            <input type="date" id="r-date" name="date" required aria-describedby="r-date-err">
            <p class="form-error" id="r-date-err" role="alert"></p>
          </div>
          <div class="field">
            <label for="r-time">Time</label>
            <select id="r-time" name="time" aria-describedby="r-time-err"></select>
            <p class="form-error" id="r-time-err" role="alert"></p>
          </div>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn ghost" type="button" data-close-reserve>Cancel</button>
        <button class="btn primary" type="submit">Request table</button>
      </div>
    </form>
    <div class="reserve-done" id="reserve-done" hidden>
      <p class="done-mark" aria-hidden="true">☕</p>
      <h2 class="modal-title">You're on the list</h2>
      <p id="reserve-done-text"></p>
      <div class="modal-actions">
        <button class="btn primary" type="button" data-close-reserve>Done</button>
      </div>
    </div>
  </dialog>`;

  // Opening hours per weekday (0 = Sunday). Last seating is an hour before close.
  const HOURS = { 0: [8, 16], 1: [7, 18], 2: [7, 18], 3: [7, 18], 4: [7, 18], 5: [7, 22], 6: [8, 18] };

  function timeSlots(dateStr) {
    if (!dateStr) return [];
    const d = new Date(dateStr + 'T00:00');
    const [open, close] = HOURS[d.getDay()];
    const now = new Date();
    const isToday = isoDate(now) === dateStr;
    const slots = [];
    for (let mins = open * 60; mins <= (close - 1) * 60; mins += 30) {
      const h = Math.floor(mins / 60), m = mins % 60;
      if (isToday && (h * 60 + m) <= now.getHours() * 60 + now.getMinutes() + 30) continue;
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
    return slots;
  }

  function setError(input, errEl, msg) {
    errEl.textContent = msg;
    if (msg) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }

  function initReserve() {
    document.body.insertAdjacentHTML('beforeend', DIALOG_HTML);
    const dialog = document.getElementById('reserve-dialog');
    const form = document.getElementById('reserve-form');
    const done = document.getElementById('reserve-done');
    const name = form.elements.name, party = form.elements.party, date = form.elements.date, time = form.elements.time;
    const errs = { name: document.getElementById('r-name-err'), date: document.getElementById('r-date-err'), time: document.getElementById('r-time-err') };

    const today = isoDate(new Date());
    date.min = today;
    const max = new Date(); max.setDate(max.getDate() + 60);
    date.max = isoDate(max);

    function fillTimes() {
      const keep = time.value;
      const slots = timeSlots(date.value);
      time.innerHTML = slots.length
        ? slots.map(s => `<option value="${s}">${fmtTime(s)}</option>`).join('')
        : `<option value="">${date.value ? 'No tables left today' : 'Pick a date first'}</option>`;
      time.disabled = !slots.length;
      if (slots.includes(keep)) time.value = keep;
      else if (slots.includes('10:00')) time.value = '10:00';
    }
    date.addEventListener('change', () => { setError(date, errs.date, ''); setError(time, errs.time, ''); fillTimes(); });
    name.addEventListener('input', () => setError(name, errs.name, ''));

    function open() {
      form.reset();
      form.hidden = false;
      done.hidden = true;
      Object.keys(errs).forEach(k => setError(form.elements[k], errs[k], ''));
      date.value = timeSlots(today).length ? today : isoDate(new Date(Date.now() + 864e5));
      fillTimes();
      dialog.showModal();
      name.focus();
    }

    document.addEventListener('click', e => {
      if (e.target.closest('[data-open-reserve]')) { e.preventDefault(); closeNav(); open(); }
      else if (e.target.closest('[data-close-reserve]')) dialog.close();
    });
    // Click on the backdrop (outside the dialog box) closes it.
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });

    form.addEventListener('submit', e => {
      e.preventDefault();
      let firstBad = null;
      const n = name.value.trim();
      if (!n) { setError(name, errs.name, 'Tell us who the table is for.'); firstBad = firstBad || name; }
      if (!date.value) { setError(date, errs.date, 'Choose a date.'); firstBad = firstBad || date; }
      else if (date.value < today || date.value > date.max) { setError(date, errs.date, 'Choose a date in the next 60 days.'); firstBad = firstBad || date; }
      if (date.value && !time.value) { setError(time, errs.time, 'No times left that day. Try another date.'); firstBad = firstBad || date; }
      if (firstBad) { firstBad.focus(); return; }

      const r = { name: n, party: Number(party.value), date: date.value, time: time.value, createdAt: new Date().toISOString() };
      saveReservation(r);
      const when = fmtDate(new Date(r.date + 'T00:00'), { weekday: 'short', month: 'short', day: 'numeric' });
      document.getElementById('reserve-done-text').textContent =
        `Thanks, ${r.name}. A table for ${r.party} on ${when} at ${fmtTime(r.time)}. See you then!`;
      form.hidden = true;
      done.hidden = false;
      done.querySelector('.btn').focus();
    });
  }

  /* ---------- Nav ---------- */
  let closeNav = () => {};
  function initNav() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;
    closeNav = () => { toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); };
    toggle.addEventListener('click', () => {
      const openNow = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(openNow));
      nav.classList.toggle('open', openNow);
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });
  }

  initNav();
  initReserve();

  window.BrewCo = { loadMenu, renderHome, tagsHTML, money, esc, loadFailedHTML, upcomingEvents };
})();
