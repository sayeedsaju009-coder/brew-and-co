/* Brew & Co — menu page: renders every row of data/menu.csv by category. */
(function () {
  'use strict';
  const { loadMenu, tagsHTML, money, esc, loadFailedHTML } = window.BrewCo;

  const CATEGORY_NOTES = {
    'Espresso Bar': 'Seasonal house blend, roasted in Red Hook. Oat, almond or whole milk at no extra cost.',
    'Pour-over & Filter': 'Single origins brewed slowly, to order.',
    'Tea & Not-Coffee': 'For the coffee-curious and the caffeine-free.',
    'Pastries': 'Baked every morning by Maya and the team from 5am. Best before noon.',
    'Light Lunch': 'Served 11am until 3pm.',
    'Sweets': 'A little something for the afternoon.'
  };

  const slug = s => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  function itemHTML(item) {
    return `
      <li class="menu-item">
        <img class="menu-img" src="${esc(item.image)}" alt="" loading="lazy" width="600" height="600">
        <div class="menu-text">
          <div class="menu-line">
            <h3 class="menu-name">${esc(item.name)}</h3>
            <span class="menu-leader" aria-hidden="true"></span>
            <span class="menu-price num">${money(item.price)}</span>
          </div>
          <p class="menu-desc">${esc(item.description)}</p>
          ${item.popular || item.tags.length ? `<div class="row">${item.popular ? '<span class="tag warn">★ Popular</span>' : ''}${tagsHTML(item)}</div>` : ''}
        </div>
      </li>`;
  }

  function render(items) {
    const cats = [];
    items.forEach(i => { if (!cats.includes(i.category)) cats.push(i.category); });

    document.getElementById('menu-chips').innerHTML = cats.map(c =>
      `<a class="chip" href="#${slug(c)}">${esc(c)}</a>`).join('');

    document.getElementById('menu-board').innerHTML = cats.map(c => `
      <section class="menu-section" id="${slug(c)}" aria-labelledby="${slug(c)}-title">
        <div class="menu-section-head">
          <h2 class="menu-cat" id="${slug(c)}-title">${esc(c)}</h2>
          ${CATEGORY_NOTES[c] ? `<p class="muted small">${esc(CATEGORY_NOTES[c])}</p>` : ''}
        </div>
        <ul class="menu-list">${items.filter(i => i.category === c).map(itemHTML).join('')}</ul>
      </section>`).join('');

    trackActiveChip(cats.map(slug));
  }

  // Highlight the chip for the category currently on screen.
  function trackActiveChip(ids) {
    if (!('IntersectionObserver' in window)) return;
    const chips = document.querySelectorAll('#menu-chips .chip');
    const setActive = id => chips.forEach(ch => {
      const on = ch.getAttribute('href') === '#' + id;
      ch.classList.toggle('active', on);
      if (on) ch.setAttribute('aria-current', 'true'); else ch.removeAttribute('aria-current');
    });
    const obs = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: '-35% 0px -60% 0px' });
    ids.forEach(id => obs.observe(document.getElementById(id)));
  }

  loadMenu().then(render).catch(() => {
    document.getElementById('menu-board').innerHTML = loadFailedHTML();
  });
})();
