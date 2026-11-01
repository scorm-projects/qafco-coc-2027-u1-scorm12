/* Slide 6 — Knowledge Check: five questions, one at a time, with four radio options each.
   Every learner-facing string comes from content/u1.*.json (slide-6 → knowledge_check), word for word.
   Behaviour follows knowledge_check.scoring_and_retry and narration.extra.per_question:
     EN  question MP3, then each option MP3 a→d; the options stay locked until that narration ends.
     AR  only the question MP3 plays and the options are never locked (as in the Arabic original).
   A wrong answer shows the incorrect feedback and "Try Again" (clears the choice, unlimited retries);
   a correct one adds 1 to the score and shows "Next Question" (or "View Results" on question 5).
   Leaving and coming back restarts at question 1 unless the check is complete; then the results show.
   Review links: ?screen=s6&q=N (question N) &fb=correct|wrong (that feedback on question N) &results=1. */
(function () {
  'use strict';
  const { $, $$, G, reduce, STILL, ic, fillIcons, esc } = QX;

  /* The only new copy on this slide: the navigation-bar hint while the check is open. */
  const HINT = {
    en: { ask: 'Answer each question correctly to continue', locked: 'Listen to the question and its answers first' },
    ar: { ask: 'أجب عن كل سؤال إجابةً صحيحة للمتابعة', locked: 'استمع إلى السؤال أولًا' }
  };
  /* The torn photo on the side panel changes with each question (the plant from the air, the greenhouse for sustainability). */
  const PHOTO = [
    { src: 'qafco-aerial', pos: '50% 55%' }, { src: 'qafco-aerial', pos: '18% 70%' }, { src: 'qafco-aerial', pos: '82% 45%' },
    { src: 'greenhouse', pos: '50% 50%' }, { src: 'qafco-aerial', pos: '62% 85%' }
  ];
  const TOTAL = 5;

  const K = () => QX.content('slide-6').knowledge_check || {};
  const SR = () => K().screen_reader_only || {};
  const Q = () => (K().questions || [])[cur] || { options: [] };
  const isAr = () => QX.lang() === 'ar';
  const anim = () => !!G && !reduce && !STILL;
  const dirX = () => (isAr() ? -1 : 1);

  let sec = null, cur = 0, phase = 'ask', sel = null, score = 0, complete = false, wasRight = false;
  let locked = false, speaking = false, narrId = 0, paramsUsed = false;

  /* ── Markup ── */
  function build(s) {
    sec = s;
    s.innerHTML =
      '<div class="kc" id="kc">' +
        '<div class="kc-main">' +
          '<div class="kc-head" id="kc-head">' +
            '<div class="kc-meta"><span class="chip kc-count">' + ic('Question-duotone') + '<span id="kc-count"></span></span>' +
            '<span class="kc-pips" aria-hidden="true">' + '<i></i>'.repeat(TOTAL) + '</span></div>' +
            '<h1 class="label kc-title" id="kc-title"></h1>' +
          '</div>' +
          '<div class="kc-ask" id="kc-ask">' +
            '<p class="kc-qtext" id="kc-qtext"></p>' +
            '<fieldset class="kc-opts" id="kc-opts"><legend class="kc-sr" id="kc-legend"></legend><div class="kc-list" id="kc-list"></div></fieldset>' +
            '<div class="kc-actions">' +
              '<button type="button" class="cta kc-submit" id="kc-submit" disabled><span id="kc-submit-t"></span>' + ic('ArrowRight-bold') + '</button>' +
              '<span class="kc-listen" id="kc-listen" aria-hidden="true"><span class="eq"><span></span><span></span><span></span><span></span></span>' +
                ic('SpeakerHigh-bold', 'kc-spk') + ic('LockSimple-bold', 'kc-lockic') + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="kc-res" id="kc-res" hidden>' +
            '<span class="tape kc-res__tape"></span>' +
            '<span class="kc-res__leaf">' + ic('Trophy-duotone') + '</span>' +
            '<h2 class="label kc-res__title" id="kc-res-title" tabindex="-1"></h2>' +
            '<p class="kc-res__score" id="kc-res-score"></p>' +
            '<div class="kc-res__bar" aria-hidden="true">' + ('<i>' + ic('Check-bold') + '</i>').repeat(TOTAL) + '</div>' +
            '<p class="kc-res__unit">' + ic('Leaf-bold') + '<span id="kc-res-unit"></span></p>' +
            '<button type="button" class="cta kc-home" id="kc-home">' + ic('House-bold', 'kc-house') + '<span id="kc-home-t"></span></button>' +
          '</div>' +
        '</div>' +
        '<aside class="kc-side" id="kc-side">' +
          '<div class="kc-art" aria-hidden="true">' +
            '<div class="halftone kc-ht"></div>' +
            '<div class="grid kc-grid"></div>' +
            '<div class="torn kc-photo" data-seed="61"><span class="tape kc-photo__tape"></span><img id="kc-photo" src="assets/plant/qafco-aerial.webp" alt="" /><span class="tint"></span></div>' +
            '<svg class="leafshape kc-leaf" data-leaf="green" viewBox="0 0 300 320"></svg>' +
            '<img class="sticker--warm kc-tower" src="assets/plant/twin-columns.webp" alt="" />' +
            '<img class="sticker kc-person" src="assets/people/maryam-front.webp" alt="" />' +
          '</div>' +
          '<span class="kc-badge"><span class="kc-badge__dot"></span><span id="kc-badge"></span></span>' +
          '<div class="kc-fbwrap"><div class="kc-fb" id="kc-fb" hidden>' +
            '<span class="tape kc-fb__tape"></span>' +
            '<div class="kc-fb__top"><span class="kc-fb__ic" id="kc-fb-ic"></span>' +
              '<div><p class="kc-fb__title" id="kc-fb-title"></p><p class="kc-fb__sub" id="kc-fb-sub"></p></div></div>' +
            '<p class="kc-fb__text" id="kc-fb-text"></p>' +
            '<button type="button" class="cta kc-fb__btn" id="kc-fb-btn"></button>' +
          '</div></div>' +
        '</aside>' +
        '<div class="kc-sr" aria-live="polite" id="kc-live"></div>' +
        '<div class="kc-sr" aria-live="assertive" id="kc-alert"></div>' +
      '</div>';

    const list = $('#kc-list');
    list.addEventListener('click', (e) => {
      const inp = e.target.closest('input'); if (!inp) return;
      if (phase !== 'ask' || locked) {
        e.preventDefault();
        if (locked) {
          say(SR().locked_announcement);
          const lbl = inp.closest('.kc-opt');
          if (G && !reduce) G.fromTo(lbl, { x: -6 * dirX() }, { x: 0, duration: .5, ease: 'elastic.out(1, .35)', clearProps: 'transform' });
        }
      }
    });
    list.addEventListener('change', (e) => {
      const inp = e.target.closest('input'); if (!inp || phase !== 'ask' || locked) return;
      sel = inp.value; markOpts(); setLockUI();
    });
    $('#kc-submit').addEventListener('click', submit);
    $('#kc-fb-btn').addEventListener('click', () => { if (!wasRight) retry(); else if (cur >= TOTAL - 1) finish(); else nextQ(); });
    $('#kc-home').addEventListener('click', () => QX.show('welcome'));
  }

  /* ── Announcements for screen readers ── */
  function say(text, urgent) {
    if (!text) return;
    const el = $(urgent ? '#kc-alert' : '#kc-live');
    el.textContent = '';
    setTimeout(() => { el.textContent = text; }, 60);
  }

  /* ── Drawing ── */
  function statics() {
    const k = K(), r = k.results || {};
    $('#kc-title').textContent = k.header_label || '';
    $('#kc-legend').textContent = SR().legend || '';
    $('#kc-submit-t').textContent = k.submit_label || '';
    $('#kc-badge').textContent = k.photo_badge || '';
    $('#kc-res-title').textContent = r.title || '';
    $('#kc-res-unit').textContent = r.unit_line || '';
    $('#kc-home-t').textContent = r.button || '';
  }
  function drawQuestion() {
    const q = Q();
    $('#kc').classList.remove('is-results');
    $('#kc-ask').hidden = false; $('#kc-res').hidden = true; $('#kc-head').hidden = false;
    $('#kc-count').textContent = QX.num(cur) + ' / ' + QX.num(TOTAL - 1);
    pips();
    $('#kc-qtext').textContent = q.text || '';
    $('#kc-list').innerHTML = q.options.map((o) =>
      '<label class="kc-opt" data-id="' + esc(o.id) + '">' +
        '<input type="radio" name="kc-answer" value="' + esc(o.id) + '" />' +
        '<span class="kc-opt__mark" aria-hidden="true"><i class="kc-dot"></i>' + ic('Check-bold', 'kc-ok') + ic('X-bold', 'kc-no') + ic('LockSimple-bold', 'kc-lk') + '</span>' +
        '<span class="kc-opt__text">' + esc(o.text) + '</span></label>').join('');
    const ph = PHOTO[cur] || PHOTO[0], img = $('#kc-photo');
    if (!img.src.endsWith(ph.src + '.webp')) img.src = 'assets/plant/' + ph.src + '.webp';
    img.style.objectPosition = ph.pos;
    markOpts();
    if (phase === 'fb') drawFb(); else { $('#kc-fb').hidden = true; $('#kc-side').classList.remove('is-fb'); }
    setLockUI();
    fillIcons(sec);
  }
  function pips() {
    $$('#kc .kc-pips i').forEach((p, i) => { p.className = i < cur || (i === cur && phase === 'fb' && wasRight) ? 'is-done' : i === cur ? 'is-now' : ''; });
  }
  function markOpts() {
    $$('#kc-list .kc-opt').forEach((l) => {
      const picked = l.dataset.id === sel;
      l.classList.toggle('is-picked', picked && phase === 'ask');
      l.classList.toggle('is-right', picked && phase === 'fb' && wasRight);
      l.classList.toggle('is-wrong', picked && phase === 'fb' && !wasRight);
      l.classList.toggle('is-dim', !picked && phase === 'fb');
      $('input', l).checked = picked;
    });
    $('#kc').classList.toggle('is-fb', phase === 'fb');
  }
  function setLockUI() {
    const off = locked || phase !== 'ask';
    $('#kc').classList.toggle('is-locked', locked);
    $('#kc-opts').setAttribute('aria-busy', String(locked));
    $('#kc-listen').classList.toggle('is-speaking', speaking);
    $('#kc-listen').classList.toggle('is-lock', locked);
    $$('#kc-list .kc-opt, #kc-list input').forEach((el) => el.setAttribute('aria-disabled', String(off)));
    $('#kc-submit').disabled = !(sel && !off);
  }
  function fbOption() { return Q().options.find((o) => o.id === sel) || {}; }
  function drawFb() {
    const fbp = K().feedback_panel || {}, o = fbOption(), last = cur >= TOTAL - 1;
    const fb = $('#kc-fb');
    fb.classList.toggle('kc-fb--ok', wasRight); fb.classList.toggle('kc-fb--no', !wasRight);
    $('#kc-fb-ic').innerHTML = ic(wasRight ? 'CheckCircle-bold' : 'XCircle-bold');
    $('#kc-fb-title').textContent = wasRight ? fbp.title_correct : fbp.title_incorrect;
    const sub = wasRight ? fbp.subtitle_correct : fbp.subtitle_incorrect, subEl = $('#kc-fb-sub');
    subEl.textContent = sub || ''; subEl.hidden = !sub;
    $('#kc-fb-text').textContent = o.feedback || '';
    const label = wasRight ? (last ? fbp.button_correct_last_question : fbp.button_correct) : fbp.button_incorrect;
    const btn = $('#kc-fb-btn');
    btn.className = 'cta kc-fb__btn' + (wasRight ? (last ? ' kc-fb__btn--last' : ' kc-fb__btn--fwd') : ' kc-fb__btn--retry');
    btn.innerHTML = !wasRight ? ic('ArrowCounterClockwise-bold') + '<span>' + esc(label) + '</span>'
      : last ? ic('Trophy-bold') + '<span>' + esc(label) + '</span>' : '<span>' + esc(label) + '</span>' + ic('ArrowRight-bold');
    fb.hidden = false;
    $('#kc-side').classList.add('is-fb');
    fillIcons(fb);
  }
  function drawResults() {
    const r = K().results || {};
    $('#kc').classList.add('is-results');
    $('#kc').classList.remove('is-fb', 'is-locked');
    $('#kc-ask').hidden = true; $('#kc-head').hidden = true; $('#kc-res').hidden = false;
    $('#kc-fb').hidden = true; $('#kc-side').classList.remove('is-fb');
    const fill = (s) => String(s || '').replace('{score}', QX.dig(score)).replace('{total}', QX.dig(TOTAL));
    const tpl = r.score_line_template || '', bold = r.score_line_bold_part || '';
    const i = bold ? tpl.indexOf(bold) : -1;
    $('#kc-res-score').innerHTML = i < 0 ? esc(fill(tpl))
      : esc(fill(tpl.slice(0, i))) + '<b>' + esc(fill(bold)) + '</b>' + esc(fill(tpl.slice(i + bold.length)));
    $$('#kc .kc-res__bar i').forEach((p, k) => p.classList.toggle('is-on', k < score));
    fillIcons(sec);
  }
  function draw() { if (phase === 'results') drawResults(); else drawQuestion(); }

  /* ── Motion ── */
  function questionIn() {
    if (!anim()) return;
    const d = dirX();
    const tl = G.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('#kc-qtext', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .6, clearProps: 'transform,opacity' })
      .fromTo($$('#kc-list .kc-opt'), { x: -28 * d, opacity: 0 }, { x: 0, opacity: 1, duration: .55, stagger: .08, clearProps: 'transform,opacity' }, .15)
      .fromTo('#kc .kc-actions', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .5, clearProps: 'transform,opacity' }, .45)
      .fromTo('#kc .kc-photo', { opacity: 0, y: -24, rotation: 7 * d }, { opacity: 1, y: 0, rotation: 2 * d, duration: .9, ease: 'back.out(1.3)', clearProps: 'opacity' }, 0);
  }
  function fbIn() {
    if (!anim()) return;
    const fb = $('#kc-fb'), d = dirX();
    G.killTweensOf(fb);
    G.fromTo(fb, { x: 110 * d, opacity: 0, rotation: 2.5 * d }, { x: 0, opacity: 1, rotation: 0, duration: .65, ease: 'power3.out', clearProps: 'transform,opacity' });
    G.fromTo('#kc-fb-ic', { scale: .3, rotation: -25 * d }, { scale: 1, rotation: 0, duration: .7, delay: .25, ease: 'back.out(2.2)', clearProps: 'transform' });
    G.fromTo($$('.kc-fb__title, .kc-fb__sub, .kc-fb__text, .kc-fb__btn', fb), { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .45, delay: .3, stagger: .07, ease: 'power2.out', clearProps: 'transform,opacity' });
  }
  function fbOut() {
    const fb = $('#kc-fb'), side = $('#kc-side');
    const end = () => { fb.hidden = true; side.classList.remove('is-fb'); };
    if (!anim() || fb.hidden) return end();
    G.killTweensOf(fb);
    side.classList.remove('is-fb');
    G.to(fb, { x: 80 * dirX(), opacity: 0, duration: .35, ease: 'power2.in', onComplete: () => { G.set(fb, { clearProps: 'transform,opacity' }); if (phase !== 'fb') end(); } });
  }
  function resultsIn() {
    if (!anim()) return;
    const d = dirX(), tl = G.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('#kc-res', { y: 50, opacity: 0, rotation: -1.2 * d }, { y: 0, opacity: 1, rotation: 0, duration: .9, clearProps: 'transform,opacity' })
      .fromTo('#kc .kc-res__leaf', { scale: .2, rotation: -40 * d }, { scale: 1, rotation: 0, duration: .9, ease: 'back.out(2)', clearProps: 'transform' }, .3)
      .fromTo('#kc .kc-res__title', { x: -40 * d, opacity: 0 }, { x: 0, opacity: 1, duration: .7, clearProps: 'transform,opacity' }, .35)
      .fromTo('#kc .kc-res__score', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .6, clearProps: 'transform,opacity' }, .55)
      .fromTo('#kc .kc-res__score b', { scale: .6 }, { scale: 1, duration: .8, ease: 'back.out(2.4)', clearProps: 'transform' }, .7)
      .fromTo($$('#kc .kc-res__bar i'), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: .5, stagger: .1, ease: 'back.out(2.6)', clearProps: 'transform,opacity' }, .8)
      .fromTo($$('#kc .kc-res__unit, #kc .kc-home'), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .5, stagger: .1, clearProps: 'transform,opacity' }, 1.2);
  }

  /* ── Narration and the answer lock ── */
  function narrate() {
    const q = Q(), id = ++narrId;
    const end = () => { if (id !== narrId) return; locked = false; speaking = false; setLockUI(); QX.changed(); };
    if (isAr()) { /* Arabic: question only, answers open straight away */
      locked = false; speaking = !STILL; setLockUI();
      QX.speak(q.audio || [], end);
      return;
    }
    const files = (q.audio || []).concat(...q.options.map((o) => o.audio || []));
    locked = true; speaking = !STILL; setLockUI(); QX.changed();
    say(SR().locked_announcement);
    QX.speak(files, end);
  }
  function quiet() { narrId++; QX.stopVoice(); locked = false; speaking = false; if (sec) setLockUI(); }

  /* ── Flow ── */
  function startQuestion(i, withVoice) {
    cur = i; phase = 'ask'; sel = null; wasRight = false;
    quiet(); drawQuestion(); questionIn();
    if (withVoice) narrate();
    QX.changed();
  }
  function submit() {
    if (phase !== 'ask' || !sel || locked) return;
    const o = fbOption();
    quiet();
    wasRight = !!o.correct;
    if (wasRight) score++;
    phase = 'fb';
    markOpts(); setLockUI(); pips(); drawFb(); fbIn();
    const fbp = K().feedback_panel || {};
    say([wasRight ? fbp.title_correct : fbp.title_incorrect, wasRight ? fbp.subtitle_correct : fbp.subtitle_incorrect, o.feedback].filter(Boolean).join(' '));
    setTimeout(() => { if (phase === 'fb') $('#kc-fb-btn').focus({ preventScroll: true }); }, anim() ? 450 : 0);
    QX.changed();
  }
  function retry() {
    phase = 'ask'; sel = null; wasRight = false;
    markOpts(); setLockUI(); pips();
    fbOut();
    say(SR().retry_announcement, true);
    if (anim()) G.fromTo('#kc-qtext', { x: -8 * dirX() }, { x: 0, duration: .5, ease: 'elastic.out(1, .5)', clearProps: 'transform' });
    const first = $('#kc-list input'); if (first) first.focus({ preventScroll: true });
    QX.changed();
  }
  function nextQ() {
    const go = () => { startQuestion(cur + 1, true); const f = $('#kc-list input'); if (f) f.focus({ preventScroll: true }); };
    if (!anim()) return go();
    fbOut();
    G.to($$('#kc-qtext, #kc-list .kc-opt, #kc .kc-actions'), { opacity: 0, y: -10, duration: .25, stagger: .03, onComplete: go });
  }
  function finish() {
    quiet();
    complete = true; phase = 'results';
    const show = () => {
      drawResults(); resultsIn();
      say((K().results || {}).title + ' ' + $('#kc-res-score').textContent);
      $('#kc-res-title').focus({ preventScroll: true });
      QX.changed();
    };
    if (!anim()) return show();
    fbOut();
    G.to('#kc-ask, #kc-head', { opacity: 0, y: -16, duration: .3, onComplete: () => { G.set('#kc-ask, #kc-head', { clearProps: 'transform,opacity' }); show(); } });
  }

  /* Review links: &q=N, &fb=correct|wrong, &results=1 (first entry only). */
  function applyParams() {
    const p = new URLSearchParams(location.search);
    if (p.get('results')) { complete = true; score = TOTAL; phase = 'results'; quiet(); drawResults(); return true; }
    if (!p.get('q') && !p.get('fb')) return false;
    const n = Math.min(TOTAL, Math.max(1, parseInt(p.get('q'), 10) || 1)), f = p.get('fb');
    score = n - 1;
    startQuestion(n - 1, !f);
    if (f === 'correct' || f === 'wrong') {
      const o = Q().options.find((x) => (f === 'correct') === !!x.correct);
      if (o) { sel = o.id; submit(); }
    }
    return true;
  }

  QX.register('s6', {
    title: () => QX.content('slide-6').nav_title,
    build,
    render() { statics(); draw(); },
    enter(resume, o = {}) {
      if (o.lang) { /* same place, new language: re-narrate an open question, keep feedback or results */
        if (phase === 'ask') startQuestion(cur, true); else draw();
        return;
      }
      if (!paramsUsed) { paramsUsed = true; if (applyParams()) { QX.changed(); return; } }
      if (complete) { phase = 'results'; quiet(); drawResults(); resultsIn(); QX.changed(); return; }
      score = 0;
      startQuestion(0, true);
    },
    leave() {
      quiet();
      if (G) { const els = $$('#kc *'); G.killTweensOf(els); G.set(els.filter((el) => el.style.opacity || el.style.transform), { clearProps: 'transform,opacity' }); }
      $$('#kc .torn').forEach((el) => { el.style.transform = ''; });
    },
    canNext: () => complete,
    hint() {
      if (complete) return QX.T().hintDone;
      const h = HINT[QX.lang()] || HINT.en;
      return locked ? h.locked : h.ask;
    },
    done: () => complete,
    getState: () => ({ complete, score: complete ? score : 0 }),
    setState(s) { complete = !!(s && s.complete); score = complete ? (s.score | 0) || TOTAL : 0; if (complete) phase = 'results'; }
  });
})();
