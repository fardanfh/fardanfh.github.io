(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';
  const hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';

  // Theme
  const themeToggle = document.querySelector('.theme-toggle');
  const storedTheme = localStorage.getItem('portfolio-theme');
  if (storedTheme === 'dark' || storedTheme === 'light') root.dataset.theme = storedTheme;

  const updateThemeLabel = () => {
    const dark = root.dataset.theme === 'dark';
    themeToggle?.setAttribute('aria-label', dark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#111210' : '#f7f7f2');
  };
  updateThemeLabel();

  themeToggle?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('portfolio-theme', root.dataset.theme);
    updateThemeLabel();
  });

  // Loader
  const loader = document.querySelector('.loader');
  const loaderTrack = document.querySelector('.loader__track span');
  const loaderCount = document.querySelector('.loader__meta strong');

  function hideLoader() {
    if (!loader) return;
    if (hasGSAP && !reducedMotion) {
      const counter = { value: 0 };
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.to(counter, {
        value: 100,
        duration: 1.15,
        onUpdate: () => { if (loaderCount) loaderCount.textContent = Math.round(counter.value); }
      }, 0)
        .to(loaderTrack, { width: '100%', duration: 1.15 }, 0)
        .to('.loader__brand', { y: -15, opacity: 0, duration: .45 }, 1.05)
        .to('.loader__meta, .loader__track', { opacity: 0, duration: .3 }, 1.05)
        .to(loader, { yPercent: -100, duration: .85, ease: 'power4.inOut' }, 1.25)
        .set(loader, { display: 'none' })
        .add(heroIntro, 1.45);
    } else {
      loader.style.display = 'none';
      heroIntro();
    }
  }

  if (document.readyState === 'complete') hideLoader();
  else window.addEventListener('load', hideLoader, { once: true });

  function heroIntro() {
    if (!hasGSAP || reducedMotion) return;
    gsap.set(['.hero__name-outline', '.hero__name-solid', '.hero__portrait', '.hero__intro', '.hero__links a', '.hero__eyebrow', '.hero__stats', '.scroll-cue'], { opacity: 0 });
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.fromTo('.hero__name-outline', { xPercent: -35, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 1.15 }, 0)
      .fromTo('.hero__name-solid', { xPercent: 35, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 1.15 }, 0)
      .fromTo('.hero__portrait', { yPercent: 24, opacity: 0, scale: .94 }, { yPercent: 0, opacity: 1, scale: 1, duration: 1.25 }, .18)
      .fromTo('.hero__eyebrow', { y: -14, opacity: 0 }, { y: 0, opacity: 1, duration: .7 }, .42)
      .fromTo('.hero__intro', { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: .8 }, .58)
      .fromTo('.hero__links a', { x: 25, opacity: 0 }, { x: 0, opacity: 1, stagger: .08, duration: .65 }, .62)
      .fromTo('.hero__stats', { y: -15, opacity: 0 }, { y: 0, opacity: 1, duration: .7 }, .72)
      .fromTo('.scroll-cue', { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: .6 }, .9);
  }

  // Menu
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  function setMenu(open) {
    menuToggle?.setAttribute('aria-expanded', String(open));
    menuToggle?.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    mobileMenu?.classList.toggle('is-open', open);
    body.classList.toggle('menu-open', open);
  }
  menuToggle?.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
  mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });

  // Header, progress, active navigation
  const header = document.querySelector('.site-header');
  const progressBar = document.querySelector('.scroll-progress span');
  const navLinks = [...document.querySelectorAll('.desktop-nav a')];
  const sections = [...document.querySelectorAll('main section[id]')];

  function onScroll() {
    const y = window.scrollY;
    header?.classList.toggle('is-scrolled', y > 12);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;

    let activeId = '';
    sections.forEach(section => {
      if (y >= section.offsetTop - window.innerHeight * .35) activeId = section.id;
    });
    navLinks.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${activeId}`));
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Lenis smooth scroll
  if (!reducedMotion && typeof window.Lenis !== 'undefined') {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: .9 });
    if (hasScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
    const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', event => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) { event.preventDefault(); lenis.scrollTo(target, { offset: -65 }); }
      });
    });
  }

  // Custom cursor
  const cursor = document.querySelector('.cursor');
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorLabel = cursor?.querySelector('span');
  if (finePointer && cursor && cursorDot && !reducedMotion) {
    let mouseX = innerWidth / 2, mouseY = innerHeight / 2;
    let cursorX = mouseX, cursorY = mouseY;
    window.addEventListener('pointermove', event => { mouseX = event.clientX; mouseY = event.clientY; cursorDot.style.left = `${mouseX}px`; cursorDot.style.top = `${mouseY}px`; });
    const renderCursor = () => {
      cursorX += (mouseX - cursorX) * .16;
      cursorY += (mouseY - cursorY) * .16;
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
      requestAnimationFrame(renderCursor);
    };
    renderCursor();
    document.querySelectorAll('a, button, [role="button"]').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-link'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-link'));
    });
    document.querySelectorAll('.cursor-view').forEach(el => {
      el.addEventListener('mouseenter', () => { cursor.classList.remove('is-link'); cursor.classList.add('is-view'); cursorLabel.textContent = 'VIEW'; });
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-view'));
    });
  }

  // Magnetic elements
  if (finePointer && !reducedMotion) {
    document.querySelectorAll('.magnetic').forEach(element => {
      element.addEventListener('pointermove', event => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        if (hasGSAP) gsap.to(element, { x: x * .18, y: y * .22, duration: .35, ease: 'power2.out' });
        else element.style.transform = `translate(${x * .18}px, ${y * .22}px)`;
      });
      element.addEventListener('pointerleave', () => {
        if (hasGSAP) gsap.to(element, { x: 0, y: 0, duration: .55, ease: 'elastic.out(1,.45)' });
        else element.style.transform = '';
      });
    });
  }

  // Hero pointer parallax and spotlight
  const hero = document.querySelector('.hero');
  if (hero && finePointer && !reducedMotion) {
    hero.addEventListener('pointermove', event => {
      const rect = hero.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      hero.style.setProperty('--mouse-x', `${px * 100}%`);
      hero.style.setProperty('--mouse-y', `${py * 100}%`);
      document.querySelectorAll('[data-parallax]').forEach(el => {
        const amount = Number(el.dataset.parallax || 0);
        const x = (px - .5) * 100 * amount;
        const y = (py - .5) * 70 * amount;
        if (hasGSAP) gsap.to(el, { x, y, duration: 1, ease: 'power3.out' });
      });
    });
  }

  // Role rotator
  const roleEl = document.querySelector('.role-rotate');
  const roles = ['System Analyst', 'IT Support Specialist', 'Web Developer', 'Improvement System'];
  let roleIndex = 0;
  if (roleEl && !reducedMotion) {
    setInterval(() => {
      roleIndex = (roleIndex + 1) % roles.length;
      if (hasGSAP) {
        gsap.to(roleEl, { y: -10, opacity: 0, duration: .25, onComplete: () => {
          roleEl.textContent = roles[roleIndex];
          gsap.fromTo(roleEl, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: .35 });
        }});
      } else roleEl.textContent = roles[roleIndex];
    }, 2500);
  }

  // Canvas network background
  const canvas = document.querySelector('.hero__canvas');
  if (canvas && !reducedMotion) {
    const ctx = canvas.getContext('2d');
    let width = 0, height = 0, dpr = Math.min(devicePixelRatio, 2);
    let mouse = { x: -9999, y: -9999 };
    let particles = [];

    const resize = () => {
      width = canvas.clientWidth; height = canvas.clientHeight;
      canvas.width = width * dpr; canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(72, Math.max(28, Math.floor(width / 24)));
      particles = Array.from({ length: count }, () => ({ x: Math.random() * width, y: Math.random() * height, vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .18, r: Math.random() * 1.3 + .35 }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const dark = root.dataset.theme === 'dark';
      const dotColor = dark ? 'rgba(255,255,255,.22)' : 'rgba(21,21,21,.18)';
      const lineColor = dark ? 'rgba(255,255,255,.055)' : 'rgba(21,21,21,.055)';
      particles.forEach((p, index) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        const md = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (md < 120) { p.x += (p.x - mouse.x) * .002; p.y += (p.y - mouse.y) * .002; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = dotColor; ctx.fill();
        for (let j = index + 1; j < particles.length; j++) {
          const q = particles[j]; const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 105) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.strokeStyle = lineColor; ctx.globalAlpha = 1 - d / 105; ctx.stroke(); ctx.globalAlpha = 1; }
        }
      });
      requestAnimationFrame(draw);
    };
    hero?.addEventListener('pointermove', e => { const r = canvas.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; });
    hero?.addEventListener('pointerleave', () => { mouse = { x: -9999, y: -9999 }; });
    window.addEventListener('resize', resize);
    resize(); draw();
  }

  // Card spotlight + tilt
  document.querySelectorAll('.interactive-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left; const y = event.clientY - rect.top;
      card.style.setProperty('--card-x', `${x}px`); card.style.setProperty('--card-y', `${y}px`);
      if (!finePointer || reducedMotion || card.classList.contains('project-card') === false) return;
      const rx = ((y / rect.height) - .5) * -4;
      const ry = ((x / rect.width) - .5) * 5;
      if (hasGSAP) gsap.to(card, { rotateX: rx, rotateY: ry, duration: .5, ease: 'power2.out', transformPerspective: 1000 });
    });
    card.addEventListener('pointerleave', () => {
      if (hasGSAP) gsap.to(card, { rotateX: 0, rotateY: 0, duration: .8, ease: 'elastic.out(1,.5)' });
    });
  });

  // Accordion
  document.querySelectorAll('.skill-item').forEach((item, index) => {
    const button = item.querySelector('button');
    const content = item.querySelector('.skill-item__content');
    if (index === 0 && content) content.style.height = `${content.scrollHeight}px`;
    button?.addEventListener('click', () => {
      const open = item.classList.contains('is-open');
      document.querySelectorAll('.skill-item').forEach(other => {
        other.classList.remove('is-open');
        other.querySelector('button')?.setAttribute('aria-expanded', 'false');
        const otherContent = other.querySelector('.skill-item__content');
        if (otherContent) otherContent.style.height = '0px';
      });
      if (!open) {
        item.classList.add('is-open'); button.setAttribute('aria-expanded', 'true');
        content.style.height = `${content.scrollHeight}px`;
      }
    });
  });

  // Project modal
  const modal = document.querySelector('.project-modal');
  const modalClose = document.querySelector('.project-modal__close');
  const projectData = {
    'testing-system': {
      title: 'Sistem Pengajuan Pengujian', category: 'Web Application', year: '2024',
      description: 'Aplikasi website untuk proses pengajuan pengujian yang dikembangkan berdasarkan kebutuhan pengadaan UPTD Laboratorium Konstruksi Jawa Barat.',
      role: 'Freelance Web Developer', focus: 'Digital workflow', tools: 'Web stack & database',
      outcome: 'Membantu mengubah proses pengajuan menjadi alur digital yang lebih terstruktur dan mudah ditelusuri.'
    },
    'internal-systems': {
      title: 'Website Divisi & Client', category: 'Internal & Client Systems', year: '2024',
      description: 'Pengembangan aplikasi website untuk kebutuhan divisi internal perusahaan dan kebutuhan client, sekaligus dukungan maintenance perangkat IT dan jaringan.',
      role: 'Web Developer & IT Support', focus: 'Internal operations', tools: 'PHP, Laravel, WordPress',
      outcome: 'Memberikan dukungan digital dan teknis agar kebutuhan informasi serta operasional pengguna berjalan lebih lancar.'
    }
  };

  function openProject(key) {
    const data = projectData[key]; if (!data || !modal) return;
    modal.querySelector('#modal-title').textContent = data.title;
    modal.querySelector('#modal-category').textContent = data.category;
    modal.querySelector('#modal-year').textContent = data.year;
    modal.querySelector('#modal-description').textContent = data.description;
    modal.querySelector('#modal-role').textContent = data.role;
    modal.querySelector('#modal-focus').textContent = data.focus;
    modal.querySelector('#modal-tools').textContent = data.tools;
    modal.querySelector('#modal-outcome').textContent = data.outcome;
    modal.showModal();
    if (hasGSAP && !reducedMotion) gsap.fromTo(modal, { y: 35, opacity: 0, scale: .97 }, { y: 0, opacity: 1, scale: 1, duration: .45, ease: 'power3.out' });
  }
  document.querySelectorAll('[data-project]').forEach(card => {
    card.addEventListener('click', () => openProject(card.dataset.project));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProject(card.dataset.project); } });
  });
  modalClose?.addEventListener('click', () => modal.close());
  modal?.addEventListener('click', event => { const r = modal.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) modal.close(); });

  // GSAP scroll animations
  if (hasGSAP && hasScrollTrigger && !reducedMotion) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.reveal-title').forEach(title => {
      gsap.from(title, { y: 70, opacity: 0, duration: 1.05, ease: 'power4.out', scrollTrigger: { trigger: title, start: 'top 85%' } });
    });
    gsap.utils.toArray('.reveal-fade').forEach(el => {
      gsap.from(el, { y: 28, opacity: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });
    gsap.utils.toArray('.project-card').forEach((card, i) => {
      gsap.from(card, { y: 70, opacity: 0, rotateX: 7, duration: 1, delay: i * .08, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 88%' } });
    });
    gsap.utils.toArray('.timeline-item').forEach(item => {
      gsap.from(item.querySelector('.timeline-item__content'), { x: 55, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 82%', onEnter: () => item.classList.add('is-active'), onLeaveBack: () => item.classList.remove('is-active') } });
    });
    gsap.to('.timeline__line span', { height: '100%', ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 65%', end: 'bottom 65%', scrub: true } });
    gsap.from('.education-card', { y: 45, opacity: 0, stagger: .12, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.education-list', start: 'top 82%' } });
    gsap.from('.certification-list span', { y: 20, opacity: 0, stagger: .05, duration: .55, ease: 'power2.out', scrollTrigger: { trigger: '.certification-list', start: 'top 90%' } });
    gsap.to('.contact-section__orb', { xPercent: -18, yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.contact-section', start: 'top bottom', end: 'bottom top', scrub: 1 } });

    document.querySelectorAll('[data-counter]').forEach(counter => {
      const target = Number(counter.dataset.counter);
      const decimals = Number(counter.dataset.decimals || 0);
      const obj = { value: 0 };
      gsap.to(obj, { value: target, duration: 1.6, ease: 'power2.out', onUpdate: () => { counter.textContent = obj.value.toFixed(decimals); }, scrollTrigger: { trigger: counter, start: 'top 92%', once: true } });
    });
  } else {
    document.querySelectorAll('[data-counter]').forEach(counter => { counter.textContent = Number(counter.dataset.counter).toFixed(Number(counter.dataset.decimals || 0)); });
  }
})();
