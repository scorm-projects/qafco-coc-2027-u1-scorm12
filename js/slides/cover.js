/* Unit 1 cover — the unit's title page. Text and narration from Qafco/U1/cover.html and
   Qafco-AR/U1/cover.html; each topic lights up while the narrator reads it. */
(function () {
  'use strict';
  const { $, $$, G, reduce, STILL, ic, esc, speak, voice } = QX;

  const T = {
    en: {
      kicker: 'Unit 1 of 3', title: 'Foundations of the QAFCO Code of Conduct',
      lead: 'The foundation of the QAFCO Code of Conduct. Understand your responsibilities under the Code, the business principles that guide every decision, and the ethics rules we all follow every day.',
      list: ['Employee responsibilities under the Code', "QAFCO's business principles and a harassment-free workplace", 'Anti-bribery, gifts and insider trading rules', 'Knowledge check at the end'],
      begin: 'Begin Unit 1', home: 'Course Home', n: '1',
      audio: ['sounds/voiceover/u1_cover.mp3'],
      cues: [16.47, 20.48, 24.56, 28.42] /* seconds into u1_cover.mp3 where each topic is read (whisper.cpp) */
    },
    ar: {
      kicker: 'الوحدة ١ من ٣', title: 'أُسُس مدوَّنة قواعد السُّلوك في قافكو',
      lead: 'تعرّف على المبادئ الأساسية لمدونة قواعد السلوك في قافكو، وعلى الأشخاص الذين تنطبق عليهم المدونة، والقيم التي توجّه عملية اتخاذ القرار، وكيف يجسّدها الموظفون والمديرون في ممارساتهم اليومية.',
      list: ['مسؤوليات الموظف بموجب المدونة', 'توقعات المديرين والقادة', 'قواعد مكافحة الرشوة والهدايا والضيافة والتداول من الداخل', 'اختبار معرفي في النهاية'],
      begin: 'ابدأ الوحدة ١', home: 'الصفحة الرئيسية للدورة', n: '١',
      audio: ['../sounds/20_مدونة_قواعد_السلوك.mp3', '../sounds/21_مدونة_قواعد_السلوك.mp3', '../sounds/new-sounds/شريحة 0/مسؤولياتُ الموظفِ.mp3', '../sounds/new-sounds/شريحة 0/توقعات المديرين.mp3', '../sounds/new-sounds/شريحة 0/قواعد الهدايا والضيافة.mp3', '../sounds/new-sounds/شريحة 0/اختبار معرفي.mp3'],
      cueFiles: [2, 3, 4, 5] /* the Arabic narration has one recording per topic */
    }
  };
  const t = () => T[QX.lang()];
  const ICONS = ['ClipboardText', 'Scales', 'HandCoins', 'Medal'];
  let sec, heard = false;

  /* Which topic is being read right now */
  function cue() {
    const L = t(); let k = -1;
    if (L.cues) L.cues.forEach((s, i) => { if (voice.currentTime >= s - .1) k = i; });
    else { const src = decodeURI(voice.src); L.cueFiles.forEach((f, i) => { if (src.endsWith(QX.file(L.audio[f]).split('/').pop())) k = i; }); }
    light(k);
  }
  function light(k) { $$('.cv-list li', sec).forEach((li, i) => li.classList.toggle('is-on', i === k)); }

  QX.register('cover', {
    title: () => t().title,
    build(s) {
      sec = s;
      sec.innerHTML =
        '<div class="cv-art" aria-hidden="true">' +
          '<div class="halftone cv-ht"></div>' +
          '<div class="grid cv-grid"></div>' +
          '<div class="torn cv-photo" data-seed="21"><span class="tape"></span><img src="assets/plant/twin-columns.webp" alt="" /><span class="tint"></span></div>' +
          '<div class="cv-num"></div>' +
          '<svg class="leafshape cv-leaf" data-leaf="green" viewBox="0 0 300 330"></svg>' +
          '<img class="sticker cv-person" src="assets/people/noora-front.webp" alt="" />' +
          '<div class="torn cv-photo2" data-seed="5"><img src="assets/plant/tanks.webp" alt="" /></div>' +
          '<svg class="doodle cv-doodle" viewBox="0 0 220 110"><path d="M12 80 C 60 20, 140 10, 200 46 M170 22 L202 46 L174 72" /></svg>' +
        '</div>' +
        '<div class="cv-copy">' +
          '<span class="chip cv-kicker">' + ic('BookOpenText-bold') + '<span class="cv-k"></span></span>' +
          '<h1 class="label cv-title"></h1>' +
          '<p class="cv-lead"></p>' +
          '<ol class="cv-list"></ol>' +
          '<div class="cv-actions"><button type="button" class="cta cv-begin"><span></span>' + ic('ArrowRight-bold') + '</button>' +
          '<button type="button" class="navbtn cv-home">' + ic('House-bold') + '<span></span></button></div>' +
        '</div>';
      $('.cv-begin', sec).addEventListener('click', () => QX.show('s2'));
      $('.cv-home', sec).addEventListener('click', () => QX.show('welcome'));
      voice.addEventListener('timeupdate', () => { if (QX.current() === 'cover') cue(); });
    },
    render() {
      const L = t();
      $('.cv-k', sec).textContent = L.kicker;
      $('.cv-title', sec).textContent = L.title;
      $('.cv-lead', sec).textContent = L.lead;
      $('.cv-num', sec).textContent = L.n;
      $('.cv-list', sec).innerHTML = L.list.map((x, i) => '<li><span class="tile__leaf cv-ico">' + ic(ICONS[i] + '-duotone') + '</span><span>' + esc(x) + '</span></li>').join('');
      $('.cv-begin span', sec).textContent = L.begin;
      $('.cv-home span', sec).textContent = L.home;
    },
    enter(resume, o) {
      light(-1);
      if (!o.lang) speak(t().audio, () => { heard = true; light(-1); QX.changed(); });
      if (!G || reduce || STILL || o.lang) return;
      const dir = QX.lang() === 'ar' ? -1 : 1;
      const tl = G.timeline({ defaults: { ease: 'power3.out' } });
      const ph = $('.cv-photo', sec), end = ph._torn;
      if (end) tl.fromTo(ph, { clipPath: QX.poly(end.map(([, y]) => [dir < 0 ? 100 : 0, y])) }, { clipPath: QX.poly(end), duration: 1.4, ease: 'power2.inOut' }, 0);
      tl.from($('.cv-num', sec), { y: 120, opacity: 0, rotate: -8 * dir, duration: 1.3 }, .2)
        .from([$('.cv-ht', sec), $('.cv-grid', sec), $('.cv-photo2', sec)], { scale: .7, opacity: 0, duration: 1, stagger: .12 }, .3)
        .from([$('.cv-leaf', sec), $('.cv-person', sec)], { y: 100, opacity: 0, duration: 1.2, stagger: .15 }, .5)
        .from($('.cv-kicker', sec), { y: 14, opacity: 0, duration: .6 }, .1)
        .from($('.cv-title', sec), { x: -50 * dir, opacity: 0, duration: 1 }, .2)
        .from($('.cv-lead', sec), { y: 18, opacity: 0, duration: .8 }, .45)
        .from($$('.cv-list li', sec), { x: -30 * dir, opacity: 0, duration: .7, stagger: .1 }, .6)
        .from($('.cv-actions', sec), { y: 18, opacity: 0, duration: .7 }, .9);
      $$('.cv-doodle path', sec).forEach((p) => { const len = p.getTotalLength(); tl.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, 1.4); });
    },
    leave() { light(-1); },
    canNext: () => true,
    hint: () => '',
    done: () => true,
    getState: () => ({ heard }),
    setState(s) { heard = !!s.heard; }
  });
})();
