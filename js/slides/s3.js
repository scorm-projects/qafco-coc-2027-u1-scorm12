/* Slide 3 — QAFCO's Business Principles: the collage film, then six principle cards, each opening a
   sheet with a small collage scene timed to the card's recorded narration. */
(function () {
  'use strict';
  const { $, $$, G, reduce, STILL, ic, fillIcons, speak, stopVoice, voice } = QX;
  const EN_SND = '../Qafco/U1/sounds/voiceover/';
  const AR_SND = '../Qafco-AR/sounds/';

  const T = {
    en: {
      topic: 'Topic 2 of 4', interactive: 'Interactive — Click on each card to hear',
      lessonTitle: ["QAFCO's", 'Business Principles'],
      intro: 'They are the foundation for how we operate and create sustainable value for all our stakeholders. These principles are deeply embedded in our Code of Conduct, and they guide every decision we make.',
      sceneplay: 'Click on the animation to continue',
      explore: 'Explore each principle — click on each card to hear',
      revealed: 'of 6 explored', example: 'Example',
      hintScene: 'Watch the animation to continue', hintCards: (n) => n === 1 ? 'Open the remaining card to continue' : 'Open the remaining ' + n + ' cards to continue',
      film: 'assets/video/qafco-collage-full-en.mp4',
      p: [
        ['Honesty & Integrity', 'We conduct our business fairly and ethically.', 'Honesty and integrity are essential in all our dealings. They help us build strong, trusting, and lasting relationships — both internally and with external partners.', 'An employee discovers an error in a report submitted to a customer. Instead of ignoring it, they immediately inform their manager and the customer, provide the correct information, and help resolve any impact caused by the mistake.', 'Foundation Principle'],
        ['Care', 'Our people are our success.', "We respect employees' human rights, provide safe and supportive working conditions, and offer opportunities to grow — with a special emphasis on the recruitment and development of Qatari nationals.", 'A supervisor notices that a team member is struggling with a heavy workload. They offer support, adjust priorities where possible, and ensure the employee has access to the resources needed to work safely and effectively.', 'People First'],
        ['Sustainability', 'For future generations.', 'We operate in a way that does not compromise the ability of future generations to meet their needs — economically sound, socially responsible, and environmentally friendly.', 'When planning a new project, the team selects energy-efficient equipment and reduces unnecessary paper usage to minimise environmental impact while maintaining operational efficiency.', 'Future-Focused'],
        ['Responsibility', 'Beyond just shareholders.', 'Our duty extends to employees, customers, business partners, and the wider community. We strive to balance all these interests responsibly.', 'An employee receives a customer complaint and takes ownership of the issue, coordinating with the relevant departments to find a solution and keeping the customer informed until the matter is resolved.', 'All Stakeholders'],
        ['Compliance', 'Wherever we do business.', 'We comply with applicable laws and regulations, back it with robust governance, and give employees safe, confidential channels to raise concerns.', 'Before sharing company information with an external partner, an employee verifies that the necessary approvals and confidentiality requirements are in place and follows all applicable company policies.', 'Laws & Governance'],
        ['Operational Excellence', 'From teamwork and diversity.', "We aim for excellence in everything we do, embracing the diversity of our staff and always prioritising the company's interests above personal ambition.", 'A team identifies a repetitive manual process that causes delays. They collaborate to improve the workflow, reduce errors, and increase efficiency while maintaining quality standards.', 'Teamwork & Diversity']
      ],
      audio: ['lesson2_p1.mp3', 'lesson2_p2.mp3', 'lesson2_p3.mp3', 'lesson2_p4.mp3', 'lesson2_p5.mp3', 'lesson2_p6.mp3'].map((f) => [EN_SND + f]),
      promptFilm: [EN_SND + 'lesson2_click_animation.mp3'], promptCards: [EN_SND + 'lesson2_post.mp3']
    },
    ar: {
      topic: '٢ من ٤', interactive: 'تفاعلي — انقر على كل بطاقة للاستماع',
      lessonTitle: ['مبادئ أعمال', 'قافكو'],
      intro: 'تُمثِّل مبادئ أعمال قافكو الأساس الذي تستند إليه طريقة عملنا، وتحقيق قيمة مُستَدامة لجميع أصحاب المصلحة. وتَرتَكِز هذه المبادئ في صَميم مدوَّنة قواعد السُّلوك، لتكون مرجعًا يُوجِّه قراراتنا وتصرُّفاتنا في جميع أعمالنا.',
      sceneplay: 'اضغط على الفيديو لبدء المشاهدة',
      explore: 'استَكشِف كل مبدأ — انقُر على كل بطاقة للاستماع',
      revealed: 'من ٦ مكتملة', example: 'مثال',
      hintScene: 'شاهد الفيديو للمتابعة', hintCards: (n) => n === 1 ? 'افتح البطاقة المتبقية للمتابعة' : 'افتح البطاقات المتبقية (' + QX.toAr(n) + ') للمتابعة',
      film: 'assets/video/qafco-collage-full-ar.mp4',
      p: [
        ['الأمانة والنَّزاهة', 'نمارس أعمالنا بعدل وأخلاقية.', 'الأمانة والنَّزاهة أساس جميع تعامُلاتنا، فهما تَبنيان علاقات قويَّة تقوم على الثِّقة والاستدامة، سواء داخل قافكو أو مع شُركائنا الخارجيّين.', 'يكتشف أحد المُوظَّفين خطأً في تقرير أُرسِل إلى أحد العملاء. وبدلًا من تَجاهُله، يُبلِّغ مُديره والعميل فورًا، ويُقدِّم المعلومات الصَّحيحة، ويُسهِم في مُعالَجة الآثار المُترتِّبة على الخطأ.', 'مبدأ أساسي'],
        ['الرِّعاية', 'أفرادنا هم نجاحنا.', 'نحترم حقوق الإنسان، ونُوفِّر بيئة عملٍ آمِنة وداعِمة، ونُهيِّئ فُرصًا للنُّمُو والتَّطوير، مع اهتمامٍ خاصّ باستِقطاب الكَفاءات الوطنيَّة وتنميتها.', 'يُلاحِظ أحد المُشرِفين أنَّ أحد أعضاء الفريق يُواجِه ضغطًا في العمل، فيُقدِّم له الدَّعم، ويُعيد ترتيب الأَولويّات عند الحاجة، ويَضمَن حُصوله على الموارد اللّازمة للعمل بأمانٍ وكفاءة.', 'الإنسان أولًا'],
        ['الِاستدامة', 'من أجل الأجيال القادمة.', 'نعمل بطريقةٍ تُلبّي احتياجات الحاضر، دون المَساس بقُدرة الأجيال القادمة على تَلبية احتياجاتها، من خلال مُمارَسات اقتصاديَّة واجتماعيَّة وبيئيَّة مسؤولة.', 'عند التَّخطيط لمشروعٍ جديد، يختار الفريق مُعَدّات مُوفِّرة للطاقة، ويُقلِّل استخدام الورقَ للحَدِّ من الأثر البيئيّ، مع الحفاظ على الكفاءة التَّشغيليَّة.', 'توجَّه نحو المستقبل'],
        ['المسؤوليَّة', 'أبعد من المساهمين فقط.', 'تمتد مسؤوليّتنا إلى مُوظَّفينا وعُملائنا وشُرَكاء الأعمال والمجتمع. ونسعى إلى تحقيق التَّوازن بين مَصالِح جميع أصحاب المَصلَحة بمسؤوليَّة.', 'يتلقَّى أحد المُوظَّفين شكوى من أحد العُملاء، فيتولَّى مسؤوليَّة مُتابعَتها، ويُنسِّق مع الإدارات المَعنيَّة للوصول إلى حَلّ، ويُبقي العميل على اطِّلاع حتى إغلاق الموضوع.', 'جميع أصحاب المَصلَحة'],
        ['الامتثال', 'أينما نمارس أعمالنا.', 'نلتزم بالقوانين واللَّوائح المعمول بها، ونُعزِّز ذلك بحَوكَمة فعّالة، ونُوفِّر قنوات آمِنة وسِريَّة للإبلاغ عن المَخاوِف.', 'قبل مشاركة أي معلومات مع شَريكٍ خارجيّ، يتحقَّق المُوظَّف من استيفاء جميع المُوافَقات المطلوبة ومُتطَلَّبات السِريَّة، ويلتزم بسياسات الشَّركة ذات الصِلة.', 'القَوانين والحَوكَمة'],
        ['التَّميُّز التَّشغيليّ', 'من العمل الجماعي والتنوّع.', 'نسعى إلى التميُّز في كل ما نقوم به، ونُقدِّر تنوُّع مُوظَّفينا، ونضَع مصلحة الشَّركة في مُقدِّمة أولويّاتنا.', 'يُحدِّد أحد الفِرَق عمليَّة يدويَّة مُتكرِّرة تتسبَّب في تأخير العمل، فيتَعاون أفراده على تَحسينها، وتقليل الأخطاء، وزيادة الكَفاءة، مع الحفاظ على معايير الجَودة.', 'العمل الجماعي والتنوُّع']
      ],
      audio: [
        ['new-sounds/شريحة 2/الامانة.mp3', 'new-sounds/شريحة 2/الأمانة والنَّزاهة أساس جميع.mp3'],
        ['272_مدونة_قواعد_السلوك.mp3', '105_مدونة_قواعد_السلوك.mp3'],
        ['265_مدونة_قواعد_السلوك.mp3', '113_مدونة_قواعد_السلوك.mp3'],
        ['new-sounds/شريحة 2/المسؤولية.mp3', '120_مدونة_قواعد_السلوك.mp3'],
        ['5_مدونة_قواعد_السلوك.mp3', '126_مدونة_قواعد_السلوك.mp3'],
        ['new-sounds/شريحة 2/التميز.mp3', '132_مدونة_قواعد_السلوك.mp3']
      ].map((steps) => steps.map((s) => AR_SND + s)),
      promptFilm: [AR_SND + '85_مدونة_قواعد_السلوك.mp3'], promptCards: [AR_SND + '86_مدونة_قواعد_السلوك.mp3']
    }
  };
  const t = () => T[QX.lang()];

  /* Icon and colour for each principle */
  const ART = [
    { icon: 'Scales', col: '#02833D' },
    { icon: 'HeartHalf', col: '#00A9C4' },
    { icon: 'Plant', col: '#0A5675' },
    { icon: 'ShieldCheck', col: '#02833D' },
    { icon: 'ClipboardText', col: '#00A9C4' },
    { icon: 'Target', col: '#0A5675' }
  ];

  let step = 1, openIdx = -1, filmCtl = null;
  const seen = new Set();

  /* ══ Principle scenes: one small collage per principle, timed to its narration ══
     Times are seconds into that card's narration (whisper.cpp word timings, EN / AR). Words shown are
     words the narrator says. Kinds: flutter, rise, pop, stamp, draw, word, orbit. */
  const SCENES = [
    { /* Honesty & Integrity — report with an error that gets corrected */
      els: [
        { k: 'grid', x: 20, y: 470, w: 300, h: 170, r: -3, at: [0, 0], kind: 'flutter' },
        { k: 'doc', x: 30, y: 70, w: 270, h: 360, r: -4, at: [0.2, 0.2], kind: 'flutter' },
        { k: 'draw', x: 40, y: 175, w: 260, h: 70, d: 'M10 40 C 30 6, 200 0, 240 30 C 260 54, 120 70, 30 56 C 4 50, 8 30, 24 22', col: '#D64545', at: [3.9, 4.0] },
        { k: 'draw', x: 200, y: 330, w: 110, h: 90, d: 'M10 46 L40 76 L100 12', col: '#02833D', at: [5.3, 5.9], keep: true },
        { k: 'img', src: 'people/maryam-three.webp', x: 250, y: 140, h: 520, at: [0.5, 0.5], kind: 'rise' },
        { k: 'badge', icon: 'Handshake', col: '#02833D', x: 40, y: 500, at: [6.5, 6.3], kind: 'pop' },
        { k: 'word', en: 'trusting', ar: 'الثقة', x: 150, y: 560, at: [7.93, 8.65] }
      ] },
    { /* Care — a supervisor supports a team member */
      els: [
        { k: 'ground', at: [0, 0], kind: 'rise' },
        { k: 'ht', x: 300, y: 30, w: 200, h: 200, at: [0.1, 0.1], kind: 'pop' },
        { k: 'img', src: 'people/khalid-three.webp', x: 30, y: 130, h: 520, at: [0.3, 0.3], kind: 'rise' },
        { k: 'img', src: 'people/arjun-front.webp', x: 230, y: 140, h: 510, at: [0.6, 0.6], kind: 'rise' },
        { k: 'badge', icon: 'HeartHalf', col: '#00A9C4', x: 360, y: 70, at: [1.4, 1.35], kind: 'pop' },
        { k: 'draw', x: 150, y: 40, w: 200, h: 120, d: 'M100 104 C 30 70, 10 30, 40 14 C 64 2, 92 20, 100 40 C 108 20, 136 2, 160 14 C 190 30, 170 70, 100 104', col: '#02833D', at: [4.24, 4.37] },
        { k: 'word', en: 'safe and supportive', ar: 'آمِنة وداعِمة', x: 30, y: 590, at: [4.24, 4.37] }
      ] },
    { /* Sustainability — the greenhouse and a sprout for future generations */
      els: [
        { k: 'ht', x: 30, y: 30, w: 330, h: 330, at: [0, 0], kind: 'pop' },
        { k: 'photo', src: 'plant/greenhouse.webp', x: 50, y: 50, w: 290, h: 290, at: [0.2, 0.2], kind: 'flutter' },
        { k: 'img', src: 'people/noora-three.webp', x: 280, y: 150, h: 510, at: [0.6, 0.6], kind: 'rise' },
        { k: 'ground', at: [0, 0], kind: 'rise' },
        { k: 'draw', x: 70, y: 380, w: 160, h: 230, d: 'M80 220 C 80 170, 80 130, 80 90 M80 150 C 44 136, 26 106, 30 74 C 64 78, 80 106, 80 136 M80 120 C 116 98, 136 74, 134 44 C 98 46, 82 72, 80 104', col: '#02833D', at: [4.88, 4.79], dur: 1.6 },
        { k: 'word', en: 'future generations', ar: 'الأجيال القادمة', x: 30, y: 590, at: [4.88, 4.79] }
      ] },
    { /* Responsibility — employees, customers, partners and the community around one person */
      els: [
        { k: 'ground', at: [0, 0], kind: 'rise' },
        { k: 'img', src: 'people/faisal-front.webp', x: 175, y: 150, h: 510, at: [0.3, 0.3], kind: 'rise' },
        { k: 'badge', icon: 'UserCircle', col: '#02833D', x: 30, y: 120, at: [2.96, 2.89], kind: 'orbit' },
        { k: 'badge', icon: 'ShoppingBag', col: '#00A9C4', x: 390, y: 110, at: [4.2, 3.68], kind: 'orbit' },
        { k: 'badge', icon: 'Handshake', col: '#0A5675', x: 30, y: 330, at: [5.68, 4.44], kind: 'orbit' },
        { k: 'badge', icon: 'Buildings', col: '#EFD34F', x: 390, y: 320, at: [6.96, 5.7], kind: 'orbit', dark: true },
        { k: 'word', en: 'the wider community', ar: 'المجتمع', x: 40, y: 590, at: [6.66, 5.7] }
      ] },
    { /* Compliance — approvals stamped, governance, confidential channels */
      els: [
        { k: 'doc', x: 30, y: 90, w: 260, h: 330, r: 3, at: [0.2, 0.2], kind: 'flutter' },
        { k: 'img', src: 'people/daniel-three.webp', x: 270, y: 150, h: 510, at: [0.5, 0.5], kind: 'rise' },
        { k: 'badge', icon: 'Stamp', col: '#02833D', x: 150, y: 300, at: [2.99, 2.13], kind: 'stamp' },
        { k: 'badge', icon: 'Scales', col: '#0A5675', x: 50, y: 450, at: [3.55, 2.86], kind: 'pop' },
        { k: 'badge', icon: 'LockKey', col: '#00A9C4', x: 180, y: 470, at: [8.41, 7.68], kind: 'pop' },
        { k: 'word', en: 'robust governance', ar: 'حَوكَمة فعّالة', x: 30, y: 590, at: [5.25, 4.85] }
      ] },
    { /* Operational Excellence — teamwork across a diverse crew, the plant running well */
      els: [
        { k: 'ground', at: [0, 0], kind: 'rise' },
        { k: 'img', src: 'plant/urea-towers.webp', x: 20, y: 300, h: 280, warm: true, at: [0.2, 0.2], kind: 'rise' },
        { k: 'img', src: 'people/arjun-three.webp', x: 120, y: 170, h: 490, at: [0.5, 0.5], kind: 'rise' },
        { k: 'img', src: 'people/daniel-front.webp', x: 300, y: 160, h: 500, at: [0.8, 0.8], kind: 'rise' },
        { k: 'badge', icon: 'Trophy', col: '#EFD34F', x: 50, y: 60, at: [2.65, 2.05], kind: 'pop', dark: true },
        { k: 'badge', icon: 'Gear', col: '#0A5675', x: 380, y: 60, at: [3.4, 2.65], kind: 'pop', spin: true },
        { k: 'word', en: 'diversity', ar: 'تنوُّع', x: 150, y: 590, at: [5.44, 4.9] }
      ] }
  ];
  let sceneTl = null;
  function scaleScene() {
    const art = $('#sheet-art'); if (!art || !art.clientWidth) return;
    const k = Math.min(art.clientWidth / 520, art.clientHeight / 685);
    $('#pscene').style.transform = 'translate(-50%, -50%) scale(' + k + ')';
  }
  function buildScene(i) {
    const box = $('#pscene');
    box.innerHTML = '';
    const L = QX.lang() === 'ar' ? 1 : 0;
    SCENES[i].els.forEach((e) => {
      let el;
      if (e.k === 'img') { el = document.createElement('img'); el.src = 'assets/' + e.src; el.alt = ''; el.className = e.warm ? 'ps-warm' : 'ps-sticker'; el.style.height = e.h + 'px'; }
      else if (e.k === 'doc') { el = document.createElement('div'); el.className = 'ps-doc'; el.innerHTML = '<b></b>' + '<i></i>'.repeat(9); }
      else if (e.k === 'grid') { el = document.createElement('div'); el.className = 'ps-grid'; }
      else if (e.k === 'ht') { el = document.createElement('div'); el.className = 'ps-ht'; }
      else if (e.k === 'ground') { el = document.createElement('div'); el.className = 'ps-ground'; }
      else if (e.k === 'photo') { el = document.createElement('div'); el.className = 'ps-photo'; el.innerHTML = '<img src="assets/' + e.src + '" alt="" />'; }
      else if (e.k === 'badge') { el = document.createElement('div'); el.className = 'ps-badge'; el.style.background = e.col; if (e.dark) el.style.color = 'var(--ink)'; el.innerHTML = ic(e.icon + '-duotone'); }
      else if (e.k === 'word') { el = document.createElement('div'); el.className = 'ps-word' + (i % 2 ? ' ps-word--green' : ''); el.textContent = L ? e.ar : e.en; }
      else if (e.k === 'draw') { el = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); el.setAttribute('class', 'ps-doodle'); el.setAttribute('viewBox', '0 0 ' + e.w + ' ' + e.h); el.innerHTML = '<path d="' + e.d + '" stroke="' + e.col + '"/>'; if (L && !e.keep) el.style.transform = 'scaleX(-1)'; }
      if (e.x != null) el.style.insetInlineStart = e.x + 'px';
      if (e.y != null) el.style.top = e.y + 'px';
      if (e.w && e.k !== 'img') { el.style.width = e.w + 'px'; el.style.height = e.h + 'px'; }
      if (e.r) el.style.rotate = (L ? -e.r : e.r) + 'deg';
      el._e = e; box.appendChild(el);
    });
    fillIcons(box);
  }
  function playScene(start) {
    if (sceneTl) sceneTl.kill();
    if (!G || reduce) return;
    const L = QX.lang() === 'ar' ? 1 : 0, dir = L ? -1 : 1;
    sceneTl = G.timeline({ paused: true });
    [...$('#pscene').children].forEach((el) => {
      const e = el._e, at = e.at[L];
      if (e.k === 'draw') { const p = el.querySelector('path'), len = p.getTotalLength(); G.set(p, { strokeDasharray: len, strokeDashoffset: len }); sceneTl.to(p, { strokeDashoffset: 0, duration: e.dur || .9, ease: 'power2.inOut' }, at); return; }
      if (e.k === 'word') { sceneTl.from(el, { rotationX: -85, y: -40, opacity: 0, transformPerspective: 700, duration: .7, ease: 'back.out(1.6)' }, at); return; }
      const kind = e.kind || 'rise';
      if (kind === 'flutter') sceneTl.from(el, { y: -120, rotationX: 55, rotationY: -22 * dir, rotation: 10 * dir, opacity: 0, transformPerspective: 900, duration: 1.2, ease: 'back.out(1.2)' }, at);
      if (kind === 'rise') sceneTl.from(el, { y: 90, opacity: 0, duration: 1.1, ease: 'power3.out' }, at);
      if (kind === 'pop') sceneTl.from(el, { scale: .4, opacity: 0, rotation: -12 * dir, duration: .7, ease: 'back.out(2)' }, at);
      if (kind === 'stamp') sceneTl.from(el, { scale: 1.9, opacity: 0, duration: .3, ease: 'power4.in' }, at).to(el, { y: 3, duration: .06, yoyo: true, repeat: 1 }, at + .3);
      if (kind === 'orbit') sceneTl.from(el, { x: (260 - e.x - 48) * dir, y: 300 - e.y, scale: .2, rotation: 160 * dir, opacity: 0, duration: 1, ease: 'power3.out' }, at);
      if (e.spin) G.to(el.querySelector('svg') || el, { rotation: 360, duration: 6, repeat: -1, ease: 'none', delay: at + .7 });
    });
    if (start) sceneTl.play(0); else sceneTl.progress(1);
  }

  /* ══ Principle sheet: grows out of its card ══ */
  function fillSheet(i) {
    const p = t().p[i];
    const lf = $('#sheet-icon'); lf.style.background = ART[i].col; lf.innerHTML = ic(ART[i].icon + '-duotone');
    $('#sheet-num').textContent = QX.num(i);
    $('#sheet-name').textContent = p[0];
    $('#sheet-text').textContent = p[2];
    $('#sheet-tag').textContent = p[4];
    $('#sheet-example').textContent = p[3];
    buildScene(i);
    $('#sheet-status').textContent = QX.T().playing;
    fillIcons($('#sheet'));
  }
  function openSheet(i, tile) {
    const sheet = $('#sheet'), wasOpen = openIdx >= 0;
    openIdx = i; fillSheet(i); sheet.classList.add('is-open', 'is-speaking'); scaleScene();
    if (G && !reduce && !STILL) {
      if (!wasOpen && tile) {
        const g = $('#step2').getBoundingClientRect(), r = tile.getBoundingClientRect(), k = g.width / $('#step2').offsetWidth;
        G.fromTo(sheet, { clipPath: `inset(${(r.top - g.top) / k}px ${(g.right - r.right) / k}px ${(g.bottom - r.bottom) / k}px ${(r.left - g.left) / k}px)` }, { clipPath: 'inset(0px 0px 0px 0px)', duration: .75, ease: 'power3.inOut' });
        G.from('.sheet__body > *', { y: 18, opacity: 0, duration: .55, delay: .4, stagger: .05, ease: 'power2.out' });
      } else {
        G.from('.sheet__body > *', { opacity: 0, duration: .4, stagger: .03 });
      }
    }
    playScene(false); if (sceneTl) sceneTl.pause(0);
    let started = false;
    const go = () => { if (STILL) { if (sceneTl) sceneTl.progress(1); return; } if (!started && sceneTl && openIdx === i) { started = true; sceneTl.play(0); } };
    voice.addEventListener('playing', go, { once: true });
    setTimeout(go, 1500); /* if the narration cannot start (muted or blocked), the scene still plays */
    speak(t().audio[i], () => {
      sheet.classList.remove('is-speaking');
      $('#sheet-status').textContent = QX.T().played;
      seen.add(i); const tl = $('.tile[data-i="' + i + '"]'); if (tl) tl.classList.add('is-seen');
      ring(); QX.changed();
    });
  }
  function closeSheet(now) {
    const sheet = $('#sheet');
    if (openIdx < 0) return;
    const tile = $('.tile[data-i="' + openIdx + '"]');
    stopVoice(); sheet.classList.remove('is-speaking');
    const finish = () => { sheet.classList.remove('is-open'); sheet.style.clipPath = ''; openIdx = -1; };
    if (G && !reduce && tile && !now) {
      const g = $('#step2').getBoundingClientRect(), r = tile.getBoundingClientRect(), k = g.width / $('#step2').offsetWidth;
      G.to(sheet, { clipPath: `inset(${(r.top - g.top) / k}px ${(g.right - r.right) / k}px ${(g.bottom - r.bottom) / k}px ${(r.left - g.left) / k}px)`, duration: .5, ease: 'power3.inOut', onComplete: finish });
    } else finish();
  }

  function ring() {
    const C = 2 * Math.PI * 21, fg = $('#ring-fg');
    fg.style.strokeDasharray = C; fg.style.strokeDashoffset = C * (1 - seen.size / 6);
    $('#ring-n').textContent = QX.dig(seen.size);
  }
  function setStep(n) {
    step = n;
    $('#step1').classList.toggle('is-on', n === 1);
    $('#step2').classList.toggle('is-on', n === 2);
    $('#st1').className = n === 1 ? 'on' : 'done';
    $('#st2').className = n === 2 ? 'on' : '';
    if (n === 2 && G && !reduce && !STILL) G.from('#s3 .tile', { y: 40, opacity: 0, duration: .8, stagger: .08, ease: 'power3.out' });
    if (n === 1) closeSheet(true);
    QX.changed();
  }

  QX.register('s3', {
    title: () => QX.content('slide-3').nav_title || t().lessonTitle.join(' '),
    build() {
      filmCtl = QX.film($('#player'), {
        src: () => t().film, poster: () => t().film.replace(/qafco-collage-full-(\w+)\.mp4/, 'poster-$1.jpg'),
        prompt: () => t().promptFilm,
        onEnd: () => { setStep(2); speak(t().promptCards); } /* "Explore each principle", as after the original video */
      });
      $('#sheet-close').addEventListener('click', () => closeSheet());
      $('#sheet-prev').addEventListener('click', () => openSheet((openIdx + 5) % 6));
      $('#sheet-next').addEventListener('click', () => openSheet((openIdx + 1) % 6));
      addEventListener('keydown', (e) => { if (e.key === 'Escape' && QX.current() === 's3') closeSheet(); });
    },
    render() {
      const L = t(), ar = QX.lang() === 'ar';
      $$('#s3 [data-t]').forEach((el) => { const v = L[el.dataset.t]; if (typeof v === 'string') el.textContent = v; });
      $('#l-title').innerHTML = ar ? L.lessonTitle[0] + ' <b style="display:inline">' + L.lessonTitle[1] + '</b>' : '<b>' + L.lessonTitle[0] + '</b>' + L.lessonTitle[1];
      filmCtl.load();
      $('#tiles').innerHTML = L.p.map((p, i) =>
        '<button type="button" class="tile' + (seen.has(i) ? ' is-seen' : '') + '" data-i="' + i + '">' +
        '<span class="tile__leaf" style="background:' + ART[i].col + '">' + ic(ART[i].icon + '-duotone') + '</span>' +
        '<span class="tile__seen">' + ic('Check-bold') + '</span>' +
        '<span class="tile__num">' + QX.num(i) + '</span><h3 class="tile__name">' + p[0] + '</h3>' +
        '<span class="chip tile__tag">' + p[4] + '</span></button>').join('');
      $$('#s3 .tile').forEach((b) => b.addEventListener('click', () => openSheet(+b.dataset.i, b)));
      if (openIdx >= 0) fillSheet(openIdx);
      ring();
    },
    enter(resume, o) {
      setStep(step);
      if (step === 1 && !filmCtl.done) filmCtl.start();
      else if (step === 2 && !o.lang && !STILL) speak(t().promptCards);
      const p = new URLSearchParams(location.search);
      if (p.get('open') && QX.current() === 's3') { const i = +p.get('open'); filmCtl.done = true; setStep(2); openSheet(i, $('.tile[data-i="' + i + '"]')); stopVoice(); if (sceneTl) sceneTl.progress(1); }
      if (!G || reduce || STILL || o.lang) return;
      const tl = G.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('#s3 .chips .chip', { y: 12, opacity: 0, duration: .6, stagger: .08 })
        .from('#l-title', { x: QX.lang() === 'ar' ? 40 : -40, opacity: 0, duration: .9 }, .1);
      if (step === 1) tl.from('#s3 .intro-card', { y: 30, opacity: 0, rotate: -3, duration: 1 }, .3).from('#player', { y: 40, opacity: 0, rotate: 3, duration: 1.1 }, .45);
    },
    leave() { filmCtl.stop(); closeSheet(true); },
    resize: scaleScene,
    canNext: () => step === 1 ? filmCtl.done : seen.size === 6,
    next() { if (step === 1 && filmCtl.done) { filmCtl.stop(); setStep(2); return true; } return false; },
    prev() { if (step === 2) { setStep(1); return true; } return false; },
    hint() {
      const L = t(), left = 6 - seen.size;
      return step === 1 ? (filmCtl.done ? QX.T().hintDone : L.hintScene) : (left ? L.hintCards(left) : QX.T().hintDone);
    },
    done: () => filmCtl.done && seen.size === 6,
    getState: () => ({ step, filmDone: filmCtl.done, seen: [...seen] }),
    setState(s) { step = s.step === 2 ? 2 : 1; (s.seen || []).forEach((n) => seen.add(n)); filmCtl.done = !!s.filmDone; }
  });
})();
