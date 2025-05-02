console.log("Portafolio cargado correctamente");

document.addEventListener("DOMContentLoaded", () => {
  const balls = document.querySelectorAll(".scroll-balls .ball[data-section]");
  let isManualScroll = false;

  function updateActiveBall() {
    if (isManualScroll) return;
    
    const scrollY = window.scrollY + window.innerHeight / 2;
    let activeId = null;

    balls.forEach(ball => {
      const section = document.getElementById(ball.dataset.section);
      if (!section) return;
      
      const { top, bottom } = section.getBoundingClientRect();
      if (scrollY >= top + window.scrollY && scrollY < bottom + window.scrollY) {
        activeId = ball.dataset.section;
      }
    });

    balls.forEach(ball => {
      ball.classList.toggle("active", ball.dataset.section === activeId);
    });
  }

  balls.forEach(ball => {
    ball.addEventListener("click", function(e) {
      e.preventDefault();
      isManualScroll = true;

      const section = document.getElementById(this.dataset.section);
      if (section) {
        section.scrollIntoView({ 
          behavior: "smooth",
          block: "center"
        });

        balls.forEach(b => b.classList.remove("active"));
        this.classList.add("active");

        setTimeout(() => {
          isManualScroll = false;
        }, 1000);
      }
    });
  });

  window.addEventListener("scroll", updateActiveBall);
  updateActiveBall();
});



// ---------------------------
// Metaball Cursor Animación
// ---------------------------
const canvas = document.getElementById("metaball-cursor");
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

// Datos del cursor
let mouse = { x: width / 2, y: height / 2, speedX: 0, speedY: 0 };
let target = { x: mouse.x, y: mouse.y }; // Para efecto de suavizado
let lastMouse = { x: mouse.x, y: mouse.y };

// Tamaño de la bola (metaball)
let ballSize = 15; // Tamaño inicial de la bola
let targetBallSize = ballSize; // Tamaño objetivo de la bola
let ballSizeSpeed = 0.1; // Velocidad de transición
let metaballColor = "#ccff00"; // Color inicial de la bola

// Variable para controlar el estado de interacción con elementos
let isHoveringInteractiveElement = false;

// Detectar cuando el cursor pasa sobre un elemento interactivo
document.querySelectorAll("a, button, .clickable").forEach(element => {
  element.addEventListener("mouseenter", () => {
    console.log("Cursor sobre un elemento interactivo");
    isHoveringInteractiveElement = true;
  });

  element.addEventListener("mouseleave", () => {
    console.log("Cursor fuera de un elemento interactivo");
    isHoveringInteractiveElement = false;
  });
});

// Eventos del mouse
document.addEventListener("mousemove", (e) => {
  target.x = e.clientX;
  target.y = e.clientY;
});

function animate() {
  ctx.clearRect(0, 0, width, height);

  // Suavizado del movimiento del mouse (efecto goma)
  mouse.x += (target.x - mouse.x) * 0.2;
  mouse.y += (target.y - mouse.y) * 0.2;

  mouse.speedX = mouse.x - lastMouse.x;
  mouse.speedY = mouse.y - lastMouse.y;

  const multiplier = 1.8; // Ajustamos la sensibilidad para que no se deforme mucho
  const maxStretch = 30;  // Límite de deformación para evitar que se haga demasiado grande

  // Calculamos la deformación (stretch) basados en la velocidad
  const stretchX = Math.min(Math.abs(mouse.speedX) * multiplier, maxStretch);
  const stretchY = Math.min(Math.abs(mouse.speedY) * multiplier, maxStretch);

  // Si el cursor está sobre un elemento interactivo, aumentamos su tamaño
  if (isHoveringInteractiveElement) {
    targetBallSize = Math.min(50, 35 + (stretchX + stretchY) / 3); // Aumenta el tamaño hasta un límite máximo
  } else {
    targetBallSize = 15;  // Tamaño normal cuando no está sobre un elemento interactivo
  }

  // Interpolación para suavizar el cambio de tamaño de la bola
  ballSize += (targetBallSize - ballSize) * ballSizeSpeed;

  // Primero, dibujamos el contorno del metaball sin filtro (sin desenfoque)
  ctx.save();
  ctx.translate(mouse.x, mouse.y);
  
  // Configuración del contorno
  ctx.lineWidth = 3; // Grosor del contorno
  ctx.strokeStyle = metaballColor; // Color del contorno
  ctx.beginPath();
  ctx.arc(0, 0, ballSize, 0, Math.PI * 2);
  ctx.stroke(); // Dibujar solo el contorno
  ctx.restore();

  // Luego, dibujamos el relleno con un efecto de cristal difuso
  ctx.save();
  ctx.translate(mouse.x, mouse.y);

  // Efecto de deformación más líquida utilizando "scale" y fuerza de atracción
  const scaleX = 1 + stretchX / 20;
  const scaleY = 1 + stretchY / 20;

  ctx.scale(scaleX, scaleY);

  // Efecto de fondo difuso similar a un cristal
  ctx.beginPath();
  ctx.arc(0, 0, ballSize, 0, Math.PI * 2);
  ctx.fillStyle = metaballColor;
  ctx.fill();

  // Aquí aplicamos un "backdrop-filter" de blur
  ctx.filter = 'blur(8px)'; // Simula el difuso dentro del metaball
  ctx.fill(); // Aplica el filtro dentro de la forma

  ctx.restore();

  lastMouse.x = mouse.x;
  lastMouse.y = mouse.y;

  requestAnimationFrame(animate);
}

animate();