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
  
  // Инициализация точек навигации
  function initDots() {
    document.querySelectorAll('.bar').forEach(bar => {
      let host = bar.querySelector(':scope > div') || bar.querySelector('div');
      if (!host) return;
      host.classList.add('bar-dots');
      // Удаляем старые точки
      host.querySelectorAll(':scope > .bar-dot').forEach(n => n.remove());
      // Создаем новые точки (5 штук)
      for (let i = 0; i < 5; i++) {
        const dot = document.createElement('div');
        dot.className = 'bar-dot';
        dot.setAttribute('data-index', i);
        host.appendChild(dot);
      }
      
      // Добавляем отслеживание скрола для этого слайдера
      const slider = getSliderFor(bar);
      if (slider) {
        updateDotsForSlider(slider, bar);
        slider.addEventListener('scroll', () => updateDotsForSlider(slider, bar));
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

  // Вычисление шага прокрутки
  function getStep(slider) {
    const slide = slider.querySelector('.slide');
    const space = slider.querySelector('.space');
    const wSlide = slide ? slide.getBoundingClientRect().width : 0;
    const wSpace = space ? space.getBoundingClientRect().width : 0;
    return wSlide + wSpace;
  }

  // Обновление состояния точек в зависимости от позиции скрола
  function updateDotsForSlider(slider, bar) {
    const dots = bar.querySelectorAll('.bar-dot');
    if (!dots.length) return;
    
    const step = getStep(slider);
    const scrollLeft = slider.scrollLeft;
    
    // Вычисляем количество пройденных шагов (максимум 4 для 5 точек)
    const currentStep = Math.min(Math.round(scrollLeft / step), 4);
    
    // Обновляем состояние каждой точки
    dots.forEach((dot, index) => {
      if (index <= currentStep) {
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
        
        const step = getStep(slider);
        const dotIndex = parseInt(dot.getAttribute('data-index'));
        slider.scrollLeft = dotIndex * step;
        updateDotsForSlider(slider, bar);
        return;
      }
      
      // Обработка кликов по стрелкам навигации
      const arrow = e.target.closest('a[href="#right"], a[href="#left"]');
      if (arrow) {
        e.preventDefault();
        const slider = getSliderFor(arrow);
        if (!slider) return;
        
        const step = getStep(slider);
        if (arrow.getAttribute('href') === '#right') {
          slider.scrollLeft += step;
        } else {
          slider.scrollLeft -= step;
        }
        
        const bar = document.querySelector('.bar');
        if (bar) {
          updateDotsForSlider(slider, bar);
        }
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
        
        const molecules = document.querySelectorAll('.slider .tn-molecule');
        molecules.forEach((molecule) => {
          molecule.style.width = width + 'px';
        });
      });
    }
    
    // Обновляем при загрузке
    updateSliderWidths();
    
    // Обновляем при изменении размера окна
    window.addEventListener('resize', updateSliderWidths, { passive: true });
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