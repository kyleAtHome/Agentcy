(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.topnav');
  const meter = document.querySelector('.scroll-meter');
  const heroArt = document.querySelector('.hero-art');
  const orbitalGraphic = heroArt?.querySelector('.orbital-art');
  const orbitRings = heroArt?.querySelector('.orbit-rings');
  const ribbonGroup = heroArt?.querySelector('.ribbon-group');
  const waypointGroup = heroArt?.querySelector('.waypoints');
  const limeWaypoint = heroArt?.querySelector('.waypoint-lime');
  const targetMark = heroArt?.querySelector('.target-mark');

  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav?.classList.toggle('is-open', open);
  });

  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Open navigation');
  }));

  const revealTargets = document.querySelectorAll('.section-kicker, .manifesto-content, .services-heading, .service-card, .quote-grid, .contact-content');
  revealTargets.forEach((element, index) => {
    element.classList.add('reveal');
    element.style.transitionDelay = `${Math.min(index % 3, 2) * 75}ms`;
  });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealTargets.forEach((element) => revealObserver.observe(element));
  } else {
    revealTargets.forEach((element) => element.classList.add('is-visible'));
  }

  if (reducedMotion) return;

  let frame = 0;
  let smoothedProgress = 0;
  let targetProgress = 0;
  const updateScrollMotion = () => {
    frame = 0;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    meter?.style.setProperty('--scroll', `${progress}%`);

    if (heroArt) {
      const rect = heroArt.getBoundingClientRect();
      const documentTop = rect.top + window.scrollY;
      const travelDistance = Math.max(1, documentTop + rect.height - window.innerHeight * 0.12);
      targetProgress = Math.max(0, Math.min(1, window.scrollY / travelDistance));
      smoothedProgress += (targetProgress - smoothedProgress) * 0.12;
      if (Math.abs(targetProgress - smoothedProgress) < 0.001) smoothedProgress = targetProgress;
      const scrollProgress = smoothedProgress;
      heroArt.style.setProperty('--scroll-progress', scrollProgress.toFixed(3));
      orbitalGraphic.style.transform = `translate3d(0, ${scrollProgress * 24}px, 0) rotate(${-scrollProgress * 4}deg)`;
      orbitRings.style.transform = `rotate(${scrollProgress * 78}deg)`;
      ribbonGroup.style.transform = `translateY(${scrollProgress * 18}px) rotate(${-scrollProgress * 9}deg)`;
      waypointGroup.style.transform = `translate(${scrollProgress * 16}px, ${-scrollProgress * 13}px)`;
      limeWaypoint.style.transform = `translate(${-scrollProgress * 35}px, ${scrollProgress * 25}px) scale(${1 - scrollProgress * 0.12})`;
      targetMark.style.transform = `translate(${-scrollProgress * 13}px, ${scrollProgress * 18}px)`;
      if (Math.abs(targetProgress - smoothedProgress) >= 0.001 && !frame) {
        frame = window.requestAnimationFrame(updateScrollMotion);
      }
    }

    document.querySelectorAll('.service-card').forEach((card) => {
      const rect = card.getBoundingClientRect();
      const normalized = Math.max(-1, Math.min(1, (window.innerHeight * 0.6 - rect.top) / (window.innerHeight * 1.7)));
      card.style.setProperty('--tilt', `${(normalized * 7).toFixed(2)}deg`);
    });
  };

  const requestScrollUpdate = () => {
    if (!frame) frame = window.requestAnimationFrame(updateScrollMotion);
  };
  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate, { passive: true });
  updateScrollMotion();
})();
