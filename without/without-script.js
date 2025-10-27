/**
 * СКРИПТЫ ДЛЯ TILDA
 * 
 * Этот файл содержит все JavaScript скрипты для различных эффектов и функций
 */

// ===========================================
// СКРИПТ ДЛЯ ГОРИЗОНТАЛЬНОГО СЛАЙДЕРА
// ===========================================
// Управляет слайдером с точками и стрелками навигации
(function () {
  let initialized = false;
  
  // Throttle функция для оптимизации обработки скролла
  function throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    return function (...args) {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }

  // Инициализация точек навигации
  function initDots() {
    document.querySelectorAll('.bar').forEach(bar => {
      let host = bar.querySelector(':scope > div') || bar.querySelector('div');
      if (!host) return;
      host.classList.add('bar-dots');
      // Удаляем старые точки
      host.querySelectorAll(':scope > .bar-dot').forEach(n => n.remove());
      // Создаем новые точки (8 штук)
      for (let i = 0; i < 8; i++) {
        const dot = document.createElement('div');
        dot.className = 'bar-dot';
        dot.setAttribute('data-index', i);
        host.appendChild(dot);
      }
      
      // Добавляем отслеживание скрола для этого слайдера с оптимизацией
      const slider = getSliderFor(bar);
      if (slider) {
        updateDotsForSlider(slider, bar);
        // Используем requestAnimationFrame для плавного обновления
        let ticking = false;
        const optimisedUpdate = () => {
          if (!ticking) {
            requestAnimationFrame(() => {
              updateDotsForSlider(slider, bar);
              ticking = false;
            });
            ticking = true;
          }
        };
        // Добавляем throttled обработчик
        const throttledUpdate = throttle(optimisedUpdate, 16);
        slider.addEventListener('scroll', throttledUpdate, { passive: true });
      }
    });
  }

  // Поиск слайдера для якоря
  function getSliderFor(anchor) {
    let s = anchor.parentElement && anchor.parentElement.querySelector('.slider');
    if (!s) s = anchor.closest && anchor.closest('.slider');
    if (!s) s = document.querySelector('.slider');
    return s || null;
  }

  // Вычисление шага прокрутки на основе .slider-start и .slider-end
  function getStep(slider) {
    const start = slider.querySelector('.slider-start');
    const end = slider.querySelector('.slider-end');
    
    if (!start || !end) {
      // Фолбэк на старую логику если элементы не найдены
      const slide = slider.querySelector('.slide');
      const space = slider.querySelector('.space');
      const wSlide = slide ? slide.getBoundingClientRect().width : 0;
      const wSpace = space ? space.getBoundingClientRect().width : 0;
      return wSlide + wSpace;
    }
    
    // Вычисляем расстояние между start и end элементами
    const startRect = start.getBoundingClientRect();
    const endRect = end.getBoundingClientRect();
    const sliderRect = slider.getBoundingClientRect();
    
    // Расстояние между левой точкой start и правой точкой end
    const totalDistance = (endRect.right - sliderRect.left) - (startRect.left - sliderRect.left);
    
    // Делим на количество шагов (количество точек - 1)
    const steps = 7; // для 8 точек нужно 7 шагов
    return totalDistance / steps;
  }

  // Обновление состояния точек в зависимости от позиции скрола
  function updateDotsForSlider(slider, bar) {
    const dots = bar.querySelectorAll('.bar-dot');
    if (!dots.length) return;
    
    const start = slider.querySelector('.slider-start');
    const end = slider.querySelector('.slider-end');
    
    if (!start || !end) {
      // Фолбэк на старую логику
      const step = getStep(slider);
      const scrollLeft = slider.scrollLeft;
      const currentStep = Math.min(Math.round(scrollLeft / step), 7);
      
      dots.forEach((dot, index) => {
        if (index <= currentStep) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
      return;
    }
    
    // Простая логика: вычисляем максимальный скролл и текущий прогресс
    const maxScroll = slider.scrollWidth - slider.clientWidth;
    const currentScroll = slider.scrollLeft;
    
    // Прогресс от 0 до 1
    const progress = maxScroll > 0 ? Math.max(0, Math.min(1, currentScroll / maxScroll)) : 0;
    
    // Вычисляем количество активных точек (от 0 до количества точек - 1)
    // Используем более точную логику для соответствия с кликом
    const activeDots = Math.round(progress * (dots.length - 1));
    
    // Обновляем состояние каждой точки
    dots.forEach((dot, index) => {
      if (index <= activeDots) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  // Объединенный обработчик кликов для слайдера (точки и стрелки)
  function initSliderClicks() {
    document.addEventListener('click', function(e) {
      // Обработка кликов по точкам навигации
      const dot = e.target.closest('.bar-dot');
      if (dot) {
        e.preventDefault();
        const bar = dot.closest('.bar');
        const slider = getSliderFor(bar);
        if (!slider) return;
        
        const dotIndex = parseInt(dot.getAttribute('data-index'));
        
        // Вычисляем позицию скрола на основе прогресса
        const maxScroll = slider.scrollWidth - slider.clientWidth;
        const dotsCount = bar.querySelectorAll('.bar-dot').length;
        
        // Прогресс для этого кружочка (от 0 до 1)
        // Используем более точную логику для соответствия с обновлением
        const progress = dotsCount > 1 ? dotIndex / (dotsCount - 1) : 0;
        
        // Позиция скрола с небольшой корректировкой для точности
        const targetScroll = Math.round(progress * maxScroll);
        
        slider.scrollLeft = targetScroll;
        updateDotsForSlider(slider, bar);
        return;
      }
      
      // Обработка кликов по стрелкам навигации
      const arrow = e.target.closest('a[href="#right"], a[href="#left"]');
      if (arrow) {
        e.preventDefault();
        const slider = getSliderFor(arrow);
        if (!slider) return;
        
        const bar = document.querySelector('.bar');
        if (!bar) return;
        
        // Используем ту же логику, что и для точек навигации
        const maxScroll = slider.scrollWidth - slider.clientWidth;
        const dotsCount = bar.querySelectorAll('.bar-dot').length;
        
        if (dotsCount <= 1) return;
        
        // Вычисляем текущий прогресс
        const currentScroll = slider.scrollLeft;
        const currentProgress = maxScroll > 0 ? Math.max(0, Math.min(1, currentScroll / maxScroll)) : 0;
        
        // Вычисляем шаг прогресса (1 шаг = 1/(количество точек - 1))
        const progressStep = 1 / (dotsCount - 1);
        
        let newProgress;
        if (arrow.getAttribute('href') === '#right') {
          // Движение вправо
          newProgress = Math.min(1, currentProgress + progressStep);
        } else {
          // Движение влево
          newProgress = Math.max(0, currentProgress - progressStep);
        }
        
        // Вычисляем новую позицию скрола
        const targetScroll = Math.round(newProgress * maxScroll);
        
        slider.scrollLeft = targetScroll;
        updateDotsForSlider(slider, bar);
        return;
      }
    }, { passive: false });
  }

  function run() {
    if (initialized) return;
    initialized = true;
    
    initDots();
    initSliderClicks();
    initSliderWidth();
  }

  // Простая установка ширины слайдера равной ширине блока .slider-width
  function initSliderWidth() {
    function updateSliderWidths() {
      const sliderWidthBlocks = document.querySelectorAll('.slider-width');
      if (!sliderWidthBlocks.length) return;
      
      sliderWidthBlocks.forEach((block) => {
        const width = block.offsetWidth;
        if (!width) return;
        
      const molecules = document.querySelectorAll('.slider > .tn-molecule');
      molecules.forEach((molecule) => {
        molecule.style.width = width + 'px';
      });
      });
    }
    
    // Обновляем при загрузке
    updateSliderWidths();
    
    // Обновляем при изменении размера окна с throttling
    const throttledResize = throttle(() => {
      requestAnimationFrame(updateSliderWidths);
    }, 100);
    
    window.addEventListener('resize', throttledResize, { passive: true });
  }

  // Запуск при загрузке страницы
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();

// ===========================================
// ОБРАБОТЧИК КНОПКИ-ССЫЛКИ "#Submit"
// ===========================================
// Позволяет использовать ссылку <a href="#Submit"> для отправки формы
// с приоритетной обработкой до внутренних скриптов (capture=true)
(function () {
  let initialized = false;
  
  function init() {
    if (initialized) return;
    initialized = true;
    
    document.addEventListener(
      'click',
      function (ev) {
      const link = ev.target.closest && ev.target.closest('a[href="#Submit"]');
      if (!link) return;

      ev.preventDefault();
      ev.stopImmediatePropagation();

      const form = document.querySelector('form.t-form') || document.querySelector('form');
      if (!form) {
        console.warn('Форма не найдена');
        return;
      }

      // HTML5-валидация (браузер покажет подсказки, если не заполнено)
      if (form.reportValidity && !form.reportValidity()) {
        return;
      }

      // Сабмит с фолбэком
      if (form.requestSubmit) {
        form.requestSubmit();
      } else {
        const btn = form.querySelector('button[type="submit"], .t-submit, input[type="submit"]');
        if (btn) {
          btn.click();
        } else {
          form.submit();
        }
        }
      },
      true // capture=true — ловим клик раньше внутренних скриптов
    );
  }
  
  // Инициализация при загрузке страницы
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// ===========================================
// ОПТИМИЗИРОВАННЫЙ СТЕКЛЯННЫЙ ЭФФЕКТ
// ===========================================
// Применяется к элементам с классами .my-glass и .slide
// Создает оптимизированный стеклянный эффект с рефракцией
(function(){
'use strict';
var cfg={blur:8,saturate:180,contrast:110,grayThickness:5,grayIntensity:.5};

// Создаем SVG фильтр для рефракции
function createSVGFilter(){
  if(document.getElementById('glass-distortion'))return;
  var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('style','position:absolute;width:0;height:0');
  svg.setAttribute('aria-hidden','true');
  svg.innerHTML='<defs><filter id="glass-distortion" x="-50%" y="-50%" width="200%" height="200%">'+
    '<feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="2" seed="2"/>'+
    '<feDisplacementMap in="SourceGraphic" scale="20" xChannelSelector="R" yChannelSelector="G"/>'+
    '</filter></defs>';
  document.body.insertBefore(svg,document.body.firstChild);
}

function init(){
var els=document.querySelectorAll('.my-glass,.slide');
if(!els.length)return;
createSVGFilter();
var isSafari=/^((?!chrome|android).)*safari/i.test(navigator.userAgent);
els.forEach(function(el){
if(el.dataset.glassInit)return;
el.dataset.glassInit='1';
var atom=el.querySelector('.tn-atom');
var bg='',op=1,br='24px',bc='';
if(atom){
var s=getComputedStyle(atom);
bg=s.backgroundColor;
op=parseFloat(s.opacity)||1;
br=s.borderRadius||'24px';
bc=s.borderColor;
}
el.style.borderRadius=br;
el.style.webkitBorderRadius=br;
if(bg&&bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent'){
var m=bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
if(m){
var r=m[1],g=m[2],b=m[3];
el.style.background='linear-gradient(135deg,rgba('+r+','+g+','+b+','+op+'),rgba('+r+','+g+','+b+','+(op*.5)+'))';
}else{
el.style.background=bg;
}
}
var layer=document.createElement('div');
layer.className='glass-layer';
layer.style.borderRadius=br;
layer.style.webkitBorderRadius=br;
var border=document.createElement('div');
border.className='glass-border';
border.style.borderRadius=br;
border.style.webkitBorderRadius=br;
border.style.border='1px solid '+(bc&&bc!=='rgba(0, 0, 0, 0)'&&bc!=='transparent'?bc:'rgba(255,255,255,.8)');
var shadow=document.createElement('div');
shadow.className='glass-shadow';
shadow.style.borderRadius=br;
shadow.style.webkitBorderRadius=br;
var t=cfg.grayThickness,i=cfg.grayIntensity;
if(isSafari){
shadow.style.boxShadow='inset 0 '+t*.4+'px '+t*1.5+'px rgba(128,128,128,'+(i*.6)+')';
}else{
shadow.style.boxShadow='inset 0 '+t*.4+'px '+t*2+'px rgba(128,128,128,'+(i*.8)+'),inset '+t*.4+'px 0 '+t*2+'px rgba(128,128,128,'+(i*.6)+')';
}
shadow.style.webkitBoxShadow=shadow.style.boxShadow;
el.insertBefore(shadow,el.firstChild);
el.insertBefore(border,el.firstChild);
el.insertBefore(layer,el.firstChild);
if(atom){
atom.style.backgroundColor='transparent';
atom.style.background='transparent';
atom.style.opacity='0';
}

// Добавляем отслеживание изменений borderRadius у tn-atom с оптимизацией
if(atom){
var debounceTimeout;
var observer=new MutationObserver(function(mutations){
// Debounce для уменьшения частоты обновлений
clearTimeout(debounceTimeout);
debounceTimeout=setTimeout(function(){
  requestAnimationFrame(function(){
    mutations.forEach(function(mutation){
      if(mutation.type==='attributes'&&(mutation.attributeName==='style'||mutation.attributeName==='class')){
        var newBr=getComputedStyle(atom).borderRadius||'24px';
        el.style.borderRadius=newBr;
        el.style.webkitBorderRadius=newBr;
        layer.style.borderRadius=newBr;
        layer.style.webkitBorderRadius=newBr;
        border.style.borderRadius=newBr;
        border.style.webkitBorderRadius=newBr;
        shadow.style.borderRadius=newBr;
        shadow.style.webkitBorderRadius=newBr;
      }
    });
  });
}, 50);
});
observer.observe(atom,{attributes:true,attributeFilter:['style','class']});
}
});
}
if(document.readyState==='loading'){
document.addEventListener('DOMContentLoaded',function(){setTimeout(init,100)});
}else{
setTimeout(init,100);
}
if(window.t_onReady){
window.t_onReady(function(){setTimeout(init,200)});
}
window.addEventListener('load',function(){setTimeout(init,300)});
})();

// ===========================================
// КРИТИЧЕСКАЯ ОПТИМИЗАЦИЯ ДЛЯ СКРОЛЛА
// ===========================================
// Автоматическая оптимизация элементов для быстрого скролла
(function() {
  'use strict';
  
  // Локальная throttle функция для оптимизации скролла
  function throttleLocal(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    return function (...args) {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }
  
  // Оптимизация для предотвращения белого экрана при быстром скролле
  function optimizeScrollPerformance() {
    // Добавляем data-scroll атрибут для content-visibility
    const scrollElements = document.querySelectorAll('img, .tn-atom, .tn-element, .t-photo, .t-video');
    scrollElements.forEach(el => {
      if (!el.hasAttribute('data-scroll')) {
        el.setAttribute('data-scroll', 'true');
      }
    });
    
    // Устанавливаем loading="lazy" для всех изображений
    document.querySelectorAll('img:not([loading])').forEach(img => {
      img.loading = 'lazy';
    });
    
    // Оптимизация скролла с requestAnimationFrame
    let ticking = false;
    function smoothScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Принудительное обновление контента при скролле
          document.querySelectorAll('[data-scroll]').forEach(el => {
            const rect = el.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight + 100 && rect.bottom > -100;
            
            if (isVisible && el.style.contentVisibility === 'auto') {
              // Элемент видим - рендерим
              el.style.willChange = 'contents';
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    }
    
    // Throttled scroll listener
    const throttledScroll = throttleLocal(smoothScroll, 100);
    window.addEventListener('scroll', throttledScroll, { passive: true });
  }
  
  // Запускаем оптимизацию
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', optimizeScrollPerformance);
  } else {
    optimizeScrollPerformance();
  }
  
  // Запускаем также после полной загрузки для динамических элементов
  window.addEventListener('load', () => {
    setTimeout(optimizeScrollPerformance, 100);
  });
})();

// ===========================================
// СИНХРОНИЗАЦИЯ ШИРИНЫ ТИКЕРА И СЛАЙДЕРА
// ===========================================
// Синхронизирует ширину .ticker с .ticker-width и .slider с .slider-width
document.addEventListener("DOMContentLoaded", function() {
  const tickerWidth = document.querySelector(".ticker-width");
  const ticker = document.querySelector(".ticker");
  const sliderWidth = document.querySelector(".slider-width");
  const slider = document.querySelector(".slider");

  function syncWidth(source, target) {
    if (!source || !target) return;

    const observer = new ResizeObserver(entries => {
      // Используем requestAnimationFrame для оптимизации
      requestAnimationFrame(() => {
        for (let entry of entries) {
          target.style.width = entry.contentRect.width + "px";
        }
      });
    });

    observer.observe(source);
    // выставляем изначально
    target.style.width = source.offsetWidth + "px";
  }

syncWidth(tickerWidth, ticker);
syncWidth(sliderWidth, slider);
});

// ===========================================
// ИСПРАВЛЕНИЕ ПРОБЛЕМ С SVG В МОБИЛЬНОМ SAFARI
// ===========================================
// Исправляет проблему "съезжания" SVG элементов вниз в мобильном Safari
(function() {
  let initialized = false;
  
  function fixSVGInSafari() {
    if (initialized) return;
    initialized = true;
    
    // Проверяем, что это мобильный Safari
    const isMobileSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && 
                          /Safari/.test(navigator.userAgent) && 
                          !/Chrome/.test(navigator.userAgent);
    
    if (!isMobileSafari) return;
    
    // Находим все SVG элементы
    const svgElements = document.querySelectorAll('svg');
    
    svgElements.forEach(svg => {
      applySVGFix(svg);
    });
    
    // Наблюдаем за добавлением новых SVG элементов
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'SVG') {
              applySVGFix(node);
            }
            // Проверяем дочерние SVG элементы
            const childSvgs = node.querySelectorAll && node.querySelectorAll('svg');
            if (childSvgs) {
              childSvgs.forEach(applySVGFix);
            }
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  function applySVGFix(svg) {
    // Принудительно устанавливаем стили для исправления позиционирования
    svg.style.display = 'block';
    svg.style.position = 'relative';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.transform = 'translateZ(0)';
    svg.style.webkitTransform = 'translateZ(0)';
    svg.style.willChange = 'transform';
    
    // Убираем возможные отступы
    svg.style.margin = '0';
    svg.style.padding = '0';
    
    // Принудительный пересчет стилей
    svg.offsetHeight;
  }
  
  // Запуск при загрузке страницы
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixSVGInSafari);
  } else {
    fixSVGInSafari();
  }
})();

// ===========================================
// BURGER МЕНЮ
// ===========================================
document.addEventListener('DOMContentLoaded', function() {
    // Функция для открытия меню
    function openMenu(container) {
        container.classList.add('burger-open');
        if (container.parentElement) {
            container.parentElement.classList.add('burger-open');
        }
        // Блокируем скролл
        document.body.classList.add('burger-menu-open');
    }
    
    // Функция для закрытия меню
    function closeMenu(container) {
        container.classList.remove('burger-open');
        if (container.parentElement) {
            container.parentElement.classList.remove('burger-open');
        }
        // Разблокируем скролл
        document.body.classList.remove('burger-menu-open');
    }
    
    // Функция для закрытия всех меню
    function closeAllMenus() {
        const allContainers = document.querySelectorAll('.burger');
        allContainers.forEach(container => closeMenu(container));
        
        // Сбрасываем все состояния бургеров
        document.querySelectorAll('.burger-button').forEach(btn => {
            btn.classList.remove('active');
            const container = btn.closest('.burger');
            if (container && container.id) {
                localStorage.setItem('burgerButtonState_' + container.id, 'inactive');
            }
        });
    }
    
    // Находим все элементы с классом .burger
    const burgerContainers = document.querySelectorAll('.burger');
    
    burgerContainers.forEach(function(container) {
        // Находим div внутри .burger
        const innerDiv = container.querySelector('div');
        
        if (innerDiv) {
            // Создаем кнопку
            const burgerButton = document.createElement('button');
            burgerButton.className = 'burger-button';
            burgerButton.setAttribute('aria-label', 'Меню');
            
            // Создаем три полоски
            for (let i = 0; i < 3; i++) {
                const span = document.createElement('span');
                burgerButton.appendChild(span);
            }
            
            // Вставляем кнопку в div внутри .burger
            innerDiv.appendChild(burgerButton);
            
            // Сохраняем состояние в localStorage с уникальным ключом
            const containerId = container.id || 'burger-' + Math.random().toString(36).substr(2, 9);
            if (!container.id) {
                container.id = containerId;
            }
            
            const savedState = localStorage.getItem('burgerButtonState_' + containerId);
            if (savedState === 'active') {
                burgerButton.classList.add('active');
                // Восстанавливаем класс burger-open при загрузке страницы
                openMenu(container);
            }

            // Оптимизированный обработчик клика с requestAnimationFrame
            let isAnimating = false;
            burgerButton.addEventListener('click', function() {
                if (isAnimating) return;
                isAnimating = true;
                
                requestAnimationFrame(() => {
                    this.classList.toggle('active');
                    
                    if (this.classList.contains('active')) {
                        openMenu(container);
                        localStorage.setItem('burgerButtonState_' + containerId, 'active');
                    } else {
                        closeMenu(container);
                        localStorage.setItem('burgerButtonState_' + containerId, 'inactive');
                    }
                    
                    setTimeout(() => { isAnimating = false; }, 100);
                });
            }, { passive: true });
        }
    });
    
    // Оптимизированный обработчик клика по ссылкам в mylink
    let clickTimeout;
    document.addEventListener('click', function(e) {
        const mylinkElement = e.target.closest('.mylink');
        if (mylinkElement) {
            const link = mylinkElement.querySelector('a');
            if (link && link.href && !link.href.includes('javascript:')) {
                // Закрываем все меню немедленно для лучшей производительности
                closeAllMenus();
                
                // Переходим по ссылке с минимальной задержкой
                e.preventDefault();
                clearTimeout(clickTimeout);
                clickTimeout = setTimeout(() => {
                    window.location.href = link.href;
                }, 50);
            }
        }
    }, { passive: false });
});

// ===========================================
// COOKIE СОГЛАСИЕ
// ===========================================
(function() {
  'use strict';

  // Стандартный ключ для хранения согласия (GDPR compliant)
  const COOKIE_CONSENT_KEY = 'cookie_consent';
  const COOKIE_CONSENT_VERSION = '1.0';

  // Создаем HTML структуру cookie-баннера
  function createCookieBanner() {
    const banner = document.createElement('div');
    banner.className = 'cookie-consent-banner';
    banner.id = 'cookieConsentBanner';
    
    banner.innerHTML = `
      <div class="cookie-consent-wrapper">
        <div class="cookie-consent-text">
          Мы используем файлы cookie и другие технологии для улучшения работы сайта, аналитики и персонализации контента. 
          Продолжая использовать наш сайт, вы даете согласие на использование файлов cookie в соответствии с нашей 
          <a href="https://docs.google.com/document/d/1dVBOkRvPw-t-Fae05xhYXOaeqaM2Wcgo/edit" target="_blank">Политикой обработки персональных данных</a>.
        </div>
        <div class="cookie-consent-buttons">
          <button class="cookie-consent-btn cookie-consent-btn-accept" id="acceptCookies">Принять</button>
          <button class="cookie-consent-btn cookie-consent-btn-decline" id="declineCookies">Отклонить</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(banner);
    
    return banner;
  }

  // Проверяем, дал ли пользователь согласие
  function hasConsent() {
    // Проверяем localStorage
    const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    return storedConsent === 'accepted';
  }

  // Сохраняем согласие
  function saveConsent(accepted) {
    const consentValue = accepted ? 'accepted' : 'declined';
    const consentData = {
      status: consentValue,
      version: COOKIE_CONSENT_VERSION,
      timestamp: new Date().toISOString()
    };

    // Сохраняем в localStorage (единая точка хранения)
    localStorage.setItem(COOKIE_CONSENT_KEY, consentValue);
    localStorage.setItem(`${COOKIE_CONSENT_KEY}_data`, JSON.stringify(consentData));
    
    // Запускаем событие для других скриптов
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', {
      detail: { accepted: accepted }
    }));
    
    console.log('Cookie consent saved:', consentData);
  }

  // Показываем баннер
  function showBanner() {
    const banner = createCookieBanner();
    
    // Добавляем класс для анимации
    setTimeout(() => {
      banner.classList.add('show');
    }, 100);
    
    // Обработчики кнопок
    const acceptBtn = document.getElementById('acceptCookies');
    const declineBtn = document.getElementById('declineCookies');
    
    acceptBtn.addEventListener('click', function() {
      saveConsent(true);
      hideBanner();
    });
    
    declineBtn.addEventListener('click', function() {
      saveConsent(false);
      hideBanner();
    });
  }

  // Скрываем баннер
  function hideBanner() {
    const banner = document.getElementById('cookieConsentBanner');
    if (banner) {
      banner.style.opacity = '0';
      banner.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
      banner.style.transform = 'translateY(100%)';
      
      setTimeout(() => {
        if (banner.parentNode) {
          banner.parentNode.removeChild(banner);
        }
      }, 300);
    }
  }

  // Инициализация
  function init() {
    // Проверяем, нужно ли показывать баннер
    if (!hasConsent()) {
      // Небольшая задержка для UX
      setTimeout(() => {
        showBanner();
      }, 1000);
    } else {
      console.log('Cookie consent already given');
    }
  }

  // Запускаем при загрузке страницы
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();