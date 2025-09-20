console.log("Portafolio cargado correctamente");

document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------
  // Scroll balls navigation
  // ---------------------------
  const balls = document.querySelectorAll(".scroll-balls .ball[data-section]");
  let isManualScroll = false;

  function updateActiveBall() {
    if (isManualScroll) return;

    const scrollY = window.scrollY + window.innerHeight / 2;
    let activeId = null;

    balls.forEach(ball => {
      const section = document.getElementById(ball.dataset.section);
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const bottom = rect.bottom + window.scrollY;

      if (scrollY >= top && scrollY < bottom) {
        activeId = ball.dataset.section;
      }
    });

    balls.forEach(ball => {
      ball.classList.toggle("active", ball.dataset.section === activeId);
    });
  }

  balls.forEach(ball => {
    ball.addEventListener("click", e => {
      e.preventDefault();
      isManualScroll = true;

      const section = document.getElementById(ball.dataset.section);
      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

        balls.forEach(b => b.classList.remove("active"));
        ball.classList.add("active");

        setTimeout(() => {
          isManualScroll = false;
        }, 1000);
      }
    });
  });

  window.addEventListener("scroll", updateActiveBall);
  updateActiveBall();

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

// --- Envío del formulario de contacto (mailto) ---
(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = document.getElementById('contact-status');
  const nameInput = document.getElementById('nombre');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('mensaje');

  function setStatus(msg, isError = false) {
    if (status) {
      status.textContent = msg;
      status.style.color = isError ? '#fca5a5' : '#9ca3af';
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = nameInput?.value.trim();
    const email = emailInput?.value.trim();
    const mensaje = messageInput?.value.trim();

    if (!nombre || !email || !mensaje) {
      setStatus('Por favor completa todos los campos.', true);
      return;
    }

    // Validación básica de email
    const emailOk = /.+@.+\..+/.test(email);
    if (!emailOk) {
      setStatus('Introduce un email válido.', true);
      return;
    }

    setStatus('Abriendo tu cliente de correo...');

    const subject = encodeURIComponent('Contacto desde el portafolio');
    const bodyLines = [
      `Nombre: ${nombre}`,
      `Email: ${email}`,
      '',
      'Mensaje:',
      `${mensaje}`
    ];
    const body = encodeURIComponent(bodyLines.join('\n'));

    const mailto = `mailto:tuemail@ejemplo.com?subject=${subject}&body=${body}`;

    // Abrir mailto
    window.location.href = mailto;

    // Feedback y limpiar
    setTimeout(() => {
      setStatus('Si no se abrió el correo, escríbeme a tuemail@ejemplo.com');
      form.reset();
    }, 600);
  });
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

