console.log("Portafolio cargado correctamente");

document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------
  // Detección de entrada: táctil vs ratón
  // ---------------------------
  let inputMode = "mouse"; // 'mouse' | 'touch'

  function setInputMode(mode) {
    if (inputMode === mode) return;
    inputMode = mode;
    document.body.classList.toggle('input-touch', mode === 'touch');
    document.body.classList.toggle('input-mouse', mode === 'mouse');
    const c = document.getElementById('metaball-cursor');
    if (c) {
      if (mode === 'touch') {
        c.style.display = 'none';
      } else {
        c.style.display = 'block';
      }
    }
  }

  // Estado inicial según media queries
  try {
    const prefersTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    setInputMode(prefersTouch ? 'touch' : 'mouse');
  } catch (_) {}

  // Cambios dinámicos por eventos de puntero
  window.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch' || e.pointerType === 'pen') setInputMode('touch');
  }, { passive: true });
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse') setInputMode('mouse');
  }, { passive: true });

  // ---------------------------
  // Scroll balls: navegación y activación por scroll
  // ---------------------------
  const balls = document.querySelectorAll('.scroll-balls .ball[data-section]');
  let isManualScroll = false;

  function setActiveBallById(activeId) {
    balls.forEach(ball => {
      ball.classList.toggle('active', ball.dataset.section === activeId);
    });
  }

  // Click para navegar suavemente
  balls.forEach(ball => {
    ball.addEventListener('click', e => {
      e.preventDefault();
      const section = document.getElementById(ball.dataset.section);
      if (!section) return;
      isManualScroll = true;
      section.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setActiveBallById(ball.dataset.section);
      setTimeout(() => { isManualScroll = false; }, 1000);
    });
  });

  // Activación con IntersectionObserver
  const observedSections = [];
  balls.forEach(ball => {
    const sec = document.getElementById(ball.dataset.section);
    if (sec) observedSections.push(sec);
  });

  if (observedSections.length > 0 && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (isManualScroll) return;
      let best = null;
      entries.forEach(en => {
        if (en.isIntersecting) {
          if (!best || en.intersectionRatio > best.intersectionRatio) best = en;
        }
      });
      if (best) setActiveBallById(best.target.id);
    }, { threshold: [0.25, 0.5, 0.75] });

    observedSections.forEach(sec => io.observe(sec));
  } else {
    function updateActiveBallFallback() {
      if (isManualScroll) return;
      const mid = window.scrollY + window.innerHeight / 2;
      let activeId = null;
      observedSections.forEach(sec => {
        const r = sec.getBoundingClientRect();
        const top = r.top + window.scrollY;
        const bottom = r.bottom + window.scrollY;
        if (mid >= top && mid < bottom) activeId = sec.id;
      });
      if (activeId) setActiveBallById(activeId);
    }
    window.addEventListener('scroll', updateActiveBallFallback);
    updateActiveBallFallback();
  }

  // ---------------------------
  // Cursor Metaball
  // ---------------------------
  const canvas = document.getElementById("metaball-cursor");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    window.addEventListener("resize", () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    });

    let mouse = { x: width / 2, y: height / 2, speedX: 0, speedY: 0 };
    let target = { x: mouse.x, y: mouse.y };
    let lastMouse = { x: mouse.x, y: mouse.y };
    let ballSize = 15;
    let targetBallSize = ballSize;
    const ballSizeSpeed = 0.1;
    const metaballColor = "#ccff00";
    let isHoveringInteractiveElement = false;

    document.querySelectorAll("a, button, .clickable, .carousel-indicators .indicator").forEach(element => {
      element.addEventListener("mouseenter", () => isHoveringInteractiveElement = true);
      element.addEventListener("mouseleave", () => isHoveringInteractiveElement = false);
    });

    // Manejo de eventos de mouse y táctiles para móvil
    function updateTargetPosition(x, y) {
      target.x = x;
      target.y = y;
    }

    let isTouching = false;
    let lastTouchPosition = { x: width / 2, y: height / 2 };

    document.addEventListener("mousemove", (e) => {
      if (!isTouching) {
        updateTargetPosition(e.clientX, e.clientY);
      }
    });

    // Eventos táctiles para móvil - sin preventDefault para permitir scroll
    document.addEventListener("touchstart", (e) => {
      isTouching = true;
      const touch = e.touches[0];
      lastTouchPosition.x = touch.clientX;
      lastTouchPosition.y = touch.clientY;
      updateTargetPosition(touch.clientX, touch.clientY);
    });

    document.addEventListener("touchmove", (e) => {
      if (isTouching) {
        const touch = e.touches[0];
        lastTouchPosition.x = touch.clientX;
        lastTouchPosition.y = touch.clientY;
        updateTargetPosition(touch.clientX, touch.clientY);
      }
    });

    document.addEventListener("touchend", () => {
      isTouching = false;
    });

    // Actualizar posición durante scroll en móvil
    window.addEventListener("scroll", () => {
      if (isTouching) {
        // Mantener el metaball en la última posición táctil durante el scroll
        updateTargetPosition(lastTouchPosition.x, lastTouchPosition.y);
      }
    });

    function animate() {
      ctx.clearRect(0, 0, width, height);
      mouse.x += (target.x - mouse.x) * 0.2;
      mouse.y += (target.y - mouse.y) * 0.2;

      mouse.speedX = mouse.x - lastMouse.x;
      mouse.speedY = mouse.y - lastMouse.y;

      const multiplier = 1.8;
      const maxStretch = 30;
      const stretchX = Math.min(Math.abs(mouse.speedX) * multiplier, maxStretch);
      const stretchY = Math.min(Math.abs(mouse.speedY) * multiplier, maxStretch);

      targetBallSize = isHoveringInteractiveElement ? Math.min(50, 35 + (stretchX + stretchY) / 3) : 15;
      ballSize += (targetBallSize - ballSize) * ballSizeSpeed;

      ctx.save();
      ctx.translate(mouse.x, mouse.y);
      ctx.lineWidth = 3;
      ctx.strokeStyle = metaballColor;
      ctx.beginPath();
      ctx.arc(0, 0, ballSize, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(mouse.x, mouse.y);
      ctx.scale(1 + stretchX / 20, 1 + stretchY / 20);
      ctx.beginPath();
      ctx.arc(0, 0, ballSize, 0, Math.PI * 2);
      ctx.fillStyle = metaballColor;
      ctx.fill();
      ctx.restore();

      lastMouse.x = mouse.x;
      lastMouse.y = mouse.y;
      requestAnimationFrame(animate);
    }
    animate();
  }

  // ---------------------------
  // Loader barra de progreso
  // ---------------------------
  const progressBar = document.querySelector(".progress-bar");
  const loader = document.getElementById("loader");
  const loaderText = document.querySelector(".loader-text");
  const caraContainer = document.getElementById("cara-container");

  if (progressBar) {
    setTimeout(() => {
      progressBar.style.width = "100%";
    }, 500);

    progressBar.addEventListener("transitionend", () => {
      if (loaderText) {
        loaderText.textContent = "Done! :)";
        loaderText.classList.add("done-animate");

        requestAnimationFrame(() => {
          loaderText.classList.add("show");
        });

        setTimeout(() => {
          if (caraContainer) {
            caraContainer.style.opacity = 1;
            caraContainer.classList.add("zoomIn");
          }
        }, 100);
      }
    });
  }

