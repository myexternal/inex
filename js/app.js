/* Inex v3 · "Forge" interactions. Vanilla JS; Lenis (vendored) for smooth wheel scrolling on desktop only. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const portrait = matchMedia('(max-width: 760px)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  // the films are the design: they always play, except for people who ask for reduced motion
  const autoplay = !reduce;
  if (!autoplay) root.classList.add('no-autoplay');

  /* ---------- smooth scroll (desktop wheel only, loaded only there) ---------- */
  let lenis = null;
  if (fine && !reduce) {
    const sc = document.createElement('script');
    sc.src = 'vendor/lenis.min.js'; sc.async = true;
    sc.onload = () => {
      if (!window.Lenis) return;
      lenis = new window.Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 0.95 });
      const loop = t => { lenis.raf(t); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    };
    addEventListener('load', () => document.head.appendChild(sc));
  }

  /* ---------- images below the fold load only when close ---------- */
  const lazyImgs = $$('img[data-src]');
  const showImg = i => { if (i.dataset.srcset) i.srcset = i.dataset.srcset; i.src = i.dataset.src; i.removeAttribute('data-src'); };
  if ('IntersectionObserver' in window) {
    const lio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { showImg(e.target); lio.unobserve(e.target); } }), { rootMargin: '700px 0px' });
    lazyImgs.forEach(i => lio.observe(i));
  } else lazyImgs.forEach(showImg);
  function goTo(el) {
    if (!el) return;
    if (lenis) lenis.scrollTo(Math.round(el.getBoundingClientRect().top + scrollY), { duration: 1.4, easing: t => 1 - Math.pow(1 - t, 4) });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }

  /* ---------- hero headline: split into characters ---------- */
  const h1 = $('[data-split]');
  if (h1) {
    let ci = 0;
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            [...part].forEach(ch => { const c = document.createElement('span'); c.className = 'c'; c.textContent = ch; c.style.setProperty('--ci', ci++); w.appendChild(c); });
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.hasAttribute('data-nosplit')) walk(n);
      });
    };
    walk(h1);
    [...h1.children].forEach(c => { if (!c.hasAttribute('data-nosplit')) c.setAttribute('aria-hidden', 'true'); });
  }

  /* ---------- intro, then the hero comes in ---------- */
  const hero = $('[data-hero]');
  const intro = $('[data-intro]');
  const hasIntro = !reduce && !root.classList.contains('no-intro');
  try { sessionStorage.setItem('inex-intro', '1'); } catch (e) {}
  setTimeout(() => hero.classList.add('hero-in'), hasIntro ? 1150 : 60);
  if (intro) setTimeout(() => intro.remove(), hasIntro ? 1900 : 0);

  /* ---------- line + block reveals ---------- */
  $$('[data-lines]').forEach(el => {
    $$('.ln', el).forEach((ln, i) => {
      const inner = document.createElement('span'); inner.className = 'ln__in'; inner.style.setProperty('--d', i);
      while (ln.firstChild) inner.appendChild(ln.firstChild);
      ln.appendChild(inner);
    });
  });
  const revealEls = $$('[data-lines], [data-reveal], .fact');
  const rio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in'); rio.unobserve(e.target);
    if (e.target.classList.contains('fact')) countUp(e.target);
  }), { rootMargin: '0px 0px -10% 0px' });
  revealEls.forEach(el => rio.observe(el));
  const sweep = () => revealEls.forEach(el => {
    if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < innerHeight * .9 && el.getBoundingClientRect().bottom > 0) { el.classList.add('is-in'); if (el.classList.contains('fact')) countUp(el); }
  });
  addEventListener('load', () => setTimeout(sweep, 300));

  function countUp(fact) {
    const el = $('[data-count]', fact); if (!el || el.dataset.counted) return;
    el.dataset.counted = "1";
    const to = +el.dataset.count, fmt = n => String(n).padStart(2, '0');
    if (reduce) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), dur = 1300;
    const tick = t => { const p = clamp((t - t0) / dur, 0, 1); el.textContent = fmt(Math.round(easeOut(p) * to)); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }

  /* ---------- video plumbing ---------- */
  // pick the wide or tall cut once, at load
  function prep(v, name, force) {
    const o = force || (portrait ? 'p' : 'l');
    v.dataset.poster = `media/poster/${name}-${o}.webp`;
    const s = document.createElement('source'); s.dataset.src = `media/v/${name}-${o}.mp4`; s.type = 'video/mp4';
    v.appendChild(s);
  }
  $$('[data-adapt]').forEach(v => prep(v, v.dataset.adapt, v.dataset.force));
  $$('[data-hv]').forEach(v => prep(v, v.dataset.hv));
  $$('[data-pv]').forEach(v => prep(v, v.dataset.pv));

  let pageLoaded = document.readyState === 'complete';
  const waiting = new Set();
  function loadVid(v) {
    if (v.dataset.loaded) return;
    v.dataset.loaded = '1';
    if (!v.poster && v.dataset.poster) v.poster = v.dataset.poster;
    const s = v.querySelector('source[data-src]');
    if (s) { s.src = s.dataset.src; v.load(); }
  }
  function play(v) {
    if (!v || !autoplay) return;
    v.dataset.want = '1';
    if (!pageLoaded) { waiting.add(v); return; }
    loadVid(v); const p = v.play(); if (p) p.catch(() => {});
  }
  function stop(v) { if (!v) return; delete v.dataset.want; waiting.delete(v); if (!v.paused) v.pause(); }
  // iOS Low Power Mode blocks autoplay until the first touch: retry then
  const kick = () => { $$('video').forEach(v => { if (v.dataset.want && v.paused) { loadVid(v); const p = v.play(); if (p) p.catch(() => {}); } }); };
  ['touchend', 'pointerdown', 'keydown'].forEach(ev => addEventListener(ev, kick, { passive: true }));
  addEventListener('load', () => {
    pageLoaded = true;
    setTimeout(() => { waiting.forEach(v => { if (v.dataset.want) play(v); }); waiting.clear(); }, 200);
  });
  // posters only when close
  const pio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const v = e.target; if (!v.poster && v.dataset.poster) v.poster = v.dataset.poster; pio.unobserve(v);
  }), { rootMargin: '900px 0px' });
  $$('video[data-poster]:not([data-hv]), [data-adapt], [data-pv]').forEach(v => pio.observe(v));
  const vio = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? play(e.target) : stop(e.target)), { threshold: .15 });
  $$('video[data-vid]').forEach(v => vio.observe(v));

  /* ---------- hero: chapters + film ---------- */
  const hv = $$('[data-hv]');
  const chaps = $$('.chap');
  const chapWrap = $('[data-chapters]');
  let cur = 0, heroVisible = true, prevT, warmT;
  function setChap(i) {
    chaps.forEach((c, k) => {
      c.classList.remove('is-on');
      c.classList.toggle('is-done', k < i);
      c.setAttribute('aria-pressed', String(k === i));
    });
    void chapWrap.offsetWidth;
    chaps[i].classList.add('is-on');
    if (i !== cur) {
      const prev = hv[cur], next = hv[i];
      hv.forEach(v => v.classList.remove('is-prev'));
      prev.classList.remove('is-on'); prev.classList.add('is-prev');
      next.classList.add('is-on');
      if (!next.poster) next.poster = next.dataset.poster;
      if (heroVisible) play(next);
      clearTimeout(prevT);
      prevT = setTimeout(() => { stop(prev); prev.classList.remove('is-prev'); }, 1200);
      cur = i;
    }
    // warm up the next one: its poster now, its video a moment before it's needed
    const nn = hv[(i + 1) % hv.length];
    if (pageLoaded) { if (!nn.poster) nn.poster = nn.dataset.poster; }
    clearTimeout(warmT);
    if (autoplay) warmT = setTimeout(() => { if (pageLoaded && heroVisible) loadVid(nn); }, 3500);
  }
  chaps.forEach((c, k) => {
    c.addEventListener('click', () => setChap(k));
    $('em', c).addEventListener('animationend', () => { if (c.classList.contains('is-on') && autoplay) setChap((k + 1) % chaps.length); });
  });
  if (!autoplay) chapWrap.classList.add('is-paused');
  play(hv[0]);
  addEventListener('load', () => { const n = hv[1]; if (!autoplay) hv.forEach(v => { v.poster = v.dataset.poster; }); else if (!n.poster) setTimeout(() => { n.poster = n.dataset.poster; }, 1500); });
  new IntersectionObserver(es => {
    heroVisible = es[0].isIntersecting;
    if (autoplay) chapWrap.classList.toggle('is-paused', !heroVisible);
    heroVisible ? play(hv[cur]) : stop(hv[cur]);
  }, { threshold: .05 }).observe(hero);

  const heroFrame = $('[data-hero-frame]'), heroInner = $('.hero__inner');
  function heroScroll() {
    if (reduce) return;
    const p = clamp(scrollY / innerHeight, 0, 1);
    if (p >= 1 && heroFrame.dataset.p === '1') return;
    heroFrame.dataset.p = p >= 1 ? '1' : '0';
    heroFrame.style.transform = `translate3d(0, ${(p * innerHeight * .22).toFixed(1)}px, 0) scale(${(1 - p * .08).toFixed(4)})`;
    heroFrame.style.borderRadius = (p * 36).toFixed(1) + 'px';
    heroInner.style.transform = `translate3d(0, ${(-p * 70).toFixed(1)}px, 0)`;
    heroInner.style.opacity = (1 - p * 1.3).toFixed(3);
  }

  /* ---------- nav ---------- */
  const nav = $('[data-nav]');
  let lastY = scrollY, menuOpen = false;
  function navState() {
    const y = scrollY;
    nav.classList.toggle('is-scrolled', y > 24);
    if (!menuOpen) {
      if (y > innerHeight * .9 && y - lastY > 6) nav.classList.add('is-hidden');
      else if (lastY - y > 6 || y < innerHeight * .9) nav.classList.remove('is-hidden');
    }
    lastY = y;
  }

  /* ---------- menu ---------- */
  const menuBtn = $('[data-menu]'), sheet = $('[data-sheet]'), menuLabel = $('.nav__menu-label');
  function setMenu(open) {
    menuOpen = open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuLabel.textContent = open ? 'Close' : 'Menu';
    nav.classList.remove('is-hidden');
    if (open) {
      sheet.hidden = false; lenis && lenis.stop(); document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => requestAnimationFrame(() => sheet.classList.add('is-open')));
    } else {
      sheet.classList.remove('is-open'); lenis && lenis.start(); document.body.style.overflow = '';
      setTimeout(() => { if (!sheet.classList.contains('is-open')) sheet.hidden = true; }, reduce ? 0 : 540);
    }
    dockUpdate();
  }
  menuBtn.addEventListener('click', () => setMenu(!menuOpen));
  addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen) { setMenu(false); menuBtn.focus(); } });
  matchMedia('(min-width: 1081px)').addEventListener('change', e => { if (e.matches && menuOpen) setMenu(false); });

  /* ---------- in-page links ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const el = id === '#top' ? hero : $(id);
    if (!el) return;
    e.preventDefault();
    if (menuOpen) setMenu(false);
    if (a.dataset.need) pickNeed(a.dataset.need);
    setTimeout(() => goTo(el), menuOpen ? 40 : 0);
    history.replaceState(null, '', id === '#top' ? location.pathname : id);
  });

  /* ---------- kitchens: expanding strips ---------- */
  const strips = $$('.strip');
  function openStrip(s) {
    if (s.classList.contains('is-open')) return;
    strips.forEach(o => { o.classList.toggle('is-open', o === s); $('.strip__btn', o).setAttribute('aria-expanded', String(o === s)); });
  }
  strips.forEach(s => {
    const b = $('.strip__btn', s);
    b.addEventListener('click', () => openStrip(s));
    b.addEventListener('focus', () => { if (fine) openStrip(s); });
    if (fine) {
      let t;
      s.addEventListener('pointerenter', () => { t = setTimeout(() => openStrip(s), 140); });
      s.addEventListener('pointerleave', () => clearTimeout(t));
    }
  });

  /* ---------- process: pinned chapters ---------- */
  const proc = $('[data-proc]');
  const layers = $$('.proc__layer', proc);
  const lvids = layers.map(l => $('video', l));
  const nums = $$('.proc__nums span', proc);
  const psteps = $$('.pstep', proc);
  const plis = $$('.proc__line li', proc);
  const pfill = $('[data-proc-fill]', proc);
  let pActive = -1, procVisible = false;
  const lastClip = [];
  function procSet(i) {
    if (i === pActive) return;
    pActive = i;
    nums.forEach((n, k) => { n.classList.toggle('is-on', k === i); n.classList.toggle('is-past', k < i); });
    psteps.forEach((s, k) => s.classList.toggle('is-on', k === i));
    plis.forEach((l, k) => { l.classList.toggle('is-on', k === i); l.classList.toggle('is-done', k < i); });
    procPlay();
  }
  function procPlay() {
    lvids.forEach((v, k) => {
      if (procVisible && (k === pActive || k === pActive + 1)) {
        if (k === pActive) play(v); else if (pageLoaded && autoplay) loadVid(v);
      } else stop(v);
    });
  }
  function procUpdate() {
    const r = proc.getBoundingClientRect();
    if (r.bottom < -50 || r.top > innerHeight + 50) return;
    const total = Math.max(1, r.height - innerHeight);
    const P = clamp(-r.top / total, 0, 1);
    const raw = P * layers.length;
    let active = 0;
    for (let k = 1; k < layers.length; k++) {
      const rev = reduce ? (raw >= k ? 1 : 0) : easeIO(clamp((raw - k + .3) / .6, 0, 1));
      if (rev > .5) active = k;
      const key = rev.toFixed(4);
      if (lastClip[k] !== key) {
        lastClip[k] = key;
        layers[k].style.clipPath = `inset(${((1 - rev) * 100).toFixed(2)}% 0 0 0)`;
        if (!reduce) lvids[k].style.transform = `scale(${(1.14 - .14 * rev).toFixed(4)})`;
      }
    }
    pfill.style.transform = `scaleX(${P.toFixed(4)})`;
    procSet(active);
  }
  new IntersectionObserver(es => { procVisible = es[0].isIntersecting; procPlay(); }, { threshold: 0 }).observe(proc);

  /* ---------- made in unawatuna: type zooms into place ---------- */
  const made = $('[data-made]'), madeMask = made && $('.made__mask', made);
  function madeUpdate() {
    if (!made || reduce) return;
    const r = made.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const p = clamp((innerHeight - r.top) / (innerHeight * .85), 0, 1);
    madeMask.style.transform = `scale(${(1.32 - .32 * easeOut(p)).toFixed(4)})`;
  }

  /* ---------- equipment: stacked cards ---------- */
  const cards = $$('.card');
  const cardIns = cards.map(c => $('.card__in', c));
  function stackUpdate() {
    if (reduce) return;
    for (let i = 0; i < cards.length - 1; i++) {
      const a = cards[i].getBoundingClientRect();
      if (a.bottom < -200 || a.top > innerHeight) continue;
      const nt = cards[i + 1].getBoundingClientRect().top;
      const covered = clamp(1 - (nt - a.top) / a.height, 0, 1);
      cardIns[i].style.transform = `scale(${(1 - covered * .07).toFixed(4)})`;
      cardIns[i].style.setProperty('--dim', (covered * .6).toFixed(3));
    }
  }

  /* ---------- parallax: mosaic columns and the crew card ---------- */
  const handSec = $('[data-hand]');
  const cols = $$('[data-speed]');
  const parEls = $$('[data-par]');
  function parallax() {
    if (reduce) return;
    if (handSec) {
      const r = handSec.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) {
        const off = r.top + r.height / 2 - innerHeight / 2;
        cols.forEach(c => { c.style.transform = `translate3d(0, ${(off * +c.dataset.speed).toFixed(1)}px, 0)`; });
      }
    }
    parEls.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > innerHeight + 100) return;
      const off = r.top + r.height / 2 - innerHeight / 2;
      el.style.transform = `translate3d(0, ${(off * +el.dataset.par).toFixed(1)}px, 0)`;
    });
  }

  /* ---------- phone dock ---------- */
  const dock = $('[data-dock]');
  const order = $('#order'), visit = $('#visit'), foot = $('.foot'), equip = $('#equipment');
  function dockUpdate() {
    if (!dock || getComputedStyle(dock).display === 'none') return;
    const past = hero.getBoundingClientRect().bottom < innerHeight * .2;
    const inZone = el => { const r = el.getBoundingClientRect(); return r.top < innerHeight * .8 && r.bottom > 0; };
    const pr = proc.getBoundingClientRect();
    const inProc = pr.top < innerHeight * .5 && pr.bottom > innerHeight * .5;
    dock.classList.toggle('is-on', past && !menuOpen && !inProc && !inZone(order) && !inZone(visit) && !inZone(foot) && !inZone(equip));
  }

  /* ---------- one scroll loop ---------- */
  let ticking = false;
  function frame() {
    ticking = false;
    heroScroll(); navState(); procUpdate(); madeUpdate(); stackUpdate(); parallax(); dockUpdate();
  }
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  frame();

  /* ---------- magnetic buttons (desktop) ---------- */
  if (fine && !reduce) {
    $$('.magnet').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        el.style.transition = 'translate 200ms cubic-bezier(.23,1,.32,1), transform 160ms cubic-bezier(.23,1,.32,1), background-color 200ms';
        el.style.translate = `${(dx * .12).toFixed(1)}px ${(dy * .22).toFixed(1)}px`;
      });
      el.addEventListener('pointerleave', () => { el.style.transition = 'translate 600ms cubic-bezier(.23,1,.32,1)'; el.style.translate = '0 0'; });
    });
  }

  /* ---------- map on request ---------- */
  const mapBtn = $('[data-map-load]');
  if (mapBtn) mapBtn.addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = 'https://maps.google.com/maps?q=6.021313,80.251812&z=16&output=embed';
    f.title = 'Map: Inex workshop, 92 Heenatigala Rd, Unawatuna';
    f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';
    $('[data-map]').replaceChildren(f);
  });

  /* ---------- work order, plate and the win ---------- */
  const wo = $('[data-wo]'), plate = $('[data-plate]');
  let pickNeed = () => {};
  if (wo && plate) {
    const out = k => $(`[data-out="${k}"]`);
    const state = { name: '', type: '', needs: [], town: '', person: '', ref: '' };
    const DEF = { name: 'Your business', type: '—', needs: '—', town: '—' };
    const hot = {};
    function engrave(k, text) {
      const el = out(k), val = text || DEF[k];
      if (el.textContent === val) return;
      el.textContent = val;
      el.classList.toggle('is-empty', !text);
      if (reduce || !text) return;
      el.classList.add('is-hot'); clearTimeout(hot[k]);
      hot[k] = setTimeout(() => el.classList.remove('is-hot'), 380);
    }
    const needsText = () => state.needs.length > 2 ? state.needs.slice(0, 2).join(', ') + ' +' + (state.needs.length - 2) : state.needs.join(', ');
    function render() {
      engrave('name', state.name); engrave('type', state.type); engrave('needs', needsText()); engrave('town', state.town);
      wo.classList.toggle('is-ready', !!(state.name && state.type) && !wo.classList.contains('is-done'));
    }
    ['name', 'town', 'person'].forEach(k => {
      const inp = wo.elements[k];
      inp.addEventListener('input', () => { state[k] = inp.value.trim(); render(); clearErr(); unstamp(); });
    });
    function readChips(group) {
      const key = group.dataset.chips, single = group.hasAttribute('data-single');
      const picked = $$('.chip[aria-pressed="true"]', group).map(c => c.textContent.trim());
      state[key] = single ? (picked[0] || '') : picked;
    }
    $$('[data-chips]', wo).forEach(group => {
      const single = group.hasAttribute('data-single');
      group.addEventListener('click', e => {
        const chip = e.target.closest('.chip'); if (!chip) return;
        const on = chip.getAttribute('aria-pressed') !== 'true';
        if (single) $$('.chip', group).forEach(c => c.setAttribute('aria-pressed', 'false'));
        chip.setAttribute('aria-pressed', String(on));
        readChips(group); render(); clearErr(); unstamp();
      });
    });
    pickNeed = name => {
      const group = $('[data-chips="needs"]', wo);
      const chip = $$('.chip', group).find(c => c.textContent.trim() === name);
      if (!chip) return;
      unstamp();
      chip.setAttribute('aria-pressed', 'true'); readChips(group); render();
      setTimeout(() => { chip.classList.remove('is-flash'); void chip.offsetWidth; chip.classList.add('is-flash'); }, 1300);
    };

    const err = $('[data-err]');
    const clearErr = () => { err.textContent = ''; };
    function newRef() {
      const d = new Date();
      const n = (crypto.getRandomValues ? crypto.getRandomValues(new Uint16Array(1))[0] : Math.random() * 65535) % 9000 + 1000;
      return `INX-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}-${n | 0}`;
    }
    const done = $('[data-done]'), wa = $('[data-wa]');
    function unstamp() {
      if (!wo.classList.contains('is-done')) return;
      wo.classList.remove('is-done'); done.hidden = true; plate.classList.remove('is-stamped');
      out('ref').textContent = 'INX-····-····';
      render();
    }
    function fail(msg, el) {
      err.textContent = msg;
      wo.classList.remove('is-shake'); void wo.offsetWidth; wo.classList.add('is-shake');
      setTimeout(() => wo.classList.remove('is-shake'), 400);
      if (el) el.focus();
    }
    wo.addEventListener('submit', e => {
      e.preventDefault();
      if (!state.name) return fail('Add your business name first. It goes on the plate.', wo.elements.name);
      if (!state.type) return fail('Pick a kitchen type.', $('[data-chips="type"] .chip', wo));
      state.ref = newRef();
      out('ref').textContent = state.ref;
      out('ref2').textContent = state.ref;
      out('ref3').textContent = state.ref;
      const lines = [
        'Hello Inex, I would like a quote for a kitchen.',
        `Ref: ${state.ref}`,
        `Business: ${state.name}`,
        `Kitchen: ${state.type}`,
        state.needs.length ? `Needs: ${state.needs.join(', ')}` : '',
        state.town ? `Town: ${state.town}` : '',
        state.person ? `Name: ${state.person}` : '',
      ].filter(Boolean);
      wa.href = 'https://wa.me/94776654172?text=' + encodeURIComponent(lines.join('\n'));
      wo.classList.remove('is-ready');
      $('[data-announce]').textContent = `Approved for fabrication. Your reference is ${state.ref}. Send it on WhatsApp below.`;
      if (reduce) return finish();
      celebrate(finish);
    });
    function finish() {
      plate.classList.remove('is-stamped'); void plate.offsetWidth; plate.classList.add('is-stamped');
      wo.classList.add('is-done'); done.hidden = false;
      const target = innerWidth <= 1080 ? plate : null;
      if (target) target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      setTimeout(() => wa.focus({ preventScroll: true }), 600);
    }
    $('[data-reset]').addEventListener('click', () => { unstamp(); wo.elements.name.focus(); });

    /* the full-screen "approved" moment */
    const win = $('[data-win]'), cv = $('[data-win-sparks]');
    let winT = [], winning = false;
    function celebrate(after) {
      if (winning) return;
      winning = true;
      lenis && lenis.stop();
      win.classList.remove('is-out');
      win.classList.add('is-on', 'is-shake');
      if (navigator.vibrate) navigator.vibrate([14, 60, 30]);
      winT.push(setTimeout(burst, 420));
      winT.push(setTimeout(end, 1900));
      let ended = false;
      function end() {
        if (ended) return; ended = true;
        winT.forEach(clearTimeout); winT = [];
        win.classList.add('is-out');
        setTimeout(() => {
          win.classList.remove('is-on', 'is-out', 'is-shake');
          winning = false; lenis && lenis.start();
          after();
        }, 560);
      }
      win.onclick = end;
    }
    function burst() {
      const W = innerWidth, H = innerHeight, dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = W * dpr; cv.height = H * dpr;
      const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = W < 700 ? 110 : 200;
      const P = Array.from({ length: n }, (_, i) => {
        const fromSide = i % 3 === 0;
        const ox = fromSide ? (i % 2 ? W * .08 : W * .92) : W / 2, oy = fromSide ? H * .7 : H * .52;
        const a = fromSide ? (-Math.PI / 2 + (i % 2 ? .5 : -.5) + (Math.random() - .5) * .9) : Math.random() * Math.PI * 2;
        const v = (fromSide ? 9 : 4) + Math.random() * (fromSide ? 10 : 12);
        return { x: ox, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, life: 1, decay: .012 + Math.random() * .02, w: 1.2 + Math.random() * 1.8 };
      });
      let t0 = performance.now();
      (function tick(t) {
        const dt = Math.min(2, (t - t0) / 16.7); t0 = t;
        g.clearRect(0, 0, W, H);
        let alive = 0;
        for (const p of P) {
          if (p.life <= 0) continue; alive++;
          const px = p.x, py = p.y;
          p.vy += .28 * dt; p.vx *= .985; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= p.decay * dt;
          g.strokeStyle = `rgba(255,${200 + 55 * p.life | 0},${120 + 120 * p.life | 0},${Math.max(0, p.life)})`;
          g.lineWidth = p.w; g.beginPath(); g.moveTo(px, py); g.lineTo(p.x, p.y); g.stroke();
        }
        if (alive && win.classList.contains('is-on')) requestAnimationFrame(tick); else g.clearRect(0, 0, W, H);
      })(t0);
    }

    /* the plate tilts toward the pointer and catches the light */
    if (fine && !reduce) {
      const stage = plate.parentElement;
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
      const step = () => {
        cx += (tx - cx) * .12; cy += (ty - cy) * .12;
        plate.style.setProperty('--ry', (cx * 9).toFixed(2) + 'deg');
        plate.style.setProperty('--rx', (-cy * 7).toFixed(2) + 'deg');
        plate.style.setProperty('--mx', (50 + cx * 50).toFixed(1) + '%');
        plate.style.setProperty('--my', (35 + cy * 50).toFixed(1) + '%');
        raf = (Math.abs(tx - cx) > .001 || Math.abs(ty - cy) > .001) ? requestAnimationFrame(step) : 0;
      };
      stage.addEventListener('pointermove', e => {
        const r = plate.getBoundingClientRect();
        tx = clamp((e.clientX - r.left) / r.width - .5, -.5, .5) * 2;
        ty = clamp((e.clientY - r.top) / r.height - .5, -.5, .5) * 2;
        if (!raf) raf = requestAnimationFrame(step);
      });
      stage.addEventListener('pointerleave', () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(step); });
    }
  }

  window.__inexReady = true;
})();
