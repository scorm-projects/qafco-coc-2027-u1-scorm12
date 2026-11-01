/* Slide 2 — Employee Responsibilities under the Code: the collage film (it carries the slide's
   opening and closing narration), then five responsibility cards. As in the original, the cards open
   one at a time in order; a card plays its front narration, flips, then plays its back narration. */
(function () {
  'use strict';
  const { $, $$, G, reduce, STILL, ic, esc, speak, stopVoice } = QX;

  const UI = {
    en: { hintScene: 'Watch the animation to continue', hintCards: (n) => n === 1 ? 'Open the remaining card to continue' : 'Open the remaining ' + n + ' cards to continue', locked: 'Opens after the card before it' },
    ar: { hintScene: 'شاهد الفيديو للمتابعة', hintCards: (n) => n === 1 ? 'افتح البطاقة المتبقية للمتابعة' : 'افتح البطاقات المتبقية (' + QX.toAr(n) + ') للمتابعة', locked: 'تُفتح بعد البطاقة السابقة' }
  };
  /* Icons for the original's card icons (tabler → Phosphor) */
  const ICON = { 'tabler-book': 'BookOpen', 'tabler-message-question': 'ChatCircleDots', 'tabler-speakerphone': 'Megaphone', 'tabler-file-search': 'FileMagnifyingGlass', 'tabler-users-group': 'UsersThree' };
  const COL = ['#02833D', '#00A9C4', '#0A5675', '#02833D', '#00A9C4'];

  let sec, ctl, step = 1, active = -1, flipped = new Set();
  const done = new Set();
  const ui = () => UI[QX.lang()];
  const C = () => QX.content('slide-2');

  function blocks(list) {
    return list.map((b) => {
      if (b.type === 'heading') return '<h4 class="fc-h">' + esc(b.text) + '</h4>';
      if (b.type === 'list') return '<ul class="fc-list">' + b.items.map((x) => '<li>' + ic('CheckCircle-duotone') + '<span>' + esc(x) + '</span></li>').join('') + '</ul>';
      if (b.type === 'callout') return '<div class="fc-callout fc-callout--' + esc(b.tone) + '">' + ic('Warning-duotone') + '<div><b>' + esc(b.title) + '</b><p>' + esc(b.body) + '</p></div></div>';
      return '';
    }).join('');
  }
  const unlocked = (i) => i === 0 || done.has(i - 1) || done.has(i);

  function meter() {
    const pm = C().progress_meter, n = done.size, total = C().items.length;
    const label = n === total ? pm.when_all_done : pm.template.replace('{opened}', QX.dig(n)).replace('{total}', QX.dig(total));
    ctl.ring(n, total, label);
  }
  function paint() {
    $$('.fcard', sec).forEach((el, i) => {
      el.classList.toggle('is-active', i === active);
      el.classList.toggle('is-flipped', flipped.has(i));
      el.classList.toggle('is-done', done.has(i));
      el.classList.toggle('is-locked', !unlocked(i));
      el.classList.toggle('is-next', unlocked(i) && !done.has(i) && i !== active);
      $('.fc-front', el).setAttribute('aria-disabled', String(!unlocked(i)));
    });
    meter();
  }

  /* Open a card: front narration, flip, back narration (or only the back when "Tap to flip" is used) */
  function open(i, backOnly) {
    if (!unlocked(i)) { QX.nudge(); const el = $$('.fcard', sec)[i]; if (G && el) G.fromTo(el, { x: -6 }, { x: 0, duration: .5, ease: 'elastic.out(1, .3)' }); return; }
    const it = C().items[i], k = Math.max(1, (it.flip_before_audio_step || 2) - 1);
    const front = it.audio.slice(0, k), back = it.audio.slice(k);
    active = i;
    if (backOnly || !front.length) flipped.add(i); else flipped.delete(i);
    paint(); sec.classList.add('is-speaking');
    const finish = () => { sec.classList.remove('is-speaking'); done.add(i); paint(); QX.changed(); };
    if (backOnly || !front.length) { speak(back, finish); return; }
    speak(front, () => {
      if (active !== i) return;
      flipped.add(i); paint();
      setTimeout(() => { if (active === i) speak(back, finish); }, STILL ? 0 : 450);
    });
  }

  function setStep(n) {
    step = n; ctl.step(n);
    if (n === 1) { active = -1; paint(); }
    if (n === 2 && G && !reduce && !STILL) G.from($$('.fcard', sec), { y: 50, opacity: 0, rotate: (i) => (i % 2 ? 2 : -2), duration: .8, stagger: .08, ease: 'power3.out' });
    QX.changed();
  }
  /* After the film: only the closing prompt ("Explore each responsibility…"); the film already carries the body narration */
  const exploreVoice = () => C().narration.after_video.slice(-(QX.lang() === 'ar' ? 2 : 1));

  QX.register('s2', {
    title: () => C().nav_title || C().title,
    build(s) {
      sec = s;
      ctl = QX.lesson(sec, { intro: true });
      ctl.film = QX.film(ctl.player, {
        src: () => 'assets/video/qafco-u1s2-' + QX.lang() + '.mp4', poster: () => 'assets/video/poster-u1s2-' + QX.lang() + '.jpg',
        prompt: () => C().narration.click_hint,
        onEnd: () => { setStep(2); speak(exploreVoice()); }
      });
      ctl.body.innerHTML = '<div class="flipdeck"></div>';
      sec.classList.add('lesson-s2');
    },
    render() {
      const c = C();
      ctl.head(c.badges || [], c.title);
      ctl.texts({ intro: c.lead, play: c.video.label, note: c.instruction, explore: c.panel_title });
      ctl.film.load();
      $('.flipdeck', sec).innerHTML = c.items.map((it, i) =>
        '<article class="fcard" style="--c:' + COL[i] + '">' +
          '<div class="fc-in">' +
            '<button type="button" class="fc-face fc-front" data-i="' + i + '">' +
              '<span class="tile__leaf fc-ico" style="background:' + COL[i] + '">' + ic((ICON[it.icon] || 'Sparkle') + '-duotone') + '</span>' +
              '<span class="fc-num">' + QX.num(i) + '</span>' +
              '<span class="fc-lock">' + ic('LockSimple-bold') + '</span>' +
              '<span class="fc-check">' + ic('Check-bold') + '</span>' +
              '<h3 class="fc-title">' + esc(it.title) + '</h3>' +
              '<p class="fc-text">' + esc(it.text) + '</p>' +
              '<span class="fc-art" aria-hidden="true"><span class="halftone"></span>' + ic((ICON[it.icon] || 'Sparkle') + '-duotone') + '</span>' +
              '<span class="fc-flip">' + ic('ArrowsClockwise-bold') + '<span>' + esc(it.flip_hint) + '</span></span>' +
            '</button>' +
            '<div class="fc-face fc-back" data-i="' + i + '">' +
              '<div class="fc-back__top"><span class="tile__leaf fc-ico" style="background:' + COL[i] + '">' + ic((ICON[it.icon] || 'Sparkle') + '-duotone') + '</span><h3 class="fc-title">' + esc(it.title) + '</h3></div>' +
              '<div class="fc-back__body">' + blocks(it.back) + '</div>' +
              '<span class="eq" aria-hidden="true"><span></span><span></span><span></span><span></span></span>' +
            '</div>' +
          '</div>' +
        '</article>').join('');
      $$('.fc-front', sec).forEach((b) => b.addEventListener('click', (e) => {
        const i = +b.dataset.i;
        /* "Tap to flip" on a card that has been heard plays only the back, as in the original */
        open(i, !!e.target.closest('.fc-flip') && done.has(i));
      }));
      $$('.fc-back', sec).forEach((b) => b.addEventListener('click', () => { const i = +b.dataset.i; if (active !== i) { active = i; paint(); } }));
      paint();
    },
    enter(resume, o) {
      setStep(step);
      if (step === 1 && !ctl.film.done) ctl.film.start();
      else if (step === 2 && !o.lang && !STILL) speak(exploreVoice());
      const p = new URLSearchParams(location.search);
      if (p.get('card') && QX.current() === 's2') {
        const i = +p.get('card'); ctl.film.done = true; for (let k = 0; k < i; k++) done.add(k);
        setStep(2); active = i; if (p.get('flip')) flipped.add(i); paint(); stopVoice();
      }
      if (!o.lang) ctl.intro();
    },
    leave() { ctl.film.stop(); sec.classList.remove('is-speaking'); },
    canNext: () => step === 1 ? ctl.film.done : done.size === C().items.length,
    next() { if (step === 1 && ctl.film.done) { ctl.film.stop(); setStep(2); speak(exploreVoice()); return true; } return false; },
    prev() { if (step === 2) { stopVoice(); setStep(1); return true; } return false; },
    hint() {
      const left = C().items.length - done.size;
      return step === 1 ? (ctl.film.done ? QX.T().hintDone : ui().hintScene) : (left ? ui().hintCards(left) : QX.T().hintDone);
    },
    done: () => ctl.film.done && done.size === C().items.length,
    getState: () => ({ step, filmDone: ctl.film.done, done: [...done] }),
    setState(s) { step = s.step === 2 ? 2 : 1; ctl.film.done = !!s.filmDone; (s.done || []).forEach((n) => { done.add(n); flipped.add(n); }); }
  });
})();
