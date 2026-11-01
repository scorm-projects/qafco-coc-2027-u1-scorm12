/* QAFCO Code of Conduct 2027 — Unit 1 host (collage style, fixed stage).
   All learner-facing text is copied word for word from the delivered course (Qafco / Qafco-AR),
   and every sound is the course's own recorded narration. Only design and interaction are new.

   The host owns the stage, the welcome screen, the shared navigation bar, the topic menu, narration
   and SCORM progress. Each Unit 1 slide is a module in js/slides/*.js that registers itself with
   QX.register(id, module). A module may define:
     build(sec)      once, before the first render: create the slide's markup inside its <section>
     render()        (re)draw text for the current language
     enter(resume)   the slide is shown (resume: coming back to a slide seen before)
     leave()         the slide is hidden
     canNext()       may the learner move on?        hint() → text for the navigation bar
     next() / prev() handle Next / Previous inside the slide; return true when handled
     done()          has the slide been completed?
     getState() / setState(s)  progress kept in the LMS */
(function () {
  'use strict';

  const T = {
    en: {
      course: 'Code of Conduct', where: 'Unit 1 · Foundations of the Code of Conduct',
      eyebrow: 'eLearning course', brand: 'QAFCO', title: 'Code of Conduct',
      lead: 'How our principles come to life — every day, in every role.',
      units: ['Foundations of the Code of Conduct', 'Workplace Conduct & Information Protection', 'Speak Up'],
      final: 'Final Assessment', finalNote: 'pass mark 75%',
      meta: ['About 40 minutes', 'Narrated — turn your sound on'],
      start: 'Start the course', resume: 'Continue where you left off',
      prev: 'Previous', next: 'Next', menu: 'Topics', topicsTitle: 'Unit 1',
      hintDone: 'Done: you can continue', hintLocked: 'Complete the topics before this one first',
      playing: 'Playing narration', played: 'Narration played'
    },
    ar: {
      course: 'مدوَّنة قواعد السُّلوك', where: 'الوحدة ١ · أُسُس مدوَّنة قواعد السُّلوك في قافكو',
      eyebrow: 'دورة تعلّم إلكتروني', brand: 'قافكو', title: 'مدوَّنة قواعد السُّلوك',
      lead: 'كيف تُوجّه مبادئنا قراراتنا وممارساتنا اليوميّة؟',
      units: ['أُسُس مدوَّنة قواعد السُّلوك في قافكو', 'السلوك في مكان العمل وحماية المعلومات', 'التحدُّث بصراحة'],
      final: 'التقييم النهائي', finalNote: 'درجة النجاح ٧٥٪',
      meta: ['نحو ٤٠ دقيقة', 'مصحوبة بشرح صوتي — شغّل الصوت'],
      start: 'ابدأ الدورة', resume: 'تابع من حيث توقفت',
      prev: 'السابق', next: 'التالي', menu: 'الموضوعات', topicsTitle: 'الوحدة ١',
      hintDone: 'تم — يمكنك المتابعة', hintLocked: 'أكمل الموضوعات السابقة أولًا',
      playing: 'يتم تشغيل الشرح', played: 'تم الاستماع'
    }
  };

  /* The Unit 1 screens in course order (the welcome screen comes before them). */
  const ORDER = ['cover', 's2', 's3', 's4', 's5', 's6'];

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const toAr = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap;
  const rnd = (seed) => { const x = Math.sin(seed * 9301.7 + 49297.3) * 233280; return x - Math.floor(x); };
  const q = new URLSearchParams(location.search);
  const STILL = q.has('still');

  let lang = 'en';
  const mods = {};
  const dig = (n) => lang === 'ar' ? toAr(n) : String(n);
  const num = (i) => dig(String(i + 1).padStart(2, '0'));

  /* ── Fixed stage: scale to fit, portrait canvas on phones held upright ── */
  const stage = $('#stage');
  function fit() {
    const portrait = innerWidth < 820 && innerHeight > innerWidth;
    stage.classList.toggle('is-portrait', portrait);
    const sw = portrait ? 720 : 1600, sh = portrait ? 1280 : 900;
    const s = Math.min(innerWidth / sw, innerHeight / sh) * 0.97;
    stage.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
  }
  addEventListener('resize', () => { fit(); Object.values(mods).forEach((m) => m.resize && m.resize()); });

  /* ── Icons (Phosphor SVGs, inlined so they take the text colour) ── */
  const cache = {};
  const icon = (n) => (cache[n] = cache[n] || fetch('assets/icons/' + n + '.svg').then((r) => r.text()).catch(() => ''));
  async function fillIcons(root = document) {
    await Promise.all($$('svg[data-icon]', root).map(async (el) => {
      const m = await icon(el.dataset.icon); if (!m) return;
      const tpl = document.createElement('template'); tpl.innerHTML = m.trim();
      const svg = tpl.content.firstElementChild; svg.removeAttribute('width'); svg.removeAttribute('height'); svg.setAttribute('aria-hidden', 'true');
      if (el.getAttribute('class')) svg.setAttribute('class', el.getAttribute('class'));
      if (el.parentNode) el.replaceWith(svg);
    }));
  }
  const ic = (n, cls) => '<svg data-icon="' + n + '"' + (cls ? ' class="' + cls + '"' : '') + '></svg>';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ── Collage shapes: torn paper edges and the torn QAFCO leaf ── */
  function tornPolygon(seed, amp = 1.4) {
    const pts = [], n = 16;
    for (let i = 0; i < n; i++) pts.push([i * 100 / n, (rnd(seed + i) - .5) * amp + amp / 2]);
    for (let i = 0; i < n; i++) pts.push([100 - (rnd(seed + 40 + i) - .5) * amp - amp / 2, i * 100 / n]);
    for (let i = 0; i < n; i++) pts.push([100 - i * 100 / n, 100 - (rnd(seed + 80 + i) - .5) * amp - amp / 2]);
    for (let i = 0; i < n; i++) pts.push([(rnd(seed + 120 + i) - .5) * amp + amp / 2, 100 - i * 100 / n]);
    return pts;
  }
  const poly = (pts) => 'polygon(' + pts.map(([x, y]) => x.toFixed(2) + '% ' + y.toFixed(2) + '%').join(', ') + ')';
  function leafD(w, h, seed) {
    const R = Math.min(w, h) * .42, t = Math.min(w, h) * .07, P = [];
    const arc = (cx, cy, r, a0, a1) => { for (let i = 0; i <= 12; i++) { const a = a0 + (a1 - a0) * i / 12; P.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
    const line = (x0, y0, x1, y1) => { const n = Math.max(4, Math.round(Math.hypot(x1 - x0, y1 - y0) / 20)); for (let i = 1; i < n; i++) P.push([x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n]); };
    arc(R, R, R, Math.PI, Math.PI * 1.5); line(R, 0, w - R, 0); arc(w - R, R, R, Math.PI * 1.5, Math.PI * 2); line(w, R, w, h - R);
    arc(w - R, h - R, R, 0, Math.PI * .5); line(w - R, h, t, h); arc(t, h - t, t, Math.PI * .5, Math.PI); line(0, h - t, 0, R);
    return 'M' + P.map(([x, y], i) => { const j = (rnd(seed + i) - .5) * 7; return (x + j).toFixed(1) + ' ' + (y + j * .6).toFixed(1); }).join(' L') + ' Z';
  }
  function drawShapes(root = document) {
    $$('.torn', root).forEach((el, k) => { el._torn = tornPolygon(k * 7 + 3 + (el.dataset.seed | 0)); el.style.clipPath = poly(el._torn); });
    $$('svg[data-leaf]', root).forEach((el, k) => {
      const [, , w, h] = el.getAttribute('viewBox').split(' ').map(Number);
      const id = 'wl' + Math.random().toString(36).slice(2, 8);
      el.innerHTML = '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#12A061"/><stop offset="1" stop-color="#02833D"/></linearGradient></defs><path d="' + leafD(w - 12, h - 12, 11 + k) + '" transform="translate(6 6)" fill="url(#' + id + ')"/>';
      el.style.transform = lang === 'ar' ? 'scaleX(-1)' : '';
    });
  }

  /* ── Course files: narration and pictures from the delivered course (or the package's copies) ──
     English paths are relative to Qafco/U1/, Arabic ones to Qafco-AR/U1/ (as in content/u1.*.json).
     The SCORM build writes window.QX_MAP, which points every one of them at its copy in the package. */
  function norm(p) {
    const out = [];
    p.split('/').forEach((s) => { if (s === '.' || s === '') return; if (s === '..' && out.length && out[out.length - 1] !== '..') out.pop(); else out.push(s); });
    return out.join('/');
  }
  function file(p, l = lang) {
    if (!p) return p;
    const full = p.startsWith('../Qafco') ? norm(p) : norm((l === 'ar' ? '../Qafco-AR/U1/' : '../Qafco/U1/') + p);
    return (window.QX_MAP && window.QX_MAP[full]) || full;
  }

  /* ── Narration: one queue at a time ── */
  const voice = new Audio();
  let queue = [], onEnd = null, speakId = 0;
  function speak(files, done) {
    stopVoice(); const id = ++speakId;
    queue = (files || []).filter(Boolean).slice(); onEnd = done;
    const next = () => {
      if (id !== speakId) return;
      const f = queue.shift();
      if (!f) { const cb = onEnd; onEnd = null; if (cb) cb(); return; }
      voice.src = encodeURI(file(f)); voice.onended = next;
      voice.play().catch(() => { if (id !== speakId) return; const cb = onEnd; onEnd = null; if (cb) cb(); });
    };
    if (STILL) { const cb = onEnd; onEnd = null; if (cb) setTimeout(cb, 0); return; }
    next();
  }
  function stopVoice() { speakId++; voice.onended = null; queue = []; onEnd = null; try { voice.pause(); } catch (e) { /* ignore */ } }

  /* ── Shared lesson film: autoplays, falls back to the recorded "click on the animation" prompt ── */
  function film(player, cfg) {
    const video = $('video', player), btn = $('.player__play', player);
    const api = {
      done: false,
      load() { const s = cfg.src(); if (!video.src.endsWith(s)) { video.src = s; video.poster = cfg.poster(); player.classList.remove('is-playing'); } },
      start() {
        api.load();
        if (api.done || STILL) return;
        stopVoice(); video.currentTime = 0;
        const p = video.play();
        if (p && p.then) p.then(() => player.classList.add('is-playing')).catch(() => { player.classList.remove('is-playing'); speak(cfg.prompt()); });
      },
      stop() { if (!video.paused) video.pause(); }
    };
    btn.addEventListener('click', () => { stopVoice(); player.classList.add('is-playing'); video.play(); });
    video.addEventListener('click', () => { if (video.paused) video.play(); else video.pause(); });
    video.addEventListener('ended', () => { api.done = true; player.classList.remove('is-playing'); cfg.onEnd(); });
    return api;
  }

  /* ── Lesson scaffold shared by the film slides: heading, step dots, watch step, explore step ── */
  function lesson(sec, o) {
    sec.innerHTML =
      '<div class="l-head"><div class="chips"></div><h1 class="label l-title"></h1></div>' +
      '<div class="steps" aria-hidden="true"><span class="on">1</span><span>2</span></div>' +
      '<div class="step step--watch is-on' + (o.intro ? '' : ' step--solo') + '">' +
        (o.intro ? '<div class="intro-card"><span class="tape"></span><span class="intro-text"></span></div>' : '') +
        '<div class="player"><span class="tape"></span><video playsinline preload="metadata"></video>' +
        '<button type="button" class="player__play"><span><i>' + ic('Play-bold') + '</i><b class="play-label"></b></span></button></div>' +
        '<p class="watch-note"></p>' +
      '</div>' +
      '<div class="step step--explore">' +
        '<div class="explore-bar"><h2>' + ic('Sparkle-duotone') + '<span class="explore-title"></span></h2>' +
        '<div class="ring" aria-live="polite"><svg viewBox="0 0 52 52"><circle class="bg" cx="26" cy="26" r="21" /><circle class="fg" cx="26" cy="26" r="21" /></svg><b class="ring-n">0</b><span class="ring-t"></span></div></div>' +
        '<div class="explore-body"></div>' +
      '</div>';
    const steps = $$('.steps span', sec), panes = [$('.step--watch', sec), $('.step--explore', sec)];
    return {
      sec, player: $('.player', sec), body: $('.explore-body', sec),
      head(chips, title) {
        $('.chips', sec).innerHTML = chips.map((c, i) => '<span class="chip' + (i ? ' chip--teal' : '') + '">' + ic(i ? 'ShieldCheck-bold' : 'BookOpenText-bold') + '<span>' + esc(c) + '</span></span>').join('');
        $('.l-title', sec).textContent = title;
      },
      texts(t) {
        if (o.intro) $('.intro-text', sec).textContent = t.intro || '';
        $('.play-label', sec).textContent = t.play || '';
        const n = $('.watch-note', sec); n.textContent = t.note || ''; n.hidden = !t.note;
        $('.explore-title', sec).textContent = t.explore || '';
      },
      ring(n, total, label) {
        const C = 2 * Math.PI * 21, fg = $('.ring .fg', sec);
        fg.style.strokeDasharray = C; fg.style.strokeDashoffset = C * (1 - n / total);
        $('.ring-n', sec).textContent = dig(n); $('.ring-t', sec).textContent = label;
      },
      step(n) {
        steps[0].className = n === 1 ? 'on' : 'done'; steps[1].className = n === 2 ? 'on' : '';
        panes[0].classList.toggle('is-on', n === 1); panes[1].classList.toggle('is-on', n === 2);
      },
      intro() {
        if (!G || reduce || STILL) return;
        const tl = G.timeline({ defaults: { ease: 'power3.out' } });
        tl.from($$('.chips .chip', sec), { y: 12, opacity: 0, duration: .6, stagger: .08 })
          .from($('.l-title', sec), { x: lang === 'ar' ? 40 : -40, opacity: 0, duration: .9 }, .1);
        if (panes[0].classList.contains('is-on')) tl.from($$('.step--watch > *', sec), { y: 34, opacity: 0, rotate: -2, duration: 1, stagger: .12 }, .3);
      }
    };
  }

  /* ══ Screens and navigation ══ */
  let screenNow = 'welcome';
  const visited = new Set();
  const content = (id) => (window.QX_CONTENT[lang].slides || []).find((s) => s.id === id) || {};
  const firstUndone = () => { const i = ORDER.findIndex((id) => !(mods[id] && mods[id].done && mods[id].done())); return i < 0 ? ORDER.length - 1 : i; };
  const reachable = (id) => ORDER.indexOf(id) <= firstUndone() || visited.has(id);

  function show(id, opts = {}) {
    if (!mods[id] && id !== 'welcome') id = 'welcome';
    const was = screenNow, m0 = mods[was];
    stopVoice();
    if (m0 && m0.leave) m0.leave();
    screenNow = id;
    $$('.screen').forEach((s) => s.classList.toggle('is-on', s.id === id));
    $$('.review button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.screen === id)));
    stage.classList.toggle('on-welcome', id === 'welcome');
    $('#menu-btn').hidden = id === 'welcome';
    const m = mods[id];
    if (m) { const resume = visited.has(id); visited.add(id); if (m.enter) m.enter(resume, opts); }
    updateNav(); save();
    if (id === 'welcome' && G && !reduce && !STILL) welcomeIn();
  }
  function updateNav() {
    const t = T[lang], m = mods[screenNow];
    if (!m) return;
    const ok = m.canNext ? m.canNext() : true;
    $('#next').setAttribute('aria-disabled', String(!ok));
    const h = m.hint ? m.hint() : (ok ? t.hintDone : '');
    $('#hint-text').textContent = h;
    $('#hint').classList.toggle('is-ok', ok);
    renderTopics();
  }
  function go(dir) {
    const m = mods[screenNow];
    if (dir > 0) {
      if (m && m.next && m.next()) return changed();
      if (m && m.canNext && !m.canNext()) { nudge(); return; }
      const i = ORDER.indexOf(screenNow);
      show(i < ORDER.length - 1 ? ORDER[i + 1] : 'welcome');
    } else {
      if (m && m.prev && m.prev()) return changed();
      const i = ORDER.indexOf(screenNow);
      show(i > 0 ? ORDER[i - 1] : 'welcome', { back: true });
    }
  }
  function nudge() { if (G) G.fromTo('#hint', { x: lang === 'ar' ? 6 : -6 }, { x: 0, duration: .5, ease: 'elastic.out(1, .3)' }); }
  function changed() { updateNav(); save(); }

  /* Topic menu: every Unit 1 screen, ticked when complete; later ones open once the earlier ones are done */
  function renderTopics() {
    const list = $('#topics-list'); if (!list) return;
    list.innerHTML = ORDER.map((id, i) => {
      const m = mods[id], done = m && m.done && m.done(), on = id === screenNow, open = reachable(id);
      return '<li><button type="button" data-go="' + id + '"' + (open ? '' : ' aria-disabled="true"') + ' class="' + (on ? 'is-on ' : '') + (done ? 'is-done' : '') + '">' +
        '<i>' + (done ? ic('Check-bold') : open ? dig(i + 1) : ic('LockSimple-bold')) + '</i><span>' + esc(m && m.title ? m.title() : id) + '</span></button></li>';
    }).join('');
    $$('button', list).forEach((b) => b.addEventListener('click', () => {
      if (b.getAttribute('aria-disabled') === 'true') return;
      closeTopics(); if (b.dataset.go !== screenNow) show(b.dataset.go);
    }));
    fillIcons(list);
  }
  function openTopics() { renderTopics(); $('#topics').hidden = false; if (G && !reduce) G.from('.topics__panel', { x: lang === 'ar' ? -380 : 380, duration: .5, ease: 'power3.out' }); }
  function closeTopics() { $('#topics').hidden = true; }

  /* ══ Render ══ */
  function render() {
    const t = T[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    $$('[data-t]').forEach((el) => { const v = t[el.dataset.t]; if (typeof v === 'string') el.textContent = v; });
    $$('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    $('#w-title').innerHTML = '<b>' + t.brand + '</b>' + t.title;
    $('#journey').innerHTML = t.units.map((u, i) => '<li><i>' + dig(i + 1) + '</i>' + u + '</li>').join('') +
      '<li><i>' + ic('Medal-duotone') + '</i><span>' + t.final + ' <small>· ' + t.finalNote + '</small></span></li>';
    $('#meta').innerHTML = '<li>' + ic('Clock-duotone') + t.meta[0] + '</li><li>' + ic('SpeakerHigh-duotone') + t.meta[1] + '</li>';
    if (savedAny) $('#start [data-t="start"]').textContent = t.resume;
    ORDER.forEach((id) => { const m = mods[id]; if (m && m.render) m.render(); });
    drawShapes();
    updateNav();
    fillIcons();
  }

  /* ══ Progress for the LMS: language, where the learner is, and each slide's own state ══ */
  const isComplete = () => ORDER.every((id) => mods[id] && mods[id].done && mods[id].done());
  function save() {
    if (!window.SCO || STILL) return;
    const slides = {};
    ORDER.forEach((id) => { const m = mods[id]; if (m && m.getState) slides[id] = m.getState(); });
    window.SCO.save({ v: 2, lang, screen: screenNow, visited: [...visited], slides }, isComplete());
  }

  function welcomeIn() {
    const dir = lang === 'ar' ? -1 : 1;
    const tl = G.timeline({ defaults: { ease: 'power3.out' } });
    $$('#welcome .a-tear').forEach((el) => {
      const end = el._torn, start = end.map(([x, y]) => [lang === 'ar' ? 100 : 0, y]);
      tl.fromTo(el, { clipPath: poly(start) }, { clipPath: poly(end), duration: 1.4, ease: 'power2.inOut' }, 0.1);
    });
    tl.from('#welcome .a-pop', { scale: .8, opacity: 0, duration: 1, stagger: .15 }, .2)
      .from('#welcome .a-rise', { y: 90, opacity: 0, duration: 1.2, stagger: .18 }, .5)
      .from('#welcome .a-slide', { x: -60 * dir, opacity: 0, duration: 1 }, .2)
      .from('#welcome .a-fade', { y: 16, opacity: 0, duration: .8, stagger: .1 }, .5);
    $$('#welcome .a-draw path').forEach((p) => { const L = p.getTotalLength(); tl.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, 1.6); });
    G.to('#w-art .halftone', { y: -8, duration: 3.2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }

  /* ══ Public interface for the slide modules ══ */
  window.QX = {
    lang: () => lang, T: () => T[lang], toAr, dig, num, $, $$, G, reduce, STILL, rnd, esc,
    ic, fillIcons, drawShapes, poly, tornPolygon, speak, stopVoice, voice, file,
    content, film, lesson, changed, nudge, show,
    register(id, mod) { mods[id] = mod; mod.id = id; },
    current: () => screenNow
  };

  /* ══ Wiring and start-up (after every slide module has registered) ══ */
  let savedAny = false;
  addEventListener('DOMContentLoaded', () => {
    ORDER.forEach((id) => { const m = mods[id], sec = document.getElementById(id); if (m && m.build && sec) m.build(sec); });

    $$('.lang button').forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.lang === lang) return;
      const m = mods[screenNow];
      if (m && m.leave) m.leave();
      lang = b.dataset.lang; stopVoice(); render(); save();
      if (m && m.enter) m.enter(true, { lang: true }); else if (screenNow === 'welcome' && G && !reduce) welcomeIn();
      updateNav();
    }));
    $$('.review button').forEach((b) => b.addEventListener('click', () => show(b.dataset.screen)));
    $('#start').addEventListener('click', () => {
      const back = savedScreen && savedScreen !== 'welcome' && mods[savedScreen] ? savedScreen : 'cover';
      savedScreen = null; show(back);
    });
    $('#next').addEventListener('click', () => go(1));
    $('#prev').addEventListener('click', () => go(-1));
    $('#menu-btn').addEventListener('click', openTopics);
    $('#topics-close').addEventListener('click', closeTopics);
    $('#topics').addEventListener('click', (e) => { if (e.target.id === 'topics') closeTopics(); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#topics').hidden) closeTopics(); });

    /* Resume: restore the learner's language and progress; the start button becomes "continue". */
    const saved = !STILL && window.SCO ? window.SCO.load() : null;
    let savedScreen = null;
    if (saved && saved.v === 2) {
      lang = saved.lang === 'ar' ? 'ar' : 'en';
      (saved.visited || []).forEach((id) => visited.add(id));
      ORDER.forEach((id) => { const m = mods[id]; if (m && m.setState && saved.slides && saved.slides[id]) m.setState(saved.slides[id]); });
      savedScreen = saved.screen; savedAny = visited.size > 0;
    }
    if (q.get('lang') === 'ar') lang = 'ar';
    if (q.get('lang') === 'en') lang = 'en';
    fit(); render();
    show(q.get('screen') || 'welcome');
    addEventListener('pagehide', () => { if (window.SCO) window.SCO.finish(isComplete()); });
    if ((window.SCO && window.SCO.inLMS()) || STILL) $('.review').style.display = 'none';
    /* Review links: ?still=1 skips motion and narration; slide modules read their own extra parameters. */
    if (STILL && G) setTimeout(() => G.globalTimeline.getChildren().forEach((tw) => tw.progress(1)), 50);
  });
})();
