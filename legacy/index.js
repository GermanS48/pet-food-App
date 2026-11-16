/* Portada: galería de destacados y videos decorativos. */
(function () {
  'use strict';

  const SLIDE_INTERVAL = 5000;

  function createSlide(item, index) {
    const slide = document.createElement('div');
    slide.className = 'slide';
    slide.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
    if (index === 0) slide.classList.add('active');

    const image = document.createElement('img');
    image.src = item['poly-component__picture src'] || '';
    image.alt = item['poly-component__title'] || 'Producto destacado';
    image.loading = index === 0 ? 'eager' : 'lazy';
    image.decoding = 'async';

    const link = document.createElement('a');
    link.className = 'slide-title-link';
    link.href = item['poly-component__title href'] || '#';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = item['poly-component__title'] || 'Ver producto';

    slide.append(image, link);
    return slide;
  }

  function startSlideshow(container, slides) {
    let current = 0;
    let timer = null;

    function showNextSlide() {
      slides[current].classList.remove('active');
      slides[current].setAttribute('aria-hidden', 'true');

      current = (current + 1) % slides.length;

      slides[current].classList.add('active');
      slides[current].setAttribute('aria-hidden', 'false');
    }

    function startTimer() {
      if (slides.length > 1) timer = setInterval(showNextSlide, SLIDE_INTERVAL);
    }

    function stopTimer() {
      clearInterval(timer);
      timer = null;
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stopTimer();
      } else if (!timer) {
        startTimer();
      }
    });

    startTimer();
  }

  async function loadGallery() {
    const container = document.getElementById('slideshow');
    if (!container) return;

    try {
      const response = await fetch('./galeria.json');
      if (!response.ok) throw new Error('HTTP ' + response.status);

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Formato de galería inválido');

      const fragment = document.createDocumentFragment();
      const seen = new Set();

      data.forEach(function (item) {
        const title = item['poly-component__title'] || '';
        const image = item['poly-component__picture src'] || '';
        if (!image || seen.has(title + '|' + image)) return;
        seen.add(title + '|' + image);

        fragment.appendChild(createSlide(item, seen.size - 1));
      });

      if (!fragment.childNodes.length) return;

      container.appendChild(fragment);
      startSlideshow(container, Array.from(container.querySelectorAll('.slide')));
    } catch (error) {
      console.error('Error al cargar la galería:', error);
    }
  }

  function initVideos() {
    const videos = Array.from(document.querySelectorAll('video[data-autoplay]'));
    if (!videos.length) return;

    const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isSmallScreen || prefersReducedMotion) return; // Se mantiene el póster.

    if (!('IntersectionObserver' in window)) {
      videos.forEach(function (video) {
        video.play().catch(function () {});
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.play().catch(function () {});
          } else {
            entry.target.pause();
          }
        });
      },
      { threshold: 0.25 }
    );

    videos.forEach(function (video) {
      observer.observe(video);
    });
  }

  loadGallery();
  initVideos();
})();
