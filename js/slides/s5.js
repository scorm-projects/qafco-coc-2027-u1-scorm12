/* Slide 5 — QAFCO Ethics & Insider Trading Rules: seven topic tabs that unlock in order. Each tab's
   panel is laid out from the slide-5 content blocks (in their original order) and split into pages
   that fit the fixed stage; the page follows the narration, and the learner can still flip by hand.
   Review links: ?screen=s5&still=1 [&lang=ar] [&tab=N (1-7, all tabs unlocked)] [&page=P (1-based)]. */
(function () {
  'use strict';
  const { $, $$, G, reduce, STILL, ic, fillIcons, speak, voice, esc } = QX;

  /* Microcopy for the navigation bar and page controls (the only text not taken from the content). */
  const T = {
    en: {
      hint: (n) => n === 1 ? 'Listen to the last topic to continue' : 'Listen to the remaining ' + n + ' topics to continue',
      hintNow: 'Listen to the end of this topic to unlock the next one',
      locked: 'Finish the previous topic first', prevPage: 'Previous page', nextPage: 'Next page',
      page: (a, b) => 'Page ' + a + ' of ' + b
    },
    ar: {
      hint: (n) => n === 1 ? 'استمع إلى الموضوع الأخير للمتابعة' : 'استمع إلى الموضوعات المتبقية (' + QX.dig(n) + ') للمتابعة',
      hintNow: 'استمع إلى هذا الموضوع حتى نهايته لفتح الموضوع التالي',
      locked: 'أكمل الموضوع السابق أولًا', prevPage: 'الصفحة السابقة', nextPage: 'الصفحة التالية',
      page: (a, b) => 'الصفحة ' + QX.dig(a) + ' من ' + QX.dig(b)
    }
  };
  const t = () => T[QX.lang()];
  const C = () => QX.content('slide-5');
  const items = () => C().items || [];

  /* ── Brand visuals that replace the original neon illustrations ── */
  const TAB_ART = [
    { icon: 'HandCoins', col: '#02833D' },
    { icon: 'IdentificationCard', col: '#00A9C4' },
    { icon: 'Megaphone', col: '#0A5675' },
    { icon: 'Gift', col: '#02833D' },
    { icon: 'Receipt', col: '#00A9C4' },
    { icon: 'ArrowsSplit', col: '#0A5675' },
    { icon: 'ChartLineUp', col: '#02833D' }
  ];
  const FIG_ICON = {
    '01-government-officials.png': 'Bank', '02-private-companies.png': 'Buildings', '03-business-partners.png': 'Handshake',
    '05-report-bribe.png': 'Flag', '06-report-honest-records.png': 'Notebook',
    '08-reject-offer.png': 'HandPalm', '09-disciplinary-action.png': 'Gavel',
    '10-ownership.png': 'Key', '11-acting-as-agent.png': 'UserSwitch', '12-conflicting-business.png': 'Briefcase'
  };
  const FIG_COL = ['#02833D', '#00A9C4', '#0A5675'];
  /* Collage scenes for the two full illustrations (a 320×240 box; x is from the inline start). */
  const SCENE = {
    '04-facilitation-payments.png': [
      { k: 'grid', x: 0, y: 46, w: 170, h: 150, r: -4 },
      { k: 'torn', src: 'plant/doha.jpg', x: 120, y: 6, w: 196, h: 150, r: 3, tint: 'rgba(0,169,196,.32)' },
      { k: 'badge', icon: 'IdentificationCard', col: '#0A5675', x: 22, y: 92 },
      { k: 'badge', icon: 'Coins', col: '#EFD34F', dark: true, x: 118, y: 150 },
      { k: 'stamp', icon: 'Prohibit', x: 214, y: 128 }
    ],
    '07-gifts-entertainment.png': [
      { k: 'ht', x: 168, y: 0, w: 150, h: 150 },
      { k: 'grid', x: 0, y: 70, w: 190, h: 150, r: 3 },
      { k: 'person', src: 'people/maryam-three.webp', x: 196, y: 0, h: 240 },
      { k: 'badge', icon: 'Gift', col: '#02833D', x: 26, y: 14, big: true },
      { k: 'badge', icon: 'Ticket', col: '#00A9C4', x: 120, y: 118 },
      { k: 'badge', icon: 'ForkKnife', col: '#0A5675', x: 30, y: 150 }
    ]
  };
  const HEAD_ICON = { insider: ['UserFocus', 'ClipboardText', 'LockKey', 'UsersThree'], conflict: ['Info'], gifts: ['Question'] };
  const TONE = {
    acceptable: { icon: 'CheckCircle', cls: 'ok' }, compliant: { icon: 'CheckCircle', cls: 'ok' },
    approval: { icon: 'Stamp', cls: 'warn' }, prohibited: { icon: 'Prohibit', cls: 'no' }
  };

  /* ── Narration sync ──
     English: one file per tab; the time (s) at which the narrator reaches each block, from whisper.cpp
     word timings ([time, block index]). Arabic: several files per tab; the block each file reads, in
     the order of the tab's audio list. Blocks the narration never reads (the examples) are left to the learner. */
  const SYNC = {
    en: [
      [[0, 0], [15.3, 1], [19.7, 2]],
      [[0, 0], [14.3, 2]],
      [[0, 0], [9.5, 1], [16.2, 2]],
      [[0, 0], [20.3, 2], [29.3, 3], [56.3, 5]],
      [[0, 0], [10.4, 1], [12.6, 2]],
      [[0, 0], [24.2, 1], [53.7, 3]],
      [[0, 0], [9.2, 1], [14.9, 3], [26.4, 5], [37.7, 7], [46.6, 9]]
    ],
    ar: [
      [0, 0, 1, 2, 2, 2, 3, 3],
      [0, 0, 2, 2],
      [0, 0, 1, 1, 2, 2],
      [0, 0, 2, 2, 3, 4, 4, 4, 4, 4, 4, 5, 5],
      [0, 0, 1, 2],
      [0, 0, 1, 2, 2, 2, 4, 4],
      [0, 0, 1, 2, 3, 4, 4, 4, 4, 5, 6, 6, 6, 7, 8, 8, 8, 9, 9]
    ]
  };

  /* ── State ── */
  const done = new Set();
  let cur = 0, page = 0, pages = 1, introDone = false, speaking = -1, reviewAll = false;
  let units = [], unitOfBlock = [], autoPage = 0, dirty = true, wantPage = -1;
  const q = new URLSearchParams(location.search);

  const unlocked = (i) => reviewAll || i === 0 || done.has(i - 1) || done.has(i);
  const segs = (b) => b.segments ? b.segments.map((s) => s.bold ? '<b>' + esc(s.text) + '</b>' : esc(s.text)).join('') : esc(b.text);
  const tabParts = (label) => { const k = label.indexOf(' · '); return k < 0 ? ['', label] : [label.slice(0, k), label.slice(k + 3)]; };

  /* ══ Block markup ══ */
  function sceneHTML(src) {
    const els = SCENE[src] || [];
    return '<div class="u-art" aria-hidden="true"><div class="u-art__box">' + els.map((e) => {
      const pos = 'inset-inline-start:' + e.x + 'px;top:' + e.y + 'px;' + (e.w ? 'width:' + e.w + 'px;height:' + e.h + 'px;' : '') + (e.r ? '--r:' + e.r + 'deg;' : '');
      if (e.k === 'grid') return '<span class="grid a-bit" style="' + pos + '"></span>';
      if (e.k === 'ht') return '<span class="halftone a-bit" style="' + pos + '"></span>';
      if (e.k === 'torn') return '<span class="torn a-bit" data-seed="' + e.x + '" style="' + pos + '"><img src="assets/' + e.src + '" alt="" /><span class="tint" style="background:' + e.tint + '"></span></span>';
      if (e.k === 'person') return '<img class="sticker a-bit u-art__person" src="assets/' + e.src + '" alt="" style="' + pos + 'height:' + e.h + 'px" />';
      if (e.k === 'stamp') return '<span class="u-stamp a-bit" style="' + pos + '">' + ic(e.icon + '-bold') + '</span>';
      return '<span class="u-badge a-bit' + (e.big ? ' u-badge--big' : '') + '" style="' + pos + 'background:' + e.col + (e.dark ? ';color:var(--ink)' : '') + '">' + ic(e.icon + '-duotone') + '</span>';
    }).join('') + '</div></div>';
  }
  function listHTML(b, key) {
    if (b.style === 'inline-icon-list') return '<ul class="u-qs">' + b.items.map((x) => '<li>' + ic('Question-duotone') + '<span>' + esc(x) + '</span></li>').join('') + '</ul>';
    const icon = b.items.length === 1 && key !== 'insider' ? 'Lightbulb-duotone' : 'CheckCircle-duotone';
    return '<ul class="u-ticks' + (b.items.length === 1 ? ' u-ticks--one' : '') + '">' + b.items.map((x) => '<li>' + ic(icon) + '<span>' + esc(x) + '</span></li>').join('') + '</ul>';
  }
  function blockHTML(b, key, hIdx) {
    switch (b.type) {
      case 'paragraph': return '<p class="u-p">' + segs(b) + '</p>';
      case 'heading': {
        const icons = HEAD_ICON[key] || [], icn = icons[hIdx] || icons[0];
        return '<h4 class="u-h">' + (icn ? ic(icn + '-duotone') : '') + '<span>' + esc(b.text) + '</span></h4>';
      }
      case 'figures': {
        const labeled = b.figures.some((f) => f.caption_title);
        return '<div class="u-figs' + (labeled ? ' u-figs--labeled' : '') + (b.figures.length === 1 ? ' u-figs--one' : '') + '" style="--n:' + b.figures.length + '">' + b.figures.map((f, k) => {
          const name = (f.image && f.image.src || '').split('/').pop();
          return '<figure class="u-fig"><span class="u-fig__leaf" style="background:' + FIG_COL[k % 3] + '">' + ic((FIG_ICON[name] || 'Info') + '-duotone') + '</span>' +
            (labeled ? '<figcaption><b>' + esc(f.caption_title) + '</b><span>' + esc(f.caption_body) + '</span></figcaption>' : '<figcaption>' + esc(f.caption) + '</figcaption>') + '</figure>';
        }).join('') + '</div>';
      }
      case 'image': return sceneHTML((b.image && b.image.src || '').split('/').pop());
      case 'callout': return '<div class="u-call u-call--' + esc(b.tone) + '"><span class="u-call__i">' + ic((b.tone === 'danger' ? 'Warning' : 'Info') + '-duotone') + '</span><div><b class="u-call__t">' + esc(b.title) + '</b><p>' + esc(b.body) + '</p></div></div>';
      case 'amount_callout': return '<div class="u-amount"><span class="u-amount__tag"><i>' + ic('Coins-duotone') + '</i><b>' + esc(b.amount) + '</b></span><p>' + segs(b) + '</p></div>';
      case 'note_callout': return '<div class="u-note"><span class="u-note__i">' + ic('HandHeart-duotone') + '</span><div><span class="chip">' + esc(b.label) + '</span><p>' + segs(b) + '</p></div></div>';
      case 'list': return listHTML(b, key);
      default: return '';
    }
  }
  function exHTML(x) {
    return '<article class="u-ex"><span class="chip u-ex__tag">' + esc(x.tag) + '</span><p class="u-ex__s">' + esc(x.scenario) + '</p>' +
      '<div class="u-ex__r"><b>' + ic('Lightbulb-duotone') + '<span>' + esc(x.rationale_label) + '</span></b><p>' + esc(x.rationale) + '</p></div></article>';
  }
  /* One examples section; with `only` it is one example of it (the heading goes with the first). */
  function sectionHTML(s, only) {
    const tn = TONE[s.tone] || TONE.acceptable, list = only == null ? s.examples : [s.examples[only]];
    return '<div class="u-sec u-sec--' + tn.cls + '">' + (only ? '' : '<h4 class="u-sec__h">' + ic(tn.icon + '-duotone') + '<span>' + esc(s.heading) + '</span></h4>') +
      '<div class="u-exs" style="--n:' + Math.min(2, list.length) + '">' + list.map(exHTML).join('') + '</div></div>';
  }

  /* Blocks → layout units (the pieces a page is packed from), keeping the block order:
     a heading stays with what follows it, a paragraph sits beside the illustration after it,
     two heading+list pairs in a row share a line, and each examples section is its own unit. */
  function buildUnits(it, split) {
    const B = it.blocks || [], out = [];
    let h = 0;
    const isPair = (i) => B[i] && B[i].type === 'heading' && B[i + 1] && B[i + 1].type === 'list';
    for (let i = 0; i < B.length; i++) {
      const b = B[i], u = { blocks: [i], html: '' };
      if (b.type === 'paragraph' && B[i + 1] && B[i + 1].type === 'image') {
        u.html = '<div class="u-pair"><div class="u-pair__text">' + blockHTML(b, it.key) + '</div>' + blockHTML(B[i + 1], it.key) + '</div>';
        u.blocks.push(++i);
      } else if (isPair(i) && isPair(i + 2)) {
        u.html = '<div class="u-duo"><div class="u-duo__col">' + blockHTML(B[i], it.key, h++) + blockHTML(B[i + 1], it.key) + '</div>' +
          '<div class="u-duo__col">' + blockHTML(B[i + 2], it.key, h++) + blockHTML(B[i + 3], it.key) + '</div></div>';
        u.blocks.push(i + 1, i + 2, i + 3); i += 3;
      } else if (b.type === 'heading' && B[i + 1] && B[i + 1].type !== 'examples') {
        u.html = blockHTML(b, it.key, h++) + blockHTML(B[i + 1], it.key);
        u.blocks.push(++i);
      } else if (b.type === 'examples') {
        b.sections.forEach((s, k) => {
          const key = i + '.' + k, blocks = k ? [] : [i];
          if (split.has(key)) s.examples.forEach((x, e) => out.push({ blocks: e ? [] : blocks, html: sectionHTML(s, e) }));
          else out.push({ blocks, html: sectionHTML(s), key, many: s.examples.length > 1 });
        });
        continue;
      } else {
        u.html = blockHTML(b, it.key, b.type === 'heading' ? h++ : 0);
      }
      out.push(u);
    }
    unitOfBlock = [];
    out.forEach((u, k) => u.blocks.forEach((bi) => { if (unitOfBlock[bi] == null) unitOfBlock[bi] = k; }));
    return out;
  }

  /* ══ Tabs and panel ══ */
  function renderTabs() {
    $('#s5-tabs').innerHTML = items().map((it, i) => {
      const [n, label] = tabParts(it.tab_label);
      return '<button type="button" class="s5-tab" role="tab" id="s5-tab-' + i + '" data-i="' + i + '" aria-controls="s5-panel">' +
        '<span class="s5-tab__n" style="--c:' + TAB_ART[i].col + '">' + esc(n) + '</span>' +
        '<span class="s5-tab__l">' + esc(label) + '</span>' +
        '<span class="s5-tab__s"><i class="s5-ic-lock">' + ic('LockSimple-bold') + '</i><i class="s5-ic-done">' + ic('Check-bold') + '</i><i class="s5-ic-play">' + ic('SpeakerHigh-duotone') + '</i>' +
        '<span class="eq"><span></span><span></span><span></span><span></span></span></span></button>';
    }).join('');
    $$('#s5 .s5-tab').forEach((b) => b.addEventListener('click', () => clickTab(+b.dataset.i)));
    tabStates();
  }
  function tabStates() {
    $$('#s5 .s5-tab').forEach((b) => {
      const i = +b.dataset.i, open = unlocked(i);
      b.classList.toggle('is-on', i === cur);
      b.classList.toggle('is-done', done.has(i));
      b.classList.toggle('is-locked', !open);
      b.classList.toggle('is-speaking', i === speaking);
      b.classList.toggle('is-next', open && !done.has(i) && i !== speaking);
      b.setAttribute('aria-selected', String(i === cur));
      b.setAttribute('aria-disabled', String(!open));
      b.title = open ? '' : t().locked;
    });
  }
  function fillPanel() {
    const it = items()[cur]; if (!it) return;
    const art = TAB_ART[cur];
    const lf = $('#s5-leaf'); lf.style.background = art.col; lf.innerHTML = ic(art.icon + '-duotone');
    $('#s5-num').textContent = it.num;
    $('#s5-title').textContent = it.title;
    $('#s5-panel').setAttribute('aria-labelledby', 's5-tab-' + cur);
    split = new Set();
    fillBody();
    fillIcons($('#s5-panel'));
    status();
    dirty = true; paginate();
  }
  let split = new Set();
  function fillBody() {
    units = buildUnits(items()[cur], split);
    $('#s5-body').innerHTML = units.map((u, k) => '<div class="s5-unit" data-u="' + k + '">' + u.html + '</div>').join('');
    QX.drawShapes($('#s5-body'));
    fillIcons($('#s5-body'));
  }
  function status() {
    const on = speaking === cur;
    $('#s5-panel').classList.toggle('is-speaking', on);
    $('#s5-status').textContent = on ? QX.T().playing : done.has(cur) ? QX.T().played : '';
    $('#s5-status-w').hidden = !on && !done.has(cur);
  }

  /* ══ Pages: pack the units into pages that fit the panel body ══ */
  const visible = () => { const s = $('#s5'); return !!s && s.classList.contains('is-on') && s.offsetWidth > 0; };
  /* On a phone the rail and panel sit right under the heading, whatever its height. */
  function layout() {
    const rail = $('#s5 .s5-rail'), panel = $('#s5-panel');
    if (!$('#stage').classList.contains('is-portrait')) { rail.style.top = panel.style.top = ''; return; }
    const top = $('#s5 .s5-top'), y = top.offsetTop + top.offsetHeight + 24;
    rail.style.top = y + 'px';
    panel.style.top = (y + rail.offsetHeight + 24) + 'px';
  }
  function paginate(keep) {
    if (!visible()) { dirty = true; return; }
    layout();
    const body = $('#s5-body');
    let els = $$('.s5-unit', body);
    els.forEach((e) => { e.hidden = false; });
    const H = body.clientHeight, gap = parseFloat(getComputedStyle(body).rowGap) || 0;
    /* an examples section taller than a page is split into one unit per example */
    const tall = els.filter((e) => e.offsetHeight > H && units[+e.dataset.u].many);
    if (tall.length) { tall.forEach((e) => split.add(units[+e.dataset.u].key)); fillBody(); els = $$('.s5-unit', body); }
    let p = 0, acc = 0, over = false;
    els.forEach((e) => {
      const h = e.offsetHeight;
      if (acc > 0 && acc + gap + h > H) { p++; acc = 0; }
      acc += (acc > 0 ? gap : 0) + h;
      if (h > H) over = true;
      units[+e.dataset.u].page = p;
    });
    pages = p + 1;
    $('#s5').dataset.overflow = over ? '1' : '';
    dirty = false;
    showPage(wantPage >= 0 ? wantPage : keep ? Math.min(page, pages - 1) : 0, false);
    if (wantPage >= 0 && (!document.fonts || document.fonts.status === 'loaded')) wantPage = -1;
  }
  function showPage(n, anim, dir) {
    n = Math.max(0, Math.min(pages - 1, n));
    const moved = n !== page;
    page = n;
    const els = $$('#s5-body .s5-unit');
    els.forEach((e) => { e.hidden = units[+e.dataset.u].page !== page; });
    if (anim && moved && G && !reduce && !STILL) {
      const d = (dir || 1) * (QX.lang() === 'ar' ? -1 : 1);
      G.fromTo(els.filter((e) => !e.hidden), { x: 36 * d, opacity: 0 }, { x: 0, opacity: 1, duration: .55, stagger: .07, ease: 'power3.out', clearProps: 'transform,opacity' });
    }
    pager();
  }
  function pager() {
    $('#s5-pager').hidden = pages < 2;
    $('#s5-dots').innerHTML = Array.from({ length: pages }, (_, k) => '<button type="button" class="' + (k === page ? 'on' : '') + '" data-p="' + k + '" aria-label="' + esc(t().page(k + 1, pages)) + '"></button>').join('');
    $$('#s5-dots button').forEach((b) => b.addEventListener('click', () => flip(+b.dataset.p - page)));
    $('#s5-count').textContent = QX.dig(page + 1) + ' / ' + QX.dig(pages);
    $('#s5-pprev').disabled = page === 0;
    $('#s5-pnext').disabled = page >= pages - 1;
    $('#s5-pprev').setAttribute('aria-label', t().prevPage);
    $('#s5-pnext').setAttribute('aria-label', t().nextPage);
    $('#s5-pnext').classList.toggle('is-more', page < pages - 1 && done.has(cur) && speaking !== cur);
  }
  function flip(d) { wantPage = -1; if (d) showPage(page + d, true, Math.sign(d)); }

  /* The page follows the narration: when the narrator reaches a block on another page, turn to it.
     A page turned by hand stays until the narration moves on to a block on a different page. */
  function follow(block) {
    const u = unitOfBlock[block]; if (u == null || !units[u]) return;
    const p = units[u].page;
    if (p !== autoPage) { autoPage = p; if (p !== page) showPage(p, true, p > page ? 1 : -1); }
  }
  function onTime() {
    if (speaking < 0 || speaking !== cur || QX.lang() !== 'en' || QX.current() !== 's5') return;
    const now = voice.currentTime + .3;
    let b = 0; (SYNC.en[cur] || []).forEach(([s, bi]) => { if (now >= s) b = bi; });
    follow(b);
  }
  function onFile() {
    if (speaking < 0 || speaking !== cur || QX.lang() !== 'ar' || QX.current() !== 's5') return;
    const list = items()[cur].audio || [], map = SYNC.ar[cur] || [];
    if (map.length !== list.length) return;
    const k = list.findIndex((f) => new URL(encodeURI(QX.file(f)), location.href).href === voice.src);
    if (k >= 0) follow(map[k]);
  }

  function openTab(i, anim) {
    const dir = i >= cur ? 1 : -1;
    cur = i; page = 0; autoPage = 0;
    fillPanel(); tabStates();
    if (anim && G && !reduce && !STILL) {
      const x = 30 * dir * (QX.lang() === 'ar' ? -1 : 1);
      G.fromTo('#s5-panel .s5-ph > *', { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: .45, stagger: .05, ease: 'power2.out', clearProps: 'transform,opacity' });
      G.fromTo($$('#s5-body .s5-unit').filter((e) => !e.hidden), { x, opacity: 0 }, { x: 0, opacity: 1, duration: .6, stagger: .08, ease: 'power3.out', clearProps: 'transform,opacity' });
      G.from($$('#s5-body .a-bit'), { scale: .6, opacity: 0, duration: .7, stagger: .08, delay: .2, ease: 'back.out(1.7)', clearProps: 'scale,opacity' });
    }
  }
  function clickTab(i) {
    if (!unlocked(i)) {
      QX.nudge();
      const b = $('#s5-tab-' + i);
      if (G && !reduce && b) G.fromTo(b, { x: -5 }, { x: 0, duration: .5, ease: 'elastic.out(1, .3)', clearProps: 'transform' });
      return;
    }
    if (i !== cur) openTab(i, true);
    playTab(i);
  }
  function playTab(i) {
    speaking = i; autoPage = 0;
    if (page !== 0) showPage(0, true, -1);
    tabStates(); status(); pager(); QX.changed();
    speak(items()[i].audio, () => {
      speaking = -1; done.add(i);
      tabStates(); status(); pager(); QX.changed();
    });
  }

  QX.register('s5', {
    title: () => C().nav_title,
    build(sec) {
      sec.innerHTML =
        '<div class="s5-top">' +
          '<div class="s5-head"><div class="chips" id="s5-chips"></div><h1 class="label l-title" id="s5-h1"></h1></div>' +
          '<p class="s5-lead" id="s5-lead"></p>' +
        '</div>' +
        '<span class="halftone s5-ht" aria-hidden="true"></span>' +
        '<div class="s5-rail">' +
          '<h2 class="s5-ptitle">' + ic('Sparkle-duotone') + '<span id="s5-ptitle"></span></h2>' +
          '<div class="s5-tabs" id="s5-tabs" role="tablist"></div>' +
        '</div>' +
        '<div class="s5-panel" id="s5-panel" role="tabpanel">' +
          '<span class="tape s5-panel__tape"></span>' +
          '<div class="s5-ph">' +
            '<span class="tile__leaf s5-leaf" id="s5-leaf"></span>' +
            '<div class="s5-ph__t"><span class="s5-num" id="s5-num"></span><h3 class="s5-title" id="s5-title"></h3></div>' +
            '<div class="s5-pager" id="s5-pager">' +
              '<button type="button" class="s5-pbtn" id="s5-pprev">' + ic('CaretLeft-bold') + '</button>' +
              '<span class="s5-dots" id="s5-dots"></span><span class="s5-count" id="s5-count" aria-hidden="true"></span>' +
              '<button type="button" class="s5-pbtn" id="s5-pnext">' + ic('CaretRight-bold') + '</button>' +
            '</div>' +
          '</div>' +
          '<div class="s5-body" id="s5-body"></div>' +
          '<span class="s5-status" id="s5-status-w"><span class="eq" aria-hidden="true"><span></span><span></span><span></span><span></span></span><span id="s5-status" aria-live="polite"></span></span>' +
        '</div>';
      $('#s5-pprev').addEventListener('click', () => flip(-1));
      $('#s5-pnext').addEventListener('click', () => flip(1));
      voice.addEventListener('timeupdate', onTime);
      voice.addEventListener('playing', onFile);
      addEventListener('keydown', (e) => {
        if (QX.current() !== 's5' || !$('#topics').hidden) return;
        if (e.key === 'PageDown') flip(1);
        if (e.key === 'PageUp') flip(-1);
      });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (visible()) paginate(true); });
    },
    render() {
      const c = C();
      $('#s5-chips').innerHTML = (c.badges || []).map((b) => '<span class="chip">' + ic('BookOpenText-bold') + '<span>' + esc(b) + '</span></span>').join('');
      $('#s5-h1').textContent = c.title || '';
      $('#s5-lead').textContent = c.lead || '';
      $('#s5-ptitle').textContent = c.panel_title || '';
      renderTabs();
      fillPanel();
      fillIcons($('#s5'));
    },
    enter(resume, o) {
      o = o || {};
      if (q.get('tab') && QX.current() === 's5' && !reviewAll) {
        reviewAll = true;
        const i = Math.max(0, Math.min(6, (+q.get('tab') || 1) - 1));
        for (let k = 0; k < i; k++) done.add(k);
        if (q.get('page')) wantPage = Math.max(0, (+q.get('page') || 1) - 1);
        cur = i; fillPanel(); tabStates();
      }
      if (dirty) paginate(true);
      if (document.fonts && document.fonts.status !== 'loaded') document.fonts.ready.then(() => paginate(true));
      if (o.lang || STILL) return;
      if (!introDone) { introDone = true; speak(C().narration && C().narration.on_enter); QX.changed(); }
      if (!G || reduce || resume) return;
      const dir = QX.lang() === 'ar' ? -1 : 1;
      const tl = G.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('#s5 .chips .chip', { y: 12, opacity: 0, duration: .6 })
        .from('#s5-h1', { x: -40 * dir, opacity: 0, duration: .9 }, .1)
        .from('#s5-lead', { y: 16, opacity: 0, duration: .8 }, .3)
        .from('#s5 .s5-ptitle', { y: 10, opacity: 0, duration: .6 }, .4)
        .from('#s5 .s5-tab', { x: -30 * dir, opacity: 0, duration: .6, stagger: .06, clearProps: 'transform,opacity' }, .45)
        .from('#s5-panel', { y: 40, rotate: 1.2 * dir, opacity: 0, duration: 1, clearProps: 'transform,opacity' }, .5)
        .from('#s5 .s5-ht', { scale: .6, opacity: 0, duration: 1 }, .6)
        .from($$('#s5-body .a-bit'), { scale: .6, opacity: 0, duration: .7, stagger: .08, ease: 'back.out(1.7)', clearProps: 'scale,opacity' }, .9);
    },
    leave() { if (speaking >= 0) { speaking = -1; tabStates(); status(); pager(); } },
    resize() { split = new Set(); fillBody(); if (visible()) paginate(true); else dirty = true; },
    canNext: () => done.size >= 7,
    hint() {
      const left = 7 - done.size;
      if (!left) return QX.T().hintDone;
      return speaking >= 0 ? t().hintNow : t().hint(left);
    },
    done: () => done.size >= 7,
    getState: () => ({ done: [...done].sort(), cur, intro: introDone }),
    setState(s) { (s.done || []).forEach((n) => { if (n >= 0 && n < 7) done.add(n); }); cur = Math.max(0, Math.min(6, s.cur | 0)); introDone = !!s.intro; }
  });
})();
