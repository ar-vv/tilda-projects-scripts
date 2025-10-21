/**
 * СКРИПТЫ ДЛЯ TILDA
 * 
 * Этот файл содержит все JavaScript скрипты для различных эффектов и функций
 */

// ===========================================
// СКРИПТ ДЛЯ АНИМАЦИИ РАЗМЫТИЯ И ДВИЖЕНИЯ
// ===========================================
// Применяется к элементам с классом .myblur
// Создает эффект случайного размытия и движения элементов
document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll(".myblur");

  elements.forEach(el => {
    // Базовые параметры размытия
    const baseBlur = 110; 
    const blurAmp = 15 + Math.random() * 15; // случайная амплитуда 15–30px
    const blurPeriod = (Math.random() * 6 + 4) * 1000; // период 4–10 секунд
    
    // Параметры движения
    const moveRadius = 100; // радиус движения
    const movePeriodX = (Math.random() * 8 + 6) * 1000; // период по X: 6–14 секунд
    const movePeriodY = (Math.random() * 8 + 6) * 1000; // период по Y: 6–14 секунд
    const phaseX = Math.random() * Math.PI * 2; // случайная фаза для X
    const phaseY = Math.random() * Math.PI * 2; // случайная фаза для Y

    let start = null;

    function animate(timestamp) {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;

      // Вычисление размытия
      const blurProgress = (elapsed % blurPeriod) / blurPeriod;
      const blurAngle = blurProgress * 2 * Math.PI;
      const blurValue = baseBlur + Math.sin(blurAngle) * blurAmp;

      // Вычисление движения по X
      const moveProgressX = (elapsed % movePeriodX) / movePeriodX;
      const angleX = moveProgressX * 2 * Math.PI + phaseX;
      const offsetX = Math.cos(angleX) * moveRadius;

      // Вычисление движения по Y
      const moveProgressY = (elapsed % movePeriodY) / movePeriodY;
      const angleY = moveProgressY * 2 * Math.PI + phaseY;
      const offsetY = Math.sin(angleY) * moveRadius;

      // Применение трансформаций к элементу
      el.style.filter = `blur(${blurValue}px)`;
      el.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  });
});

// ===========================================
// СКРИПТ ДЛЯ СТЕКЛЯННОГО ЭФФЕКТА
// ===========================================
// Применяется к элементам с классом .glass
// Создает эффект стеклянной поверхности с бликами и текстурой
(function() {
  const ADD_NOISE = true; // включить/выключить текстуру шума

  function enhance(atom) {
    if (!atom) return;
    atom.innerHTML = ''; // очищаем содержимое

    // Создаем элемент блика
    const glare = document.createElement('div');
    glare.className = 'glx-glare';

    // Создаем элемент полировки
    const polish = document.createElement('div');
    polish.className = 'glx-polish';

    // Создаем элемент виньетки
    const vignette = document.createElement('div');
    vignette.className = 'glx-vignette';

    // Добавляем элементы в атом
    atom.appendChild(glare);
    atom.appendChild(polish);
    atom.appendChild(vignette);

    // Добавляем текстуру шума если включена
    if (ADD_NOISE) {
      const noise = document.createElement('div');
      noise.className = 'glx-noise';
      atom.appendChild(noise);
    }
  }

  function init() {
    const atoms = document.querySelectorAll('.glass .tn-atom');
    atoms.forEach(atom => {
      enhance(atom);
      // Наблюдаем за изменениями в элементе
      const mo = new MutationObserver(() => {
        if (!atom.querySelector('.glx-vignette')) enhance(atom);
      });
      mo.observe(atom, { childList: true });
    });
  }

  // Инициализация при загрузке страницы
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('load', init);
})();

// ===========================================
// СКРИПТ ДЛЯ ГОРИЗОНТАЛЬНОГО СЛАЙДЕРА
// ===========================================
// Управляет слайдером с точками и стрелками навигации
(function () {
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

  // Обработчик клика по точкам для скрола
  function initDotClicks() {
    document.addEventListener('click', function(e) {
      const dot = e.target.closest('.bar-dot');
      if (!dot) return;
      
      e.preventDefault();
      
      const bar = dot.closest('.bar');
      const slider = getSliderFor(bar);
      if (!slider) return;
      
      const step = getStep(slider);
      const dotIndex = parseInt(dot.getAttribute('data-index'));
      
      // Скролим к нужной позиции
      slider.scrollLeft = dotIndex * step;
      
      // Обновляем состояние точек
      updateDotsForSlider(slider, bar);
    });
  }

  // Инициализация стрелок навигации
  function initArrows() {
    document.addEventListener('click', function (e) {
      const a = e.target.closest && e.target.closest('a[href="#right"], a[href="#left"]');
      if (!a) return;
      e.preventDefault();

      const slider = getSliderFor(a);
      if (!slider) return;

      const step = getStep(slider);
      // Прокрутка вправо или влево
      if (a.getAttribute('href') === '#right') {
        slider.scrollLeft += step;
      } else {
        slider.scrollLeft -= step;
      }
      
      // Обновляем точки после прокрутки
      const bar = document.querySelector('.bar');
      if (bar) {
        updateDotsForSlider(slider, bar);
      }
    }, { passive: false });
  }

  function run() {
    initDots();
    initArrows();
    initDotClicks();
    initSliderWidth();
  }

  // Простая установка ширины слайдера равной ширине блока .slider-width
  function initSliderWidth() {
    function updateSliderWidths() {
      const sliderWidthBlocks = document.querySelectorAll('.slider-width');
      console.log('Найдено блоков .slider-width:', sliderWidthBlocks.length);
      
      sliderWidthBlocks.forEach((block, index) => {
        const width = block.offsetWidth;
        console.log(`Блок .slider-width #${index + 1} ширина:`, width + 'px');
        
        const molecules = document.querySelectorAll('.slider .tn-molecule');
        console.log('Найдено блоков .slider .tn-molecule:', molecules.length);
        
        molecules.forEach((molecule, molIndex) => {
          molecule.style.width = width + 'px';
          console.log(`Блок .slider .tn-molecule #${molIndex + 1} получил ширину:`, width + 'px');
        });
      });
    }
    
    // Обновляем при загрузке
    console.log('Инициализация initSliderWidth...');
    updateSliderWidths();
    
    // Обновляем при изменении размера окна
    window.addEventListener('resize', () => {
      console.log('Изменение размера окна, обновляем ширины...');
      updateSliderWidths();
    });
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
})();

// ===========================================
// ОПТИМИЗИРОВАННЫЙ СТЕКЛЯННЫЙ ЭФФЕКТ
// ===========================================
// Применяется к элементам с классами .my-glass и .slide
// Создает оптимизированный стеклянный эффект с рефракцией
(function(){
'use strict';
var cfg={blur:8,saturate:180,contrast:110,grayThickness:5,grayIntensity:.5};
function init(){
var els=document.querySelectorAll('.my-glass,.slide');
if(!els.length)return;
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