//*cortinillas*//
  document.addEventListener("DOMContentLoaded", () => {
    const isIndex = window.location.pathname.endsWith("index.html") || window.location.pathname === "/";
    const fullLoader = document.getElementById("loader");
    const simpleLoader = document.getElementById("simple-loader");

    if (!isIndex && simpleLoader) {
      // Cortinilla solo en páginas que NO son index
      setTimeout(() => {
        simpleLoader.remove();
      }, 1600); // Match con duración total del slideInOut
    }
  });



  if (loader) {
    setTimeout(() => {
      loader.classList.add("loader--hide");
      loader.addEventListener("animationend", () => {
        loader.remove();
      });
    }, 3050);
  }

  // --- Carrusel especial proyectos-carousel ---
  // Sin autoplay
  (() => {
    const container = document.getElementById('proyectos-carousel');
    if (!container) return;

    const slides = container.querySelectorAll('.carousel-slide');
    const indicators = container.querySelectorAll('.carousel-indicators .indicator');
    const nextBtn = container.querySelector('.carousel-nav .next');
    const prevBtn = container.querySelector('.carousel-nav .prev');
    let currentIndex = 0;

    function updateCarousel(index) {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
      indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
      });
      currentIndex = index;
    }

    indicators.forEach((indicator, i) => {
      indicator.addEventListener('click', () => updateCarousel(i));
    });

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        updateCarousel((currentIndex + 1) % slides.length);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        updateCarousel((currentIndex - 1 + slides.length) % slides.length);
      });
    }

    updateCarousel(0);

    // Click en slide activo para pantalla completa (imágenes y videos)
    const openProjector = (() => {
      let overlay;
      let content;
      let closeBtn;
      function ensureOverlay() {
        if (overlay) return overlay;
        overlay = document.createElement('div');
        overlay.className = 'lightbox-overlay';
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.background = 'rgba(0,0,0,0.9)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '2147483646';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity .2s ease';

        content = document.createElement('div');
        content.style.maxWidth = '92vw';
        content.style.maxHeight = '92vh';
        content.style.display = 'flex';
        content.style.alignItems = 'center';
        content.style.justifyContent = 'center';

        closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.setAttribute('aria-label', 'Cerrar');
        closeBtn.style.position = 'fixed';
        closeBtn.style.top = '16px';
        closeBtn.style.right = '20px';
        closeBtn.style.color = '#fff';
        closeBtn.style.background = 'transparent';
        closeBtn.style.border = 'none';
        closeBtn.style.fontSize = '28px';
        closeBtn.style.cursor = 'pointer';

        overlay.appendChild(content);
        overlay.appendChild(closeBtn);

        function close() {
          overlay.style.opacity = '0';
          setTimeout(() => {
            document.body.classList.remove('is-showreel-open');
            overlay.remove();
          }, 180);
          document.removeEventListener('keydown', onKey);
        }

        function onKey(e){ if (e.key === 'Escape') close(); }

        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        closeBtn.addEventListener('click', () => close());
        document.addEventListener('keydown', onKey);

        return overlay;
      }

      function openFromSlide(slide){
        const ov = ensureOverlay();
        // Limpiar contenido
        content.innerHTML = '';

        let nodeToShow;
        if (slide.tagName.toLowerCase() === 'img') {
          const img = document.createElement('img');
          img.src = slide.getAttribute('src');
          img.alt = slide.getAttribute('alt') || '';
          img.style.maxWidth = '100%';
          img.style.maxHeight = '100%';
          img.style.objectFit = 'contain';
          nodeToShow = img;
        } else if (slide.tagName.toLowerCase() === 'video') {
          const video = document.createElement('video');
          const source = slide.querySelector('source');
          if (source) {
            video.src = source.getAttribute('src') || '';
          }
          video.controls = true;
          video.autoplay = true;
          video.muted = false;
          video.playsInline = true;
          video.style.maxWidth = '100%';
          video.style.maxHeight = '100%';
          video.style.objectFit = 'contain';
          nodeToShow = video;
        }

        if (!nodeToShow) return;
        content.appendChild(nodeToShow);
        document.body.appendChild(ov);
        requestAnimationFrame(() => { ov.style.opacity = '1'; });

        // Intentar fullscreen del documento para incluir el canvas del cursor
        const targetFS = document.documentElement;
        const req = targetFS.requestFullscreen || targetFS.webkitRequestFullscreen || targetFS.msRequestFullscreen;
        try { req && req.call(targetFS); } catch(_){}
      }

      return { openFromSlide };
    })();

    container.addEventListener('click', (e) => {
      const active = container.querySelector('.carousel-slide.active');
      if (!active) return;
      // Evitar que clic en controles/indicadores dispare el visor
      const isIndicator = e.target.closest('.carousel-indicators');
      const isNav = e.target.closest('.carousel-nav');
      if (isIndicator || isNav) return;
      if (!e.target.closest('.carousel-slide')) return;
      openProjector.openFromSlide(active);
    });
  })();

  // --- Carruseles múltiples e independientes con clase .carrusel ---
  // Con autoplay, con pausa y efecto agrandar en hover, excepto el metaball
  document.querySelectorAll('.carrusel').forEach(carrusel => {
    // Excluir el metaball especial
    if (carrusel.id === 'proyectos-carousel') return;

    const slides = carrusel.querySelectorAll('.carousel-slide');
    const indicators = carrusel.querySelectorAll('.carousel-indicators .indicator');
    let currentIndex = 0;
    const autoplayDelay = 3000; // 3 segundos
    let autoplayInterval;

    function updateCarousel(index) {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
        if (i === index) {
          slide.style.transform = "scale(1.05)";
          slide.style.transition = "transform 0.5s ease";
        } else {
          slide.style.transform = "scale(1)";
          slide.style.transition = "transform 0.5s ease";
        }
      });
      indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
      });
      currentIndex = index;
    }

    indicators.forEach((indicator, i) => {
      indicator.addEventListener('click', () => updateCarousel(i));
    });

    updateCarousel(0);

    function startAutoplay() {
      autoplayInterval = setInterval(() => {
        updateCarousel((currentIndex + 1) % slides.length);
      }, autoplayDelay);
    }

    function stopAutoplay() {
      clearInterval(autoplayInterval);
    }

    carrusel.addEventListener('mouseenter', () => {
      stopAutoplay();
      slides[currentIndex].style.transform = "scale(1.1)";
    });

    carrusel.addEventListener('mouseleave', () => {
      slides[currentIndex].style.transform = "scale(1.05)";
      startAutoplay();
    });

    startAutoplay();

    // Click en slide activo para pantalla completa (reutiliza mismo patrón)
    const openProjector = (() => {
      let overlay;
      let content;
      let closeBtn;
      function ensureOverlay() {
        if (overlay) return overlay;
        overlay = document.createElement('div');
        overlay.className = 'lightbox-overlay';
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.background = 'rgba(0,0,0,0.9)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '2147483646';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity .2s ease';

        content = document.createElement('div');
        content.style.maxWidth = '92vw';
        content.style.maxHeight = '92vh';
        content.style.display = 'flex';
        content.style.alignItems = 'center';
        content.style.justifyContent = 'center';

        closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.setAttribute('aria-label', 'Cerrar');
        closeBtn.style.position = 'fixed';
        closeBtn.style.top = '16px';
        closeBtn.style.right = '20px';
        closeBtn.style.color = '#fff';
        closeBtn.style.background = 'transparent';
        closeBtn.style.border = 'none';
        closeBtn.style.fontSize = '28px';
        closeBtn.style.cursor = 'pointer';

        overlay.appendChild(content);
        overlay.appendChild(closeBtn);

        function close() {
          overlay.style.opacity = '0';
          setTimeout(() => {
            document.body.classList.remove('is-showreel-open');
            overlay.remove();
          }, 180);
          document.removeEventListener('keydown', onKey);
        }

        function onKey(e){ if (e.key === 'Escape') close(); }

        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        closeBtn.addEventListener('click', () => close());
        document.addEventListener('keydown', onKey);

        return overlay;
      }

      function openFromSlide(slide){
        const ov = ensureOverlay();
        content.innerHTML = '';

        let nodeToShow;
        if (slide.tagName.toLowerCase() === 'img') {
          const img = document.createElement('img');
          img.src = slide.getAttribute('src');
          img.alt = slide.getAttribute('alt') || '';
          img.style.maxWidth = '100%';
          img.style.maxHeight = '100%';
          img.style.objectFit = 'contain';
          nodeToShow = img;
        } else if (slide.tagName.toLowerCase() === 'video') {
          const video = document.createElement('video');
          const source = slide.querySelector('source');
          if (source) {
            video.src = source.getAttribute('src') || '';
          }
          video.controls = true;
          video.autoplay = true;
          video.muted = false;
          video.playsInline = true;
          video.style.maxWidth = '100%';
          video.style.maxHeight = '100%';
          video.style.objectFit = 'contain';
          nodeToShow = video;
        }

        if (!nodeToShow) return;
        content.appendChild(nodeToShow);
        document.body.appendChild(ov);
        requestAnimationFrame(() => { ov.style.opacity = '1'; });

        // Intentar fullscreen del documento para incluir el canvas del cursor
        const targetFS = document.documentElement;
        const req = targetFS.requestFullscreen || targetFS.webkitRequestFullscreen || targetFS.msRequestFullscreen;
        try { req && req.call(targetFS); } catch(_){}
      }

      return { openFromSlide };
    })();

    carrusel.addEventListener('click', (e) => {
      const slidesContainer = carrusel.querySelector('.carousel-slides');
      if (!slidesContainer) return;
      const active = carrusel.querySelector('.carousel-slide.active');
      if (!active) return;
      const isIndicator = e.target.closest('.carousel-indicators');
      if (isIndicator) return;
      if (!e.target.closest('.carousel-slide')) return;
      openProjector.openFromSlide(active);
    });
  });

  // ---------------------------
  // Metaball deformador de carrusel
  // ---------------------------
  const deformTarget = document.querySelector(".metaball-deform");

  document.addEventListener("mousemove", (e) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const offsetX = (e.clientX - centerX) / 30;
    const offsetY = (e.clientY - centerY) / 30;

    if (deformTarget) {
      deformTarget.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(1.05, 0.95)`;
    }
  });

  document.addEventListener("mouseleave", () => {
    if (deformTarget) deformTarget.style.transform = "";
  });

  // ---------------------------
  // Navegación interna suave
  // ---------------------------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href").substring(1);
      const target = document.getElementById(targetId);

      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
  
  // ---------------------------
  // Footer: menú desplegable
  // ---------------------------
  (function setupFooterMenu(){
    const toggleBtn = document.querySelector('.menu-toggle');
    const menu = document.getElementById('footerMenu');
    const icon = document.querySelector('.menu-icon');
    if (!toggleBtn || !menu) return;
    const panel = menu.querySelector('.menu-panel');
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const showing = menu.classList.toggle('show');
      if (panel) {
        panel.classList.toggle('open', showing);
        if (showing) {
          const rect = toggleBtn.getBoundingClientRect();
          panel.style.position = 'fixed';
          panel.style.left = (rect.left + rect.width / 2) + 'px';
          panel.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
          panel.style.top = '';
          panel.style.transform = 'translate(-50%, 0)';
          panel.style.zIndex = '2147483647';
        } else {
          panel.style.position = '';
          panel.style.left = '';
          panel.style.bottom = '';
          panel.style.top = '';
          panel.style.transform = '';
          panel.style.zIndex = '';
        }
      }
      if (icon) icon.style.transform = showing ? 'rotate(180deg)' : 'rotate(0deg)';
    });
    document.addEventListener('click', () => {
      if (menu.classList.contains('show')) {
        menu.classList.remove('show');
        if (panel) {
          panel.classList.remove('open');
          panel.style.position = '';
          panel.style.left = '';
          panel.style.bottom = '';
          panel.style.top = '';
          panel.style.transform = '';
          panel.style.zIndex = '';
        }
        if (icon) icon.style.transform = 'rotate(0deg)';
      }
    });
  })();

  // ---------------------------
  // Header: enlaces funcionales en páginas no home + menú Proyectos
  // ---------------------------
  (function setupHeaderNavForNonHome(){
    const isIndex = window.location.pathname.endsWith("index.html") || window.location.pathname === "/";
    const nav = document.querySelector('.main-nav');
    if (!nav) return;
    const links = nav.querySelectorAll('.nav-links a');

    // Reescribir enlaces para no home
    if (!isIndex) {
      links.forEach(a => {
        const txt = (a.textContent || '').trim().toLowerCase();
        if (txt.startsWith('sobre')) {
          a.setAttribute('href', '/index.html#sobre-mi');
        } else if (txt.startsWith('contáct') || txt.startsWith('contact')) {
          a.setAttribute('href', '/index.html#contacto');
        }
      });
    }

    // Menú Proyectos en header (estilo y clases del footer)
    let projectsLink = Array.from(links).find(a => {
      const txt = (a.textContent || '').trim().toLowerCase();
      const href = (a.getAttribute('href') || '').toLowerCase();
      return txt.includes('proyectos') || href.includes('#proyectos');
    });
    if (!projectsLink) return;

    // Crear contenedor con mismas clases que footer
    let open = false;
    const headerMenu = document.createElement('div');
    headerMenu.className = 'menu-content';
    headerMenu.id = 'headerProjectsMenu';
    const panel = document.createElement('div');
    panel.className = 'menu-panel';
    // Asegurar que el panel no se recorte en cabeceras y que tenga tamaño adecuado
    panel.style.position = 'fixed';
    panel.style.minWidth = '260px';
    panel.style.maxWidth = 'min(92vw, 420px)';
    panel.style.overflow = 'visible';
    // Forzar fondo y padding como el footer por si los estilos no aplican en esta página
    panel.style.background = 'rgba(8, 8, 8, 0.98)';
    panel.style.backdropFilter = 'blur(24px)';
    panel.style.border = '1px solid rgba(255, 255, 255, 0.14)';
    panel.style.borderRadius = '14px';
    panel.style.padding = '12px 14px';
    panel.style.boxShadow = '0 16px 44px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(204, 255, 0, 0.08)';
    const section = document.createElement('div');
    section.className = 'menu-section';
    section.style.width = '100%';
    const list = document.createElement('ul');
    list.style.width = '100%';

    const items = [
      { label: 'Homepage', href: 'index.html' },
      { label: 'Hard Surface', href: 'hardsurface.html' },
      { label: 'Estudios del Corazón', href: 'corazon.html' },
      { label: 'Modelado Orgánico', href: 'organico.html' },
      { label: 'Animaciones', href: 'animaciones.html' },
      { label: 'TFG', href: 'TFG.html' },
    ];

    items.forEach(it => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.textContent = it.label;
      a.href = it.href;
      a.style.width = '100%';
      a.style.maxWidth = '260px';
      a.style.margin = '0.25rem auto';
      li.appendChild(a);
      list.appendChild(li);
    });

    section.appendChild(list);
    panel.appendChild(section);
    headerMenu.appendChild(panel);
    document.body.appendChild(headerMenu);

    function positionPanel() {
      const rect = projectsLink.getBoundingClientRect();
      const margin = 8;
      let desiredLeft = rect.left + rect.width / 2;
      // Medir ancho estimado
      const panelWidth = Math.max(panel.offsetWidth || 260, 260);
      const half = panelWidth / 2;
      let transform = 'translate(-50%, 0)';
      let left = desiredLeft;
      if (desiredLeft - half < margin) {
        left = margin; transform = 'translate(0, 0)';
      } else if (desiredLeft + half > window.innerWidth - margin) {
        left = window.innerWidth - margin; transform = 'translate(-100%, 0)';
      }
      panel.style.left = left + 'px';
      panel.style.top = (rect.bottom + margin) + 'px';
      panel.style.bottom = '';
      panel.style.transform = transform;
      panel.style.zIndex = '2147483646';
      panel.style.pointerEvents = 'auto';
    }

    function showPanel(){
      headerMenu.classList.add('show');
      panel.classList.add('open');
      // Asegurar panel visible y posicionado
      positionPanel();
      // Forzar cálculo y fijar min-height para que el fondo abarque la lista
      panel.style.height = 'auto';
      const desiredHeight = panel.scrollHeight;
      panel.style.minHeight = desiredHeight + 'px';
      // Asegurar visibilidad del cursor metaball
      const cursor = document.getElementById('metaball-cursor');
      if (cursor) {
        cursor.style.zIndex = '2147483647';
        cursor.style.display = 'block';
      }
      open = true;
      document.addEventListener('click', onDocClick, { capture: true });
      window.addEventListener('resize', positionPanel);
      window.addEventListener('scroll', positionPanel, { passive: true });
    }

    function hidePanel(){
      headerMenu.classList.remove('show');
      panel.classList.remove('open');
      open = false;
      document.removeEventListener('click', onDocClick, { capture: true });
      window.removeEventListener('resize', positionPanel);
      window.removeEventListener('scroll', positionPanel);
    }

    function onDocClick(e){
      if (panel.contains(e.target)) return;
      const anchor = e.target.closest('.main-nav .nav-links a');
      if (anchor && (anchor === projectsLink || ((anchor.textContent||'').toLowerCase().includes('proyectos')))) {
        return; // el click es sobre el mismo botón proyectos
      }
      hidePanel();
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && open) hidePanel();
    });

    // Delegación en la nav para mayor robustez
    nav.addEventListener('click', (e) => {
      const anchor = e.target.closest('.nav-links a');
      if (!anchor) return;
      const txt = (anchor.textContent || '').trim().toLowerCase();
      const href = (anchor.getAttribute('href') || '').toLowerCase();
      const isProjects = txt.includes('proyectos') || href.includes('#proyectos');
      if (!isProjects) return;
      // En el homepage: permitir el scroll al carrusel y no abrir menú
      if (isIndex) { hidePanel(); return; }
      // En páginas internas, actuamos como disparador del menú
      e.preventDefault();
      if (open) hidePanel(); else showPanel();
    });
  })();
  
});

 // ---------------------------
// Canvas de ruido/grano animado (noise grain)
// ---------------------------
(() => {
  const canvas = document.getElementById("noise-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const patternCanvas = document.createElement("canvas");
  const patternCtx = patternCanvas.getContext("2d");

  let width, height;
  const patternSize = 100;
  const patternRefreshInterval = 3;
  let frame = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    patternCanvas.width = patternSize;
    patternCanvas.height = patternSize;
  }

  function updatePattern() {
    const imageData = patternCtx.createImageData(patternSize, patternSize);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const val = Math.floor(Math.random() * 255);
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      data[i + 3] = 20; // opacidad baja para grano sutil
    }

    patternCtx.putImageData(imageData, 0, 0);
  }

  function drawGrain() {
    ctx.clearRect(0, 0, width, height);
    const pattern = ctx.createPattern(patternCanvas, "repeat");
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, width, height);
  }

  function loop() {
    if (frame % patternRefreshInterval === 0) {
      updatePattern();
      drawGrain();
    }
    frame++;
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resize);
  resize();
  loop();




})();

// --- Envío del formulario de contacto (FormSubmit AJAX) ---
(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = document.getElementById('contact-status');

  async function sendForm(e){
    e.preventDefault();
    if (status) {
      status.textContent = 'Enviando...';
      status.style.color = '#9ca3af';
    }

    const formData = new FormData(form);
    // Asegurar que _replyto use el valor del campo email
    const email = form.querySelector('#email')?.value || '';
    formData.set('_replyto', email);
    formData.append('_captcha', 'false');
    formData.append('_subject', 'Nuevo contacto desde el portfolio');
    formData.append('_template', 'table');

    try {
      const response = await fetch('https://formsubmit.co/ajax/luisfergfx.contact@gmail.com', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      });
      const result = await response.json();
      if (response.ok) {
        if (status) {
          status.textContent = '¡Gracias! Tu mensaje fue enviado.';
          status.style.color = '#ccff00';
        }
        form.reset();
      } else {
        throw new Error(result?.message || 'Error al enviar');
      }
    } catch (err) {
      if (status) {
        status.textContent = 'No se pudo enviar. Prueba de nuevo o escribe a luisfergfx.contact@gmail.com';
        status.style.color = '#fca5a5';
      }
    }
  }

  form.addEventListener('submit', sendForm);
})();

// --- Modal Showreel: abrir en fullscreen con audio ---
(() => {
  const openBtn = document.getElementById('open-showreel');
  const modal = document.getElementById('showreel-modal');
  const closeBtn = document.getElementById('close-showreel');
  const video = document.getElementById('showreel-video');
  const backdrop = modal?.querySelector('.showreel-backdrop');

  if (!openBtn || !modal || !video) return;

  function openModal() {
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-showreel-open');

    // Quitar mute y reproducir con interacción del usuario
    video.muted = false;
    video.currentTime = 0;
    video.play().catch(() => {});

    // Intentar fullscreen del contenedor del video
    const target = modal;
    const requestFS = target.requestFullscreen || target.webkitRequestFullscreen || target.msRequestFullscreen;
    if (requestFS) {
      requestFS.call(target).catch?.(() => {});
    }
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-showreel-open');
    video.pause();

    // Salir de fullscreen si está activo
    const exitFS = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    if (document.fullscreenElement && exitFS) {
      exitFS.call(document).catch?.(() => {});
    }
  }

  openBtn.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
      closeModal();
    }
  });
})();

