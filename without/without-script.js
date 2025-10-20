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
      // Создаем новые точки (7 штук)
      for (let i = 0; i < 7; i++) {
        const dot = document.createElement('div');
        dot.className = 'bar-dot';
        host.appendChild(dot);
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
    }, { passive: false });
  }

  function run() {
    initDots();
    initArrows();
    initSliderWidth();
  }

  // Установка ширины слайдера равной ширине блока .slider-width
  function initSliderWidth() {
    const sliderWidthBlocks = document.querySelectorAll('.slider-width');
    const sliders = document.querySelectorAll('.slider');
    
    function updateSliderWidths() {
      sliderWidthBlocks.forEach(block => {
        const width = block.getBoundingClientRect().width;
        block.style.setProperty('--slider-width', width + 'px');
      });
    }
    
    // Обновляем при загрузке
    updateSliderWidths();
    
    // Обновляем при изменении размера окна
    window.addEventListener('resize', updateSliderWidths);
    
    // Наблюдаем за изменениями размера блоков
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(updateSliderWidths);
      sliderWidthBlocks.forEach(block => resizeObserver.observe(block));
    }
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