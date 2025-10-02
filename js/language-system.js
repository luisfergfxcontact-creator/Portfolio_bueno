// === Sistema de Traducción Automática Global ===
// Este archivo se incluye en todas las páginas para mantener la funcionalidad de idiomas

(() => {
  let currentLang = localStorage.getItem('portfolio-lang') || 'es';
  
  // Cache de traducciones para evitar llamadas repetidas
  const translationCache = new Map();
  
  // Función para traducir texto usando Google Translate API (método gratuito)
  async function translateText(text, fromLang = 'es', toLang = 'en') {
    const cacheKey = `${text}_${fromLang}_${toLang}`;
    
    // Verificar cache primero
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey);
    }
    
    try {
      // Usar el servicio gratuito de Google Translate
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(text)}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        const translation = data[0][0][0];
        translationCache.set(cacheKey, translation);
        return translation;
      }
    } catch (error) {
      console.warn('Error en traducción automática:', error);
    }
    
    // Fallback: devolver el texto original si falla la traducción
    return text;
  }
  
  // Función para auto-generar traducciones faltantes
  async function autoGenerateTranslations() {
    const elementsToTranslate = document.querySelectorAll('[data-es]:not([data-en])');
    
    for (const element of elementsToTranslate) {
      const spanishText = element.getAttribute('data-es');
      if (spanishText && spanishText.trim()) {
        try {
          const englishText = await translateText(spanishText, 'es', 'en');
          element.setAttribute('data-en', englishText);
          console.log(`Traducción generada: "${spanishText}" → "${englishText}"`);
        } catch (error) {
          console.warn(`Error traduciendo: "${spanishText}"`, error);
        }
      }
    }
    
    // También traducir placeholders
    const inputsToTranslate = document.querySelectorAll('[data-placeholder-es]:not([data-placeholder-en])');
    
    for (const input of inputsToTranslate) {
      const spanishPlaceholder = input.getAttribute('data-placeholder-es');
      if (spanishPlaceholder && spanishPlaceholder.trim()) {
        try {
          const englishPlaceholder = await translateText(spanishPlaceholder, 'es', 'en');
          input.setAttribute('data-placeholder-en', englishPlaceholder);
          console.log(`Placeholder traducido: "${spanishPlaceholder}" → "${englishPlaceholder}"`);
        } catch (error) {
          console.warn(`Error traduciendo placeholder: "${spanishPlaceholder}"`, error);
        }
      }
    }
  }
  
  // Función para detectar cambios en el contenido y auto-traducir
  function setupAutoTranslation() {
    // Observer para detectar cambios en atributos data-es
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-es') {
          const element = mutation.target;
          const newSpanishText = element.getAttribute('data-es');
          
          if (newSpanishText && newSpanishText.trim()) {
            // Auto-traducir el nuevo texto
            translateText(newSpanishText, 'es', 'en').then((englishText) => {
              element.setAttribute('data-en', englishText);
              console.log(`Auto-traducción: "${newSpanishText}" → "${englishText}"`);
              
              // Si estamos en modo inglés, actualizar inmediatamente
              if (currentLang === 'en') {
                element.textContent = englishText;
              }
            });
          }
        }
      });
    });
    
    // Observar cambios en todo el documento
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-es', 'data-placeholder-es'],
      subtree: true
    });
  }
  
  // Función para crear el chip de idioma si no existe
  function createLanguageChip() {
    // Verificar si ya existe
    if (document.getElementById('lang-chip')) return;
    
    // Buscar la navegación principal
    const mainNav = document.querySelector('.main-nav');
    if (!mainNav) return;
    
    // Crear el contenedor del chip
    const languageToggle = document.createElement('div');
    languageToggle.className = 'language-toggle';
    
    // Crear el botón chip
    const langChip = document.createElement('button');
    langChip.id = 'lang-chip';
    langChip.className = 'lang-chip';
    langChip.setAttribute('aria-label', 'Cambiar idioma');
    
    // Crear las opciones de idioma
    const esOption = document.createElement('span');
    esOption.className = 'lang-option active';
    esOption.setAttribute('data-lang', 'es');
    esOption.textContent = 'ES';
    
    const divider = document.createElement('span');
    divider.className = 'lang-divider';
    divider.textContent = '|';
    
    const enOption = document.createElement('span');
    enOption.className = 'lang-option';
    enOption.setAttribute('data-lang', 'en');
    enOption.textContent = 'EN';
    
    // Ensamblar el chip
    langChip.appendChild(esOption);
    langChip.appendChild(divider);
    langChip.appendChild(enOption);
    languageToggle.appendChild(langChip);
    
    // Añadir al nav
    mainNav.appendChild(languageToggle);
    
    console.log('Chip de idioma creado dinámicamente');
  }
  
  // Función para actualizar el idioma activo en el chip
  function updateLangChip(lang) {
    const langOptions = document.querySelectorAll('.lang-option');
    langOptions.forEach(option => {
      option.classList.toggle('active', option.dataset.lang === lang);
    });
  }
  
  // Función para cambiar todos los textos
  function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('portfolio-lang', lang);
    
    // Actualizar textos con data-es y data-en
    document.querySelectorAll('[data-es][data-en]').forEach(element => {
      const text = element.getAttribute(`data-${lang}`);
      if (text) {
        element.textContent = text;
      }
    });
    
    // Actualizar placeholders de inputs
    document.querySelectorAll('input[data-placeholder-es][data-placeholder-en]').forEach(input => {
      const placeholder = input.getAttribute(`data-placeholder-${lang}`);
      if (placeholder) {
        input.placeholder = placeholder;
      }
    });
    
    // Actualizar placeholders de textareas
    document.querySelectorAll('textarea[data-placeholder-es][data-placeholder-en]').forEach(textarea => {
      const placeholder = textarea.getAttribute(`data-placeholder-${lang}`);
      if (placeholder) {
        textarea.placeholder = placeholder;
      }
    });
    
    // Actualizar aria-labels con data-aria-label-es/en
    document.querySelectorAll('[data-aria-label-es][data-aria-label-en]').forEach(element => {
      const ariaLabel = element.getAttribute(`data-aria-label-${lang}`);
      if (ariaLabel) {
        element.setAttribute('aria-label', ariaLabel);
      }
    });
    
    // Actualizar aria-label del botón de idioma
    const langChip = document.getElementById('lang-chip');
    if (langChip) {
      const ariaLabel = lang === 'es' ? 'Cambiar idioma' : 'Change language';
      langChip.setAttribute('aria-label', ariaLabel);
    }
    
    // Actualizar lang del documento
    document.documentElement.lang = lang;
    
    updateLangChip(lang);
  }
  
  // Función para configurar event listeners
  function setupEventListeners() {
    // Event listeners para el chip completo (toggle automático)
    document.addEventListener('click', (e) => {
      const clickedChip = e.target.closest('.lang-chip');
      if (clickedChip) {
        e.preventDefault();
        // Toggle automático entre idiomas
        const newLang = currentLang === 'es' ? 'en' : 'es';
        changeLanguage(newLang);
      }
    });
  }
  
  // Función para añadir traducciones automáticas a elementos comunes
  function addCommonTranslations() {
    // Buscar elementos comunes que necesitan traducción
    const commonElements = [
      { selector: 'h1, h2, h3, h4, h5, h6', attribute: 'data-es' },
      { selector: 'p', attribute: 'data-es' },
      { selector: 'a', attribute: 'data-es' },
      { selector: 'button', attribute: 'data-es' },
      { selector: 'label', attribute: 'data-es' },
      { selector: 'span', attribute: 'data-es' }
    ];
    
    commonElements.forEach(({ selector }) => {
      document.querySelectorAll(selector).forEach(element => {
        // Si el elemento no tiene data-es pero tiene texto, añadirlo
        if (!element.hasAttribute('data-es') && element.textContent.trim()) {
          const text = element.textContent.trim();
          // Solo añadir si el texto parece ser español (contiene caracteres específicos o palabras comunes)
          if (text.match(/[ñáéíóúü]|sobre|proyecto|contacto|inicio|más|español/i)) {
            element.setAttribute('data-es', text);
          }
        }
      });
    });
  }
  
  // Inicializar el sistema
  async function initLanguageSystem() {
    console.log('Inicializando sistema de idiomas global...');
    
    // Crear chip de idioma si no existe
    createLanguageChip();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Añadir traducciones automáticas a elementos comunes
    addCommonTranslations();
    
    // Configurar auto-traducción
    setupAutoTranslation();
    
    // Generar traducciones faltantes al cargar
    await autoGenerateTranslations();
    
    // Aplicar idioma inicial
    changeLanguage(currentLang);
    
    console.log('Sistema de traducción automática global inicializado');
  }
  
  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguageSystem);
  } else {
    initLanguageSystem();
  }
  
  // Exponer funciones globalmente para uso manual si es necesario
  window.LanguageSystem = {
    changeLanguage,
    translateText,
    autoGenerateTranslations,
    getCurrentLanguage: () => currentLang
  };
})();

// === Mobile Menu System ===
(() => {
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuItems = document.querySelectorAll('.mobile-menu-item');
  
  if (!mobileMenuToggle || !mobileMenu) return;
  
  // Toggle menu
  function toggleMobileMenu() {
    const isActive = mobileMenuToggle.classList.contains('active');
    
    if (isActive) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }
  
  function openMobileMenu() {
    mobileMenuToggle.classList.add('active');
    mobileMenu.classList.add('active');
  }
  
  function closeMobileMenu() {
    mobileMenuToggle.classList.remove('active');
    mobileMenu.classList.remove('active');
  }
  
  // Event listeners
  mobileMenuToggle.addEventListener('click', toggleMobileMenu);
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (mobileMenu.classList.contains('active') && 
        !mobileMenu.contains(e.target) && 
        !mobileMenuToggle.contains(e.target)) {
      closeMobileMenu();
    }
  });
  
  // Close menu when clicking on menu items
  mobileMenuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const txt = (item.textContent || '').trim().toLowerCase();
      const href = (item.getAttribute('href') || '').toLowerCase();
      const isProjects = txt.includes('proyectos') || href.includes('#proyectos');
      const isIndex = window.location.pathname.endsWith("index.html") || window.location.pathname === "/";
      
      // Si es el enlace de proyectos en páginas no-home, activar el menú de proyectos
      if (isProjects && !isIndex) {
        e.preventDefault();
        console.log('Mobile menu: Activando menú de proyectos...');
        
        // Esperar un poco para que el sistema de proyectos esté listo
        setTimeout(() => {
          // Buscar el enlace de proyectos del header desktop
          const headerProjectsLink = document.querySelector('.main-nav .nav-links a[href="#proyectos"]');
          console.log('Header projects link found:', headerProjectsLink);
          if (headerProjectsLink) {
            // Crear y disparar evento click en el enlace del header
            const clickEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            headerProjectsLink.dispatchEvent(clickEvent);
            console.log('Click event dispatched to header projects link');
          }
        }, 100);
        
        // Cerrar el menú móvil después de un momento para que se vea el desplegable
        setTimeout(() => {
          closeMobileMenu();
        }, 150);
        
        return;
      }
      
      // Para otros enlaces (Sobre mí, Contáctame), cerrar menú inmediatamente
      // y permitir navegación normal sin interferencias
      closeMobileMenu();
    });
  });
  
  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    }
  });
  
  // Add mobile menu items to interactive elements for metaball cursor
  document.querySelectorAll(".mobile-menu-toggle, .mobile-menu-item").forEach(element => {
    element.addEventListener("mouseenter", () => window.isHoveringInteractiveElement = true);
    element.addEventListener("mouseleave", () => window.isHoveringInteractiveElement = false);
  });
})();
