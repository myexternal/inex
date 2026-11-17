/* Inex Kitchen Solutions · v4 "Daylight" */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const phoneMQ = matchMedia('(max-width: 760px)');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = t => t * t * (3 - 2 * t);
  window.__inexReady = true;

  /* ---------- smooth scroll on desktop only, after load ---------- */
  let lenis = null;
  function startLenis() {
    if (!fine || reduce || lenis) return;
    const s = document.createElement('script');
    s.src = 'vendor/lenis.min.js';
    s.onload = () => {
      if (!window.Lenis) return;
      lenis = new window.Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 1 });
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    };
    document.head.appendChild(s);
  }
  function goTo(el) {
    const y = Math.max(0, Math.round(el.getBoundingClientRect().top + scrollY - (el.id === 'quote' ? 10 : 0)));
    if (lenis) lenis.scrollTo(y, { duration: 1.2 });
    else scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  }

  /* ---------- lazy images ---------- */
  const lazy = $$('img[data-src]');
  const showImg = i => { if (!i.dataset.src) return; if (i.dataset.srcset) i.srcset = i.dataset.srcset; i.src = i.dataset.src; i.removeAttribute('data-src'); const r = i.closest('[data-rail]'); if (r) $$('img[data-src]', r).forEach(showImg); };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { showImg(e.target); io.unobserve(e.target); } }), { rootMargin: '700px 0px' });
    lazy.forEach(i => io.observe(i));
  } else lazy.forEach(showImg);

  /* ---------- reveals ---------- */
  const rv = $$('[data-rv]');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    rv.forEach(el => io.observe(el));
  } else rv.forEach(el => el.classList.add('in'));

  /* ---------- videos: they always play while on screen ---------- */
  let pageLoaded = false;
  const autoplay = !reduce;
  const loadVid = v => { if (v.dataset.ok) return; v.dataset.ok = '1'; $$('source[data-src]', v).forEach(s => { s.src = s.dataset.src; }); v.load(); };
  const play = v => { v.dataset.want = '1'; loadVid(v); const p = v.play(); if (p) p.catch(() => {}); };
  const stop = v => { delete v.dataset.want; v.pause(); };
  const vids = $$('video[data-vid]');
  const onScreen = new Set();
  if ('IntersectionObserver' in window) {
    const pio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const g = e.target.closest('.reels'); (g ? $$('video[data-poster]', g) : [e.target]).forEach(v => { v.poster = v.dataset.poster; delete v.dataset.poster; pio.unobserve(v); }); } }), { rootMargin: '900px 0px' });
    vids.forEach(v => { if (v.dataset.poster) pio.observe(v); });
    const vio = new IntersectionObserver(es => es.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) { onScreen.add(v); if (pageLoaded && autoplay) play(v); }
      else { onScreen.delete(v); stop(v); }
    }), { threshold: 0.2 });
    vids.forEach(v => vio.observe(v));
  }
  // iOS Low Power Mode blocks autoplay until the first touch: retry then
  const kick = () => { $$('video').forEach(v => { if (v.dataset.want && v.paused) { const p = v.play(); if (p) p.catch(() => {}); } }); };
  ['touchend', 'pointerdown', 'keydown'].forEach(ev => addEventListener(ev, kick, { passive: true }));

  /* ---------- nav, menu, dock ---------- */
  const nav = $('[data-nav]'), dock = $('[data-dock]'), menu = $('[data-menu]'), menuBtn = $('[data-menu-btn]');
  const quote = $('#quote'), foot = $('.foot');
  let lastY = scrollY;
  function navState(y) {
    if (!nav) return;
    if (y > 320 && y > lastY + 4) nav.classList.add('is-away');
    else if (y < lastY - 4 || y < 320) nav.classList.remove('is-away');
    lastY = y;
  }
  function dockState(y) {
    if (!dock) return;
    const vh = innerHeight, q = quote.getBoundingClientRect(), f = foot.getBoundingClientRect();
    const hide = y < vh * 0.7 || (q.top < vh * 0.75 && q.bottom > vh * 0.2) || f.top < vh - 40;
    dock.classList.toggle('is-on', !hide);
  }
  function setMenu(open) {
    menu.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open));
    root.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (lenis) open ? lenis.stop() : lenis.start();
  }
  if (menuBtn) menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  addEventListener('keydown', e => { if (e.key === 'Escape' && menu && !menu.hidden) { setMenu(false); menuBtn.focus(); } });

  /* ---------- in-page links (and "ask about this") ---------- */
  let pick = () => {};
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute('href').slice(1); const el = id ? document.getElementById(id) : null; if (!el) return;
    e.preventDefault();
    if (menu && !menu.hidden) setMenu(false);
    if (id === 'quote') pick(a.dataset.type, a.dataset.need);
    goTo(el);
    if (history.replaceState) history.replaceState(null, '', id === 'top' ? location.pathname : '#' + id);
  });

  /* ---------- statement: words fill in as you read ---------- */
  const fill = $('[data-fill]'); let words = [], fillT = -1;
  if (fill && !reduce) {
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(' '));
            else { const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s); words.push(s); }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(fill);
  }
  function fillUpdate() {
    if (!words.length) return;
    const r = fill.getBoundingClientRect(), vh = innerHeight;
    if (r.bottom < -100 || r.top > vh + 100) return;
    const t = clamp((vh * 0.86 - r.top) / (r.height + vh * 0.36));
    if (Math.abs(t - fillT) < 0.004) return; fillT = t;
    const n = words.length, span = 7;
    for (let i = 0; i < n; i++) words[i].style.opacity = (0.16 + 0.84 * clamp((t * (n + span) - i) / span)).toFixed(3);
  }

  /* ---------- process rows ---------- */
  const steps = $$('.step');
  function stepsUpdate() {
    const line = innerHeight * 0.66;
    steps.forEach(s => s.classList.toggle('is-on', s.getBoundingClientRect().top < line));
  }

  /* ---------- THE FILM: scroll-driven frame sequence ---------- */
  const film = $('[data-film]');
  let filmUpdate = () => {}, filmResize = () => {};
  if (film) {
    const pin = $('.film__pin', film), cv = $('[data-film-cv]', film), ctx = cv.getContext('2d', { alpha: false });
    const head = $('[data-film-head]', film), cap = $('[data-film-cap]', film), endImg = $('[data-film-end]', film);
    const items = $$('.film__list li', film), segs = $$('.film__steps i', film);
    const N = 170, CB = 63, CC = 128, PAPER = '#F1EFEC', FA = 16 / 9;
    // scroll share of each chapter: hold, build, install, service, hold
    const P1 = 0.08, P2 = 0.40, P3 = 0.72, P4 = 0.94;
    let phone = phoneMQ.matches, dir = phone ? 'media/film/fm/' : 'media/film/f/';
    const imgs = new Array(N); let started = false, cw = 0, ch = 0, dpr = 1, lastKey = '', target = 0, shown = 0, raf = 0, chap = -1, W = null, reg = null, endOn = false;

    function measure() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = pin.clientWidth; ch = pin.clientHeight;
      cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
      if (phone) {
        const top = head.offsetTop + head.offsetHeight + 14, bot = cap.offsetTop - 14;
        W = { x: 12, y: top, w: cw - 24, h: Math.max(140, bot - top), r: 20 };
        reg = { top: W.y, bot: W.y + W.h };
      } else {
        W = { x: 10, y: 10, w: cw - 20, h: ch - 20, r: 30 };
        reg = { top: head.offsetTop + head.offsetHeight + 8, bot: cap.offsetTop - 14 };
      }
      Object.assign(endImg.style, { left: W.x + 'px', top: W.y + 'px', width: W.w + 'px', height: W.h + 'px', borderRadius: W.r + 'px' });
      lastKey = '';
    }
    function loadFrame(i, cb) {
      const im = new Image(); im.decoding = 'async';
      im.onload = () => { imgs[i] = im; cb && cb(); };
      im.onerror = () => { cb && cb(); };
      im.src = dir + String(i).padStart(3, '0') + '.webp';
    }
    function loadAll() {
      if (started) return; started = true;
      let next = 1, active = 0;
      const pump = () => {
        while (active < 5 && next < N) {
          const i = next++; active++;
          loadFrame(i, () => { active--; if (Math.abs(i - frameFor(shown)) < 2) { lastKey = ''; draw(); } pump(); });
        }
      };
      pump();
      endImg.src = phone ? 'media/img/k3-1280.webp' : 'media/img/k3-1920.webp';
    }
    const frameFor = p => p <= P1 ? 0 : p < P2 ? lerp(0, CB, (p - P1) / (P2 - P1)) : p < P3 ? lerp(CB, CC, (p - P2) / (P3 - P2)) : p < P4 ? lerp(CC, N - 1, (p - P3) / (P4 - P3)) : N - 1;
    const mix = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) });
    function rr(x, y, w, h, r) {
      ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }
    function feather(F, a) {
      const g = (x0, y0, x1, y1) => { const gr = ctx.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, PAPER); gr.addColorStop(1, 'rgba(241,239,236,0)'); return gr; };
      const e = F.w * 0.035, v = F.h * 0.06;
      ctx.globalAlpha = a;
      ctx.fillStyle = g(F.x, 0, F.x + e, 0); ctx.fillRect(F.x - 1, F.y - 1, e + 1, F.h + 2);
      ctx.fillStyle = g(F.x + F.w, 0, F.x + F.w - e, 0); ctx.fillRect(F.x + F.w - e, F.y - 1, e + 1, F.h + 2);
      ctx.fillStyle = g(0, F.y, 0, F.y + v); ctx.fillRect(F.x - 1, F.y - 1, F.w + 2, v + 1);
      ctx.fillStyle = g(0, F.y + F.h, 0, F.y + F.h - v); ctx.fillRect(F.x - 1, F.y + F.h - v, F.w + 2, v + 1);
      ctx.globalAlpha = 1;
    }
    function draw() {
      if (!cw) return;
      const p = shown, fi = Math.round(frameFor(p));
      let k = fi; while (k > 0 && !imgs[k]) k--;
      const im = imgs[k]; if (!im) return;
      // 1) the object floats on the page  2) the frame grows into a window on the finished room
      const a = smooth(clamp((p - P1) / (P2 - P1)));
      // sized from the free space between the heading and the caption, so nothing ever overlaps
      const rh = reg.bot - reg.top, rc = (reg.top + reg.bot) / 2;
      const fw1 = Math.min(1.36 * rh * FA, cw * (phone ? 1.9 : 0.96)), fw0 = Math.min(fw1 * 0.8, cw * 1.04);
      const fw = lerp(fw0, fw1, a), fh = fw / FA;
      const cy = rc - (lerp(0.7, 0.54, a) - 0.5) * fh;      // keep the parts, then the finished unit, centred
      const F0 = { x: (cw - fw) / 2, y: cy - fh / 2, w: fw, h: fh };
      const cwid = Math.max(W.w, W.h * FA), chei = cwid / FA;
      const F1 = { x: W.x + (W.w - cwid) / 2, y: W.y + (W.h - chei) / 2, w: cwid, h: chei };
      const t = smooth(clamp((p - (P2 + 0.02)) / 0.2));
      const F = mix(F0, F1, t), C = mix({ x: 0, y: 0, w: cw, h: ch }, W, t);
      const key = k + '|' + F.x.toFixed(1) + '|' + F.w.toFixed(1) + '|' + t.toFixed(3);
      if (key === lastKey) return; lastKey = key;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = PAPER; ctx.fillRect(0, 0, cw, ch);
      ctx.save();
      rr(C.x, C.y, C.w, C.h, W.r * t); ctx.clip();
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(im, F.x, F.y, F.w, F.h);
      if (t < 1) feather(F, 1 - t);
      ctx.restore();
    }
    function ui(p) {
      const c = p < 0.1 ? 0 : p < P2 + 0.02 ? 1 : p < P3 + 0.02 ? 2 : 3;
      if (c !== chap) { chap = c; items.forEach((li, i) => li.classList.toggle('is-on', i === c)); }
      const f = [p / 0.1, (p - 0.1) / (P2 - 0.08), (p - P2 - 0.02) / (P3 - P2), (p - P3 - 0.02) / (P4 - P3 - 0.02)];
      segs.forEach((s, i) => s.style.setProperty('--f', clamp(f[i]).toFixed(3)));
      if (!phone) {
        const o = 1 - smooth(clamp((p - 0.36) / 0.09));
        head.style.opacity = o.toFixed(3); head.style.transform = `translateY(${((1 - o) * -24).toFixed(1)}px)`;
      } else { head.style.opacity = ''; head.style.transform = ''; }
      const e = p > 0.965 && endImg.complete && endImg.naturalWidth > 0;
      if (e !== endOn) { endOn = e; endImg.classList.toggle('is-on', e); }
    }
    function tick() {
      raf = 0;
      const d = target - shown;
      shown = Math.abs(d) < 0.0006 ? target : shown + d * (lenis ? 0.5 : 0.22);
      draw(); ui(shown);
      if (shown !== target) raf = requestAnimationFrame(tick);
    }
    filmUpdate = () => {
      const r = film.getBoundingClientRect(), vh = innerHeight;
      const inside = r.top <= 1 && r.bottom >= vh - 1;
      root.classList.toggle('in-film', inside);
      if (r.bottom < -200 || r.top > vh * 2.5) return;
      if (!imgs[0] && !film.dataset.first) { film.dataset.first = '1'; loadFrame(0, () => { lastKey = ''; draw(); }); }
      if (r.top < vh * 1.6) loadAll();
      target = clamp(-r.top / (r.height - vh));
      if (!raf) raf = requestAnimationFrame(tick);
    };
    filmResize = () => { const was = phone; phone = phoneMQ.matches; if (was !== phone) dir = phone ? 'media/film/fm/' : 'media/film/f/'; measure(); draw(); ui(shown); };
    measure(); ui(0);
    addEventListener('load', () => setTimeout(() => { loadFrame(0, () => { lastKey = ''; draw(); }); setTimeout(loadAll, 2200); }, 300));
  }

  /* ---------- wok range turntable: drag to spin ---------- */
  const spin = $('[data-spin]');
  if (spin) {
    const c = $('[data-spin-cv]', spin), c2 = c.getContext('2d'), M = 72, fr = new Array(M);
    let got = 0, pos = 0, shownF = -1, vel = 0, drag = false, lx = 0, sx = 0, sy = 0, locked = false, raf = 0, begun = false, teased = false, seen = false;
    const paint = () => {
      const i = ((Math.round(pos) % M) + M) % M; let k = -1;
      for (let d = 0; d < M; d++) { const j = (i - d + M) % M; if (fr[j]) { k = j; break; } }
      if (k < 0 || k === shownF) return; shownF = k;
      c2.drawImage(fr[k], 0, 0, c.width, c.height); spin.classList.add('is-live');
    };
    const begin = () => {
      if (begun) return; begun = true;
      for (let i = 0; i < M; i++) { const im = new Image(); im.decoding = 'async'; im.onload = () => { fr[i] = im; got++; if (i === 0) paint(); if (got === M) tease(); }; im.src = 'media/spin/' + String(i).padStart(2, '0') + '.webp'; }
    };
    function tease() {
      if (teased || !seen || got < M || reduce || drag) return; teased = true;
      const t0 = performance.now(), D = 2600;
      const step = now => { if (drag) return; const t = clamp((now - t0) / D); pos = M * (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2); paint(); if (t < 1) requestAnimationFrame(step); else pos = 0; };
      requestAnimationFrame(step);
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) begin(); }), { rootMargin: '600px 0px' }).observe(spin);
      new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { seen = true; tease(); } }), { threshold: 0.55 }).observe(spin);
    } else begin();
    const ppf = () => Math.max(5, spin.clientWidth / 54);
    const coast = () => { raf = 0; if (drag || Math.abs(vel) < 0.03) return; pos += vel; vel *= 0.93; paint(); raf = requestAnimationFrame(coast); };
    spin.addEventListener('pointerdown', e => { if (e.button) return; drag = true; locked = e.pointerType === 'mouse'; lx = sx = e.clientX; sy = e.clientY; vel = 0; begin(); if (locked) { try { spin.setPointerCapture(e.pointerId); } catch (_) {} } });
    spin.addEventListener('pointermove', e => {
      if (!drag) return;
      if (!locked) { const dx = Math.abs(e.clientX - sx), dy = Math.abs(e.clientY - sy); if (dx < 6 && dy < 6) return; if (dy > dx) { drag = false; return; } locked = true; try { spin.setPointerCapture(e.pointerId); } catch (_) {} }
      const d = (e.clientX - lx) / ppf(); lx = e.clientX; pos -= d; vel = -d; paint(); spin.classList.add('is-used');
    });
    const up = () => { if (!drag) return; drag = false; if (!raf) raf = requestAnimationFrame(coast); };
    spin.addEventListener('pointerup', up); spin.addEventListener('pointercancel', up);
    spin.addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); begin(); pos += e.key === 'ArrowRight' ? 3 : -3; paint(); spin.classList.add('is-used'); } });
  }

  /* ---------- map on request ---------- */
  const mapBtn = $('[data-map-load]');
  if (mapBtn) mapBtn.addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = 'https://maps.google.com/maps?q=6.021313,80.251812&z=16&output=embed';
    f.title = 'Map: Inex workshop, 92 Heenatigala Rd, Unawatuna';
    f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';
    $('[data-map]').replaceChildren(f);
    mapBtn.remove();
  });

  /* ---------- quote form and the ignition ---------- */
  const form = $('[data-form]'), panel = $('[data-quote]');
  if (form && panel) {
    const done = $('[data-done]'), err = $('[data-err]'), wa = $('[data-wa]'), mail = $('[data-mail]'), sum = $('[data-sum]');
    const flame = $('[data-flame]'), win = $('[data-win]'), wv = $('[data-win-vid]');
    const state = { name: '', type: '', needs: [], town: '', person: '', ref: '' };
    const ready = () => form.classList.toggle('is-ready', !!(state.name && state.type));
    const clearErr = () => { err.textContent = ''; };
    ['name', 'town', 'person'].forEach(k => { const inp = form.elements[k]; inp.addEventListener('input', () => { state[k] = inp.value.trim(); ready(); clearErr(); }); });
    function readChips(g) {
      const key = g.dataset.chips, picked = $$('.chip[aria-pressed="true"]', g).map(c => c.textContent.trim());
      state[key] = g.hasAttribute('data-single') ? (picked[0] || '') : picked;
    }
    $$('[data-chips]', form).forEach(g => g.addEventListener('click', e => {
      const chip = e.target.closest('.chip'); if (!chip) return;
      const on = chip.getAttribute('aria-pressed') !== 'true';
      if (g.hasAttribute('data-single')) $$('.chip', g).forEach(c => c.setAttribute('aria-pressed', 'false'));
      chip.setAttribute('aria-pressed', String(on)); readChips(g); ready(); clearErr();
    }));
    const flash = chip => setTimeout(() => { chip.classList.remove('is-flash'); void chip.offsetWidth; chip.classList.add('is-flash'); }, 1100);
    pick = (type, need) => {
      if (!type && !need) return;
      if (panel.classList.contains('is-lit')) unlight();
      if (type) { const g = $('[data-chips="type"]', form), chip = $$('.chip', g).find(c => c.textContent.trim() === type); if (chip) { $$('.chip', g).forEach(c => c.setAttribute('aria-pressed', 'false')); chip.setAttribute('aria-pressed', 'true'); readChips(g); flash(chip); } }
      if (need) { const g = $('[data-chips="needs"]', form), chip = $$('.chip', g).find(c => c.textContent.trim() === need); if (chip) { chip.setAttribute('aria-pressed', 'true'); readChips(g); flash(chip); } }
      ready();
    };
    function newRef() {
      const d = new Date();
      const n = (window.crypto && crypto.getRandomValues ? crypto.getRandomValues(new Uint16Array(1))[0] : Math.random() * 65535) % 9000 + 1000;
      return `INX-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}-${n | 0}`;
    }
    function fail(msg, el) {
      err.textContent = msg;
      form.classList.remove('is-shake'); void form.offsetWidth; form.classList.add('is-shake');
      setTimeout(() => form.classList.remove('is-shake'), 400);
      if (el) el.focus();
    }
    function unlight() {
      panel.classList.remove('is-lit'); done.hidden = true; form.hidden = false; stop(flame); ready();
    }
    // warm the two burner clips shortly before they are needed
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { wv.preload = 'auto'; loadVid(wv); flame.preload = 'auto'; loadVid(flame); io.disconnect(); } }), { rootMargin: '500px 0px' });
      io.observe(panel);
    }
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!state.name) return fail('Add your business name first.', form.elements.name);
      if (!state.type) return fail('Pick the kind of kitchen.', $('[data-chips="type"] .chip', form));
      state.ref = newRef();
      $$('[data-out^="ref"]').forEach(o => { o.textContent = state.ref; });
      const rows = [['Business', state.name], ['Kitchen', state.type], ['Needs', state.needs.join(', ')], ['Town', state.town], ['Name', state.person]].filter(r => r[1]);
      sum.replaceChildren(...rows.map(([k, v]) => { const d = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = k; dd.textContent = v; d.append(dt, dd); return d; }));
      const lines = ['Hello Inex, I would like a quote for a kitchen.', `Ref: ${state.ref}`, ...rows.map(([k, v]) => `${k}: ${v}`)];
      wa.href = 'https://wa.me/94776654172?text=' + encodeURIComponent(lines.join('\n'));
      mail.href = 'mailto:inexkitchen@gmail.com?subject=' + encodeURIComponent(`Kitchen quote request ${state.ref}`) + '&body=' + encodeURIComponent(lines.join('\n'));
      $('[data-announce]').textContent = `Flame on. Your request ${state.ref} is ready. Send it on WhatsApp below.`;
      if (reduce) return finish();
      celebrate(finish);
    });
    function finish() {
      form.hidden = true; done.hidden = false; panel.classList.add('is-lit');
      if (autoplay) play(flame);
      goTo(quote);
      setTimeout(() => wa.focus({ preventScroll: true }), 700);
    }
    $('[data-reset]').addEventListener('click', () => { unlight(); form.elements.name.focus(); });

    /* the win: the burner lights across the whole screen */
    let winning = false;
    function celebrate(after) {
      if (winning) return; winning = true;
      const timers = []; let ended = false; const t0 = performance.now();
      win.hidden = false; win.classList.remove('is-out', 'is-lit');
      if (lenis) lenis.stop();
      loadVid(wv);
      const startAt = () => { try { wv.currentTime = 0.28; } catch (_) {} };
      if (wv.readyState >= 1) startAt(); else wv.addEventListener('loadedmetadata', startAt, { once: true });
      const p = wv.play(); if (p) p.catch(() => {});
      requestAnimationFrame(() => requestAnimationFrame(() => win.classList.add('is-on')));
      timers.push(setTimeout(() => { win.classList.add('is-lit'); if (navigator.vibrate) navigator.vibrate([18, 50, 40]); }, 520));
      timers.push(setTimeout(end, 3700));
      function end() {
        if (ended || performance.now() - t0 < 700) return; ended = true;
        timers.forEach(clearTimeout);
        win.classList.add('is-out');
        after();
        setTimeout(() => { win.hidden = true; win.classList.remove('is-on', 'is-out', 'is-lit'); wv.pause(); winning = false; if (lenis) lenis.start(); win.removeEventListener('click', end); removeEventListener('keydown', key); }, 580);
      }
      const key = e => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') end(); };
      win.addEventListener('click', end); addEventListener('keydown', key);
    }
  }

  /* ---------- one scroll loop ---------- */
  let ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      ticking = false; const y = scrollY;
      filmUpdate(); navState(y); dockState(y); fillUpdate(); stepsUpdate();
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  let rz = 0;
  addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { filmResize(); onScroll(); }, 120); });
  addEventListener('load', () => {
    pageLoaded = true;
    if (autoplay) onScreen.forEach(play);
    setTimeout(startLenis, 400);
    onScroll();
  });
  onScroll();
})();
