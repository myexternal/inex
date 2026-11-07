/* Inex Kitchen Solutions: page behaviour (no libraries) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- nav: transparent on dark, solid on light ---------- */
  const nav = $('[data-nav]');
  const fab = $('.wa-fab');
  const darkSections = $$('.hero, .build, .split, .work, .brief, .foot');
  function navState() {
    const y = 36; // sample point under the nav
    const overDark = darkSections.some(s => { const r = s.getBoundingClientRect(); return r.top <= y && r.bottom > y; });
    nav.classList.toggle('is-solid', !overDark);
    nav.classList.toggle('is-scrolled', overDark && scrollY > 8);
    fab.classList.toggle('is-on', scrollY > innerHeight * 0.8);
  }

  /* ---------- mobile sheet ---------- */
  const menuBtn = $('[data-menu]');
  const sheet = $('[data-sheet]');
  function setSheet(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Close' : 'Menu';
    if (open) {
      sheet.hidden = false;
      requestAnimationFrame(() => sheet.classList.add('is-open'));
      document.body.style.overflow = 'hidden';
      nav.classList.remove('is-solid');
    } else {
      sheet.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(() => { if (!sheet.classList.contains('is-open')) sheet.hidden = true; }, 220);
      navState();
    }
  }
  menuBtn.addEventListener('click', () => setSheet(menuBtn.getAttribute('aria-expanded') !== 'true'));
  sheet.addEventListener('click', e => { if (e.target.closest('a')) setSheet(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !sheet.hidden) setSheet(false); });

  /* ---------- reveals ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -12% 0px' });
  let pending = $$('[data-reveal],[data-cut]');
  pending.forEach(el => io.observe(el));
  // safety net: a fast fling can skip past an element between observer callbacks
  function sweep() {
    if (!pending.length) return;
    const line = innerHeight * 0.92;
    pending = pending.filter(el => {
      if (el.classList.contains('is-in')) return false;
      if (el.getBoundingClientRect().top < line) { el.classList.add('is-in'); io.unobserve(el); return false; }
      return true;
    });
  }

  /* ---------- zones ---------- */
  const ZONES = [
    { t: 'Store', p: 'Dry stores and cold rooms need shelving that carries weight and washes down without rusting.',
      l: [['Wall and floor racks', 'any length'], ['Pot and dish racks', 'wire or solid shelves'], ['Trolleys', 'on castors']],
      img: 'media/cut/p44.webp', cap: 'Rack with wire shelves', th: ['p40', 'p43', 'p22'] },
    { t: 'Prep', p: 'Work tables are set to your cooks’ height and your room’s depth, with a backsplash where food meets the wall.',
      l: [['Work tables', 'with under-shelf'], ['Prep sinks', 'single or double bowl'], ['Under-counter units', 'fridges fitted into our steel']],
      img: 'media/cut/p46.webp', cap: 'Work table with backsplash and two shelves', th: ['p61', 'p38', 'p18'] },
    { t: 'Cook', p: 'The hot line is planned with its hood: burners, griddles and wok tables in one run, with gas lines laid along the wall.',
      l: [['Canopy exhaust hoods', 'with grease filters'], ['Burner ranges', 'two to six burners'], ['Wok burner tables', 'with drip trays'], ['Griddle stands', 'flat-top on a slatted base']],
      img: 'media/cut/p02.webp', cap: 'Four-burner range with backsplash', th: ['p05', 'p27', 'p21'] },
    { t: 'Wash', p: 'Sinks and dish racks sized for your busiest service, so dirty pans never pile up on the prep tables.',
      l: [['Sinks', 'one, two or three bowls'], ['Dish and pot racks', 'drain straight to the sink'], ['Pot-wash tables', 'with splash guards']],
      img: 'media/cut/p03.webp', cap: 'Deep pot sink beside a double sink', th: ['p37', 'p36', 'p06'] },
    { t: 'Serve', p: 'Front-of-house steel that keeps food at temperature and looks good doing it.',
      l: [['Bain-marie counters', 'hot wells with cabinets'], ['Food service counters', 'with sneeze rails'], ['Display counters', 'lit, for fish or cakes'], ['Bar counters', 'with sinks and fridge bays']],
      img: 'media/cut/p20.webp', cap: 'Bain-marie counter with sliding doors', th: ['p63', 'p49', 'p62'] },
  ];
  const tabs = $$('[data-zone]');
  const rail = $('[data-zone-tabs]');
  const plate = $('.plate');
  const zImg = $('[data-z-img]');
  let zone = -1, swapT;
  function setZone(i, focus) {
    if (i === zone) return;
    const z = ZONES[i];
    zone = i;
    tabs.forEach((b, k) => { b.setAttribute('aria-selected', String(k === i)); b.tabIndex = k === i ? 0 : -1; });
    rail.style.setProperty('--i', i);
    if (focus) { tabs[i].focus(); tabs[i].scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' }); }
    $('[data-z-title]').textContent = z.t;
    $('[data-z-text]').textContent = z.p;
    $('[data-z-list]').innerHTML = z.l.map(([a, b]) => `<li>${a}<small>${b}</small></li>`).join('');
    $('[data-z-cap]').textContent = z.cap;
    $('[data-z-thumbs]').innerHTML = z.th.map(n => `<figure><img src="media/photo/${n}.webp" alt="" loading="lazy"></figure>`).join('');
    // swap the plate image with a short blur crossfade
    clearTimeout(swapT);
    plate.classList.add('is-swapping');
    const next = new Image();
    next.src = z.img;
    const done = () => { swapT = setTimeout(() => { zImg.src = z.img; zImg.alt = z.cap; plate.classList.remove('is-swapping'); }, reduce ? 0 : 140); };
    next.decode ? next.decode().then(done, done) : (next.onload = done);
  }
  tabs.forEach((b, k) => b.addEventListener('click', () => setZone(k)));
  rail.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    setZone((zone + (e.key === 'ArrowRight' ? 1 : 4)) % 5, true);
  });
  setZone(2); // open on Cook: the zone people picture first
  // preload other plates once idle
  (window.requestIdleCallback || setTimeout)(() => ZONES.forEach(z => { const i = new Image(); i.src = z.img; }));

  /* ---------- 3D steps (desktop) ---------- */
  const steps = $$('[data-step]');
  const stepIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      steps.forEach(s => s.classList.toggle('is-on', s === en.target));
      dispatchEvent(new CustomEvent('inex:step', { detail: +en.target.dataset.step }));
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(s => stepIO.observe(s));

  /* ---------- floor-to-floor split ---------- */
  const split = $('[data-split]');
  const splitSticky = split && $('.split__sticky', split);
  function splitState() {
    if (!split) return;
    const r = split.getBoundingClientRect();
    const prog = clamp(-r.top / (r.height - innerHeight), 0, 1);
    const eased = prog < .5 ? 4 * prog ** 3 : 1 - (-2 * prog + 2) ** 3 / 2;
    splitSticky.style.setProperty('--p', (0.22 + 0.58 * (reduce ? 0.5 : eased)).toFixed(4));
  }

  /* ---------- sectors: photo follows pointer (spring) ---------- */
  const sectors = $('[data-sectors]');
  const float = $('[data-float]');
  if (finePointer && sectors && !reduce) {
    let tx = 0, ty = 0, x = 0, y = 0, vx = 0, vy = 0, raf = 0, active = false;
    const tick = () => {
      // critically-damped-ish spring
      const k = 0.12, d = 0.72;
      vx = (vx + (tx - x) * k) * d; vy = (vy + (ty - y) * k) * d;
      x += vx; y += vy;
      const tilt = clamp(vx * 0.6, -8, 8);
      float.style.transform = `translate3d(${x}px,${y}px,0) rotate(${tilt}deg)`;
      raf = (active || Math.abs(vx) + Math.abs(vy) > 0.1) ? requestAnimationFrame(tick) : 0;
    };
    const list = $('.sectors__list', sectors);
    list.addEventListener('pointermove', e => {
      const r = sectors.getBoundingClientRect();
      tx = e.clientX - r.left + 28; ty = e.clientY - r.top - float.offsetHeight / 2;
      if (!active) { x = tx; y = ty; }
      active = true;
      sectors.classList.add('is-hovering');
      if (!raf) raf = requestAnimationFrame(tick);
    });
    list.addEventListener('pointerleave', () => { active = false; sectors.classList.remove('is-hovering'); });
    $$('li', list).forEach(li => li.addEventListener('pointerenter', () => { float.src = li.dataset.img; }));
  }

  /* ---------- installed work strip ---------- */
  const strip = $('[data-work]');
  const scrollStrip = dir => {
    const card = strip.querySelector('li');
    strip.scrollBy({ left: dir * (card.offsetWidth + 16) * 1.5, behavior: reduce ? 'auto' : 'smooth' });
  };
  $('[data-work-prev]').addEventListener('click', () => scrollStrip(-1));
  $('[data-work-next]').addEventListener('click', () => scrollStrip(1));

  /* ---------- brief builder → WhatsApp ---------- */
  const form = $('[data-brief]');
  const msgEl = $('[data-msg]');
  const send = $('[data-send]');
  $$('.chips', form).forEach(group => {
    const multi = group.hasAttribute('data-multi');
    $$('.chip', group).forEach(c => {
      c.setAttribute('aria-pressed', 'false');
      c.addEventListener('click', () => {
        const on = c.getAttribute('aria-pressed') !== 'true';
        if (!multi) $$('.chip', group).forEach(o => o.setAttribute('aria-pressed', 'false'));
        c.setAttribute('aria-pressed', String(on));
        compose();
      });
    });
  });
  form.addEventListener('input', compose);
  form.addEventListener('submit', e => e.preventDefault());
  function picked(name) { return $$(`[data-group="${name}"] [aria-pressed="true"]`, form).map(c => c.textContent.trim()); }
  function compose() {
    const type = picked('type')[0];
    const need = picked('need');
    const town = form.town.value.trim();
    const name = form.name.value.trim();
    const lines = ['Hello Inex, I would like a quote for a kitchen.'];
    if (type) lines.push(`Type: ${type}`);
    if (need.length) lines.push(`I need: ${need.join(', ')}`);
    if (town) lines.push(`Location: ${town}`);
    if (name) lines.push(`Name: ${name}`);
    if (lines.length === 1) lines.push('Please call me back.');
    const text = lines.join('\n');
    msgEl.textContent = text;
    send.href = `https://wa.me/94776654172?text=${encodeURIComponent(text)}`;
  }
  compose();

  /* ---------- scroll loop ---------- */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { navState(); splitState(); sweep(); ticking = false; });
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  navState(); splitState(); sweep();
})();
