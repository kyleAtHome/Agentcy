(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const topbar = document.querySelector('.topbar');
  const wordmark = document.querySelector('.matrix-wordmark');
  const chars = [...document.querySelectorAll('.matrix-wordmark .matrix-char')];
  const codes = chars.map(el => el.querySelector('.matrix-code'));
  const morph = document.querySelector('.hero-morph');
  const morphSource = document.querySelector('.hero-morph-source');
  const morphLogo = document.querySelector('.hero-morph-logo');
  const morphGlitch = [...document.querySelectorAll('.hero-morph-glitch')];
  const navLinks = document.querySelector('.topnav');
  const menu = document.querySelector('.menu-toggle');
  const duration = 1200;
  const glyphs = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!?:;+-=*/_[]{}()<>|#$%&@^~アイウエオカキクケコサシスセソタチツテトナニヌネノあいうえおかきくけこさしすせそたちつてとなにぬねの漢字人工知能未来世界情報機械学習中文系统网络连接数据中国龙门天地風水火山川海空星光雨雪电脑科技智能變數學習韓國한글αβγδεζηθλμξπρσφχψωΔΘΛΞΠΣΦΨΩ∞≠≤≥±×÷√∫∑∆');
  let sticky = false;
  let morphCompleted = false;
  let morphStartedAt = 0;
  let morphStartProgress = 0;
  let morphFrame = 0;
  let lastScrollY = window.scrollY;

  function animateWordmark(now, start) {
    const p = Math.min(1, (now - start) / duration);
    chars.forEach((char, i) => {
      const local = Math.max(0, Math.min(1, (p - i * .095) / .31));
      const code = codes[i];
      if (code && now >= Number(char.dataset.nextGlyphAt || 0)) {
        const pick = glyphs[Math.floor(Math.random() * glyphs.length)];
        code.textContent = pick === code.textContent && glyphs.length > 1
          ? glyphs[(glyphs.indexOf(pick) + 1 + Math.floor(Math.random() * (glyphs.length - 1))) % glyphs.length]
          : pick;
        char.dataset.nextGlyphAt = String(now + 190);
      }
      if (local >= 1) {
        char.classList.remove('is-decoding', 'is-pending');
        char.classList.add('is-decoded');
      } else if (local <= 0) {
        char.classList.remove('is-decoding', 'is-decoded');
        char.classList.add('is-pending');
      } else {
        char.classList.remove('is-pending', 'is-decoded');
        char.classList.add('is-decoding');
      }
    });
    if (p < 1) requestAnimationFrame(next => animateWordmark(next, start));
    else chars.forEach(char => {
      char.classList.remove('is-decoding', 'is-pending');
      char.classList.add('is-decoded');
    });
  }

  function setSticky(on) {
    if (sticky === on || !topbar) return;
    sticky = on;
    topbar.classList.toggle('is-sticky', on);
    topbar.classList.toggle('nav-links-ready', on);
  }

  function advanceMorphToCompletion() {
    morphFrame = 0;
    if (!morphCompleted) return;
    updateScroll();
    if (morphCompleted && performance.now() - morphStartedAt < 440) {
      morphFrame = requestAnimationFrame(advanceMorphToCompletion);
    }
  }

  function updateScroll() {
    const y = window.scrollY;
    const morphRect = morph ? morph.getBoundingClientRect() : null;
    const activationLine = innerHeight * .28;
    const rawProgress = reduceMotion || !morphRect ? 0 : Math.max(0, Math.min(1, (activationLine - morphRect.top) / activationLine));
    const scrollingDown = y > lastScrollY;
    if (scrollingDown && rawProgress > .025 && !morphCompleted) {
      morphCompleted = true;
      morphStartProgress = rawProgress;
      morphStartedAt = performance.now();
      if (!morphFrame) morphFrame = requestAnimationFrame(advanceMorphToCompletion);
    }
    if (!scrollingDown && morphRect && morphRect.top > activationLine) {
      morphCompleted = false;
      morphStartProgress = 0;
      if (morphFrame) cancelAnimationFrame(morphFrame);
      morphFrame = 0;
    }
    const autoT = morphCompleted ? Math.min(1, (performance.now() - morphStartedAt) / 440) : 0;
    const autoEase = autoT * autoT * (3 - 2 * autoT);
    const progress = morphCompleted ? morphStartProgress + (1 - morphStartProgress) * autoEase : rawProgress;
    if (morph) {
      morph.style.setProperty('--morph-progress', progress.toFixed(4));
      if (morphSource) {
        morphSource.style.opacity = String(1 - progress);
        morphSource.style.transform = `scale(${1 - progress * .28}, ${1 - progress * .08})`;
      }
      if (morphLogo) {
        const eased = progress * progress * (3 - 2 * progress);
        morphLogo.style.opacity = String(eased);
        morphLogo.style.transform = `translateY(var(--logo-offset, 0px)) scale(${.94 + eased * .06}, ${.94 + eased * .06})`;
      }
      morph.classList.toggle('is-glitching', progress > .025 && progress < .99);
      morphGlitch.forEach(layer => { layer.style.opacity = String(Math.min(1, progress * (1 - progress) * 4)); });
    }
    setSticky(Boolean(morphRect && morphRect.top <= 0));
    document.documentElement.style.setProperty('--scroll', `${(y / Math.max(1, document.documentElement.scrollHeight - innerHeight)) * 100}%`);
    const art = document.querySelector('.hero-art');
    if (art && !reduceMotion) {
      const rect = art.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, (innerHeight * .55 - rect.top) / (innerHeight + rect.height)));
      art.style.setProperty('--p', progress.toFixed(3));
    }
    lastScrollY = y;
  }

  if (menu) menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    navLinks?.classList.toggle('is-open', open);
  });
  navLinks?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    menu?.setAttribute('aria-expanded', 'false');
    menu?.setAttribute('aria-label', 'Open navigation');
  }));

  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  }), { threshold: .12 });
  document.querySelectorAll('.manifesto-content, .services-heading, .service-card, .quote-grid, .contact-content').forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

  document.querySelectorAll('.motion-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      if (reduceMotion) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      card.style.setProperty('--tilt', `${x * 5}deg`);
    });
    card.addEventListener('pointerleave', () => card.style.setProperty('--tilt', '0deg'));
  });

  if (!reduceMotion && wordmark && chars.length) {
    chars.forEach(char => char.classList.add('is-pending'));
    requestAnimationFrame(start => animateWordmark(start, start));
  } else {
    chars.forEach(char => char.classList.add('is-decoded'));
  }
  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('resize', updateScroll);
  updateScroll();
})();
