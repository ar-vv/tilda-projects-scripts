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

// ===========================================
// СКРИПТ ДЛЯ ТИКЕРА (БЕСШОВНАЯ АНИМАЦИЯ)
// ===========================================
// Применяется к элементам с классом .uc-ticker
// Создает бесшовную анимацию прокрутки изображений
(function () {
  // Определяем Safari для оптимизации
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  // Настройки скорости для разных браузеров
  const SPEED = isSafari ? 80 : 100;         // px/сек (медленнее для Safari)
  const MAX_WAIT_MS = 4000;

  const onReady = (fn)=>
    /complete|interactive|loaded/.test(document.readyState)
      ? fn()
      : document.addEventListener('DOMContentLoaded', fn);

  onReady(()=> {
    document.querySelectorAll('.uc-ticker').forEach(initOnce);
  });

  function initOnce(wrapper){
    if (wrapper.__ucTickerConveyorV2) return;
    wrapper.__ucTickerConveyorV2 = true;
    pipeline(wrapper).catch(err=>console.warn('[uc-ticker]', err));
  }

  async function pipeline(wrapper){
    const t0 = Date.now();
    const {ticker, H} = await waitTickerAndHeight(wrapper, t0);
    const {visual, inner} = prepareLayers(ticker);
    await collectReverseAndSize(wrapper, inner, H, t0);
    const track = buildSingleTrack(inner);              // единый трек
    fillTrackToWidth(track, ticker);                    // домножаем до 2.5× ширины окна
    runConveyor(track, ticker);                         // бесшовная анимация
  }

  /* ---------- ожидания/слои ---------- */
  function waitTickerAndHeight(wrapper, t0){
    return new Promise((resolve, reject)=>{
      (function probe(){
        const ticker = wrapper.querySelector('.ticker');
        if (ticker){
          const inlineH = (ticker.style && ticker.style.height || '').trim();
          const H = parseFloat(inlineH);
          if (H) return resolve({ticker, H});
        }
        if (Date.now() - t0 > MAX_WAIT_MS) return reject('ticker/inline height not ready');
        setTimeout(probe, 50);
      })();
    });
  }

  function prepareLayers(ticker){
    const visual = ticker.querySelector('.tn-atom') || ticker.querySelector('div') || ticker;
    visual.style.setProperty('position','relative','important');
    visual.style.setProperty('width','100%','important');
    visual.style.setProperty('height','100%','important');
    visual.style.setProperty('overflow','hidden','important');
    ticker.style.setProperty('overflow','hidden','important');

    let inner = visual.querySelector('.uc-ticker-inner');
    if(!inner){
      inner = document.createElement('div');
      inner.className = 'uc-ticker-inner';
      visual.appendChild(inner);
    }
    inner.style.setProperty('position','absolute','important');
    inner.style.setProperty('inset','0','important');
    inner.style.setProperty('overflow','hidden','important');
    return {visual, inner};
  }

  /* ---------- заморозка картинок (против повторной загрузки) ---------- */
  function freezeImage(img){
    // берём фактический урл, который сейчас отрисован (после всех подмен lazy-loader'а)
    const finalURL = img.currentSrc || img.src;
    if (finalURL) img.src = finalURL;

    // убираем механизмы, которые могут снова менять src
    img.removeAttribute('data-original');
    img.classList.remove('t-img');      // тильдинский lazy
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
    img.removeAttribute('loading');     // не ленивим клоны
    img.setAttribute('decoding','async');
  }

  /* ---------- сбор, разворот, размеры ---------- */
  function collectReverseAndSize(wrapper, inner, H, t0){
    return new Promise((resolve, reject)=>{
      (function step(){
        const imgs = Array.from(wrapper.querySelectorAll('img'))
          .filter(im => im.closest('.uc-ticker') === wrapper);
        if (!imgs.length){
          if (Date.now() - t0 > MAX_WAIT_MS) return reject('no images found');
          return setTimeout(step, 50);
        }

        // переносим в inner
        imgs.forEach(im => { if(!inner.contains(im)) inner.appendChild(im); });

        // разворот порядка
        Array.from(inner.querySelectorAll('img')).reverse().forEach(im => inner.appendChild(im));

        // размеры + заморозка
        const apply = ()=>{
          inner.querySelectorAll('img').forEach(im=>{
            im.style.setProperty('height', H + 'px', 'important');
            im.style.setProperty('width',  'auto', 'important');
            im.style.setProperty('max-width','none','important');
            im.style.setProperty('display','block','important');
            im.style.setProperty('object-fit','contain','important');
            im.style.setProperty('flex','0 0 auto','important');
            freezeImage(im);
          });
        };

        apply();

        // дождёмся, если что-то еще догружается, и тоже «заморозим»
        let pending = 0;
        inner.querySelectorAll('img').forEach(im=>{
          if(!im.complete){
            pending++;
            const done = ()=>{ freezeImage(im); apply(); if(--pending<=0) resolve(); };
            im.addEventListener('load', done, {once:true});
            im.addEventListener('error',done, {once:true});
          }
        });
        if(pending===0) resolve();
      })();
    });
  }

  /* ---------- один трек-конвейер ---------- */
  function buildSingleTrack(inner){
    let rail = inner.querySelector('.uc-ticker-rail');
    if(!rail){
      rail = document.createElement('div');
      rail.className = 'uc-ticker-rail';
      rail.style.position = 'absolute';
      rail.style.inset = '0';
      rail.style.overflow = 'hidden';
      rail.style.willChange = 'transform';
      rail.style.pointerEvents = 'none';
      inner.appendChild(rail);
    }
    let track = rail.querySelector('.uc-ticker-track');
    if(!track){
      track = document.createElement('div');
      track.className = 'uc-ticker-track';
      rail.appendChild(track);
    }

    // переносим все IMG в track
    track.textContent = '';
    Array.from(inner.querySelectorAll('img')).forEach(im => track.appendChild(im));
    styleTrack(track);
    return track;
  }

  function styleTrack(track){
    track.style.display = 'flex';
    track.style.alignItems = 'center';
    track.style.gap = '40px';
    track.style.flexWrap = 'nowrap';
    track.style.justifyContent = 'flex-start';
    track.style.willChange = 'transform';
    track.querySelectorAll('img').forEach(im=> im.style.setProperty('flex','0 0 auto','important'));
  }

  // дублируем до ≥ 2.5× ширины окна, клоны тоже «замораживаем»
  function fillTrackToWidth(track, ticker){
    const containerW = ticker.clientWidth || parseFloat(getComputedStyle(ticker).width) || 0;
    if(!containerW) return;
    const targetW = containerW * 2.5;
    const MAX_REPS = 20;
    let reps = 0;
    while (track.scrollWidth < targetW && reps < MAX_REPS){
      const clones = Array.from(track.children).map(n=>{
        const c = n.cloneNode(true);
        if (c.tagName === 'IMG') freezeImage(c);
        return c;
      });
      clones.forEach(n=> track.appendChild(n));
      reps++;
    }
  }

  function runConveyor(track, ticker){
    let offset = 0;
    let rafId = null, lastTs = 0;

    function getGapPx(){
      const cs = getComputedStyle(track);
      return parseFloat(cs.columnGap || cs.gap || '0') || 0;
    }

    function firstItemFullWidth(){
      const first = track.firstElementChild;
      if(!first) return 0;
      return first.getBoundingClientRect().width + getGapPx();
    }

    function apply(){
      // Для Safari используем более простой transform без 3D
      if (isSafari) {
        track.style.transform = 'translateX('+(-Math.round(offset))+'px)';
      } else {
        track.style.transform = 'translate3d('+(-Math.round(offset))+'px,0,0)';
      }
    }

    function tick(ts){
      if(!lastTs) lastTs = ts;
      const dt = (ts - lastTs)/1000; lastTs = ts;

      offset += SPEED * dt;

      // как только первый элемент полностью вышел — кидаем в конец и вычитаем его ширину
      let w;
      while ((w = firstItemFullWidth()) && offset >= w - 0.5) {
        track.appendChild(track.firstElementChild);
        offset -= w;
      }

      apply();
      
      // Для Safari используем более стабильный интервал
      if (isSafari) {
        rafId = setTimeout(() => requestAnimationFrame(tick), 16); // ~60fps
      } else {
        rafId = requestAnimationFrame(tick);
      }
    }

    function start(){ stop(); lastTs = 0; rafId = requestAnimationFrame(tick); }
    function stop(){ if(rafId){ cancelAnimationFrame(rafId); rafId = null; } }

    const remeasure = ()=>{
      stop();
      fillTrackToWidth(track, ticker);
      start();
    };

    if (window.ResizeObserver){
      const ro = new ResizeObserver(remeasure);
      ro.observe(ticker); ro.observe(track);
    } else {
      window.addEventListener('resize', remeasure, {passive:true});
    }

    // если какие-то изображения ещё дорисуются — «заморозим» и продолжим
    track.querySelectorAll('img').forEach(im=>{
      if(!im.complete){
        const done = ()=>{ freezeImage(im); remeasure(); };
        im.addEventListener('load', done, {once:true});
        im.addEventListener('error',done, {once:true});
      }
    });

    start();
  }
})();