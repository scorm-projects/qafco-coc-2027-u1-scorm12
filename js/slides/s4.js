/* Slide 4 — A Harassment-Free Workplace: the collage film (opening narration and the Q&A), then the
   four forms of harassment. As in the original, each form shows only its picture and number until
   its "+" is pressed; that reveals the title and example and plays its narration. Forms open in order. */
(function () {
  'use strict';
  const { $, $$, G, reduce, STILL, ic, esc, speak, stopVoice } = QX;

  const UI = {
    en: { hintScene: 'Watch the animation to continue', hintForms: (n) => n === 1 ? 'Open the remaining form to continue' : 'Open the remaining ' + n + ' forms to continue', open: 'Open', close: 'Close', of: 'of 4 opened' },
    ar: { hintScene: 'شاهد الفيديو للمتابعة', hintForms: (n) => n === 1 ? 'افتح الشكل المتبقي للمتابعة' : 'افتح الأشكال المتبقية (' + QX.toAr(n) + ') للمتابعة', open: 'افتح', close: 'أغلق', of: 'من ٤ مفتوحة' }
  };
  /* New pictures for the four forms (the original's neon icons don't fit the collage style) */
  const ART = [
    { icon: 'SmileyAngry', col: '#0A5675' },
    { icon: 'HandPalm', col: '#00A9C4' },
    { icon: 'ChatSlash', col: '#02833D' },
    { icon: 'ChartLineDown', col: '#0A5675' }
  ];

  let sec, ctl, step = 1, active = -1;
  const done = new Set();
  const ui = () => UI[QX.lang()];
  const C = () => QX.content('slide-4');
  const unlocked = (i) => i === 0 || done.has(i - 1) || done.has(i);

  function paint() {
    $$('.form', sec).forEach((el, i) => {
      el.classList.toggle('is-open', i === active);
      el.classList.toggle('is-done', done.has(i));
      el.classList.toggle('is-locked', !unlocked(i));
      el.classList.toggle('is-next', unlocked(i) && !done.has(i) && i !== active);
      const b = $('.form__plus', el);
      b.setAttribute('aria-expanded', String(i === active));
      b.setAttribute('aria-label', (i === active ? ui().close : ui().open) + ' — ' + C().items[i].num);
      b.setAttribute('aria-disabled', String(!unlocked(i)));
    });
    ctl.ring(done.size, 4, ui().of);
  }
  function toggle(i) {
    if (!unlocked(i)) { QX.nudge(); return; }
    if (active === i) { active = -1; stopVoice(); sec.classList.remove('is-speaking'); paint(); return; }
    active = i; paint();
    const el = $$('.form', sec)[i];
    if (G && !reduce && !STILL) G.from($$('.form__reveal > *', el), { y: 16, opacity: 0, duration: .5, delay: .25, stagger: .08, ease: 'power2.out' });
    sec.classList.add('is-speaking');
    speak(C().items[i].audio, () => { sec.classList.remove('is-speaking'); done.add(i); paint(); QX.changed(); });
  }

  function setStep(n) {
    step = n; ctl.step(n);
    if (n === 1) { active = -1; paint(); }
    if (n === 2 && G && !reduce && !STILL) G.from($$('.form', sec), { y: 50, opacity: 0, duration: .8, stagger: .1, ease: 'power3.out' });
    QX.changed();
  }
  const exploreVoice = () => C().narration.after_video;

  QX.register('s4', {
    title: () => C().nav_title || C().title,
    build(s) {
      sec = s;
      ctl = QX.lesson(sec, { intro: false });
      ctl.film = QX.film(ctl.player, {
        src: () => 'assets/video/qafco-u1s4-' + QX.lang() + '.mp4', poster: () => 'assets/video/poster-u1s4-' + QX.lang() + '.jpg',
        prompt: () => C().narration.click_hint,
        onEnd: () => { setStep(2); speak(exploreVoice()); }
      });
      ctl.body.innerHTML = '<div class="forms"></div>';
      sec.classList.add('lesson-s4');
    },
    render() {
      const c = C();
      ctl.head(c.badges || [], c.title);
      ctl.texts({ play: c.video.label, note: c.instruction, explore: c.panel_title });
      ctl.film.load();
      $('.forms', sec).innerHTML = c.items.map((it, i) =>
        '<article class="form" style="--c:' + ART[i].col + '">' +
          '<div class="form__art" aria-hidden="true">' +
            '<div class="halftone form__ht"></div>' +
            '<span class="form__leaf" style="background:' + ART[i].col + '">' + ic(ART[i].icon + '-duotone') + '</span>' +
            '<span class="form__stamp">' + ic('Prohibit-bold') + '</span>' +
          '</div>' +
          '<div class="form__bar">' +
            '<span class="form__num">' + esc(it.num) + '</span>' +
            '<span class="form__state">' + ic('Check-bold', 'form__tick') + ic('LockSimple-bold', 'form__lock') + '</span>' +
            '<button type="button" class="form__plus" data-i="' + i + '">' + ic('Plus-bold') + '</button>' +
          '</div>' +
          '<div class="form__reveal">' +
            '<h3 class="form__title">' + esc(it.title) + '</h3>' +
            '<div class="example"><h4>' + ic('ChatsCircle-bold') + '<span>' + esc(it.example_label) + '</span></h4><p>' + esc(it.example) + '</p></div>' +
            '<span class="eq" aria-hidden="true"><span></span><span></span><span></span><span></span></span>' +
          '</div>' +
        '</article>').join('');
      $$('.form__plus', sec).forEach((b) => b.addEventListener('click', () => toggle(+b.dataset.i)));
      $$('.form__art', sec).forEach((a, i) => a.addEventListener('click', () => { if (active !== i) toggle(i); }));
      paint();
    },
    enter(resume, o) {
      setStep(step);
      if (step === 1 && !ctl.film.done) ctl.film.start();
      else if (step === 2 && !o.lang && !STILL) speak(exploreVoice());
      const p = new URLSearchParams(location.search);
      if (p.get('form') && QX.current() === 's4') {
        const i = +p.get('form'); ctl.film.done = true; for (let k = 0; k < i; k++) done.add(k);
        setStep(2); active = i; paint(); stopVoice();
      }
      if (!o.lang) ctl.intro();
    },
    leave() { ctl.film.stop(); sec.classList.remove('is-speaking'); },
    canNext: () => step === 1 ? ctl.film.done : done.size === 4,
    next() { if (step === 1 && ctl.film.done) { ctl.film.stop(); setStep(2); speak(exploreVoice()); return true; } return false; },
    prev() { if (step === 2) { stopVoice(); setStep(1); return true; } return false; },
    hint() {
      const left = 4 - done.size;
      return step === 1 ? (ctl.film.done ? QX.T().hintDone : ui().hintScene) : (left ? ui().hintForms(left) : QX.T().hintDone);
    },
    done: () => ctl.film.done && done.size === 4,
    getState: () => ({ step, filmDone: ctl.film.done, done: [...done] }),
    setState(s) { step = s.step === 2 ? 2 : 1; ctl.film.done = !!s.filmDone; (s.done || []).forEach((n) => done.add(n)); }
  });
})();
