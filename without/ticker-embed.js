(function () {
  const DATA_ATTR = 'data-ticker-embed';
  const PROCESSED_FLAG = 'data-ticker-ready';
  const DEFAULT_GAP = 24;
  const DEFAULT_SPEED = 70; // px в секунду

  const pickScripts = () =>
    Array.from(document.querySelectorAll(`script[${DATA_ATTR}]:not([${PROCESSED_FLAG}])`));

  const parseImages = (raw) => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch (_) {
      /* noop */
    }
    return raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const preload = (img) =>
    new Promise((resolve) => {
      if (img.complete) {
        resolve();
        return;
      }
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    });

  const buildStyle = () => {
    const style = document.createElement('style');
    style.textContent = `
      :host {
        all: initial;
      }

      *, *::before, *::after {
        box-sizing: border-box;
      }

      .ticker {
        width: 100%;
        height: 100%;
        overflow: hidden;
        position: relative;
        box-sizing: border-box;
      }

      .ticker-track {
        display: flex;
        align-items: center;
        height: 100%;
        gap: var(--ticker-gap, ${DEFAULT_GAP}px);
        will-change: transform;
        position: relative;
      }

      .ticker-track[data-ready="true"] {
        animation: ticker-scroll var(--ticker-duration, 30s) linear infinite;
      }

      .ticker-track img {
        height: 100%;
        width: auto;
        flex: 0 0 auto;
        object-fit: cover;
        background: #222;
      }

      .ticker:hover .ticker-track[data-pause="true"] {
        animation-play-state: paused;
      }

      @keyframes ticker-scroll {
        from {
          transform: translateX(0);
        }
        to {
          transform: translateX(var(--ticker-shift, -50%));
        }
      }
    `;
    return style;
  };

    const setHostDefaults = (host, explicitHeight) => {
      if (!host.style.position) host.style.position = 'relative';
      if (!host.style.display) host.style.display = 'block';
      if (!host.style.overflow) host.style.overflow = 'hidden';
      // Если высота явно указана в параметрах, устанавливаем её
      if (explicitHeight) {
        host.style.height = `${explicitHeight}px`;
      }
    };


  const initTicker = async (script) => {
    const host = script.parentElement;
    if (!host) return;

    const gap = Number(script.getAttribute('data-gap')) || DEFAULT_GAP;
    const speed = Number(script.getAttribute('data-speed')) || DEFAULT_SPEED;
    const pauseOnHover = script.getAttribute('data-pause-on-hover') === 'true';
    const height = Number(script.getAttribute('data-height')) || null;
    const urls = parseImages(script.getAttribute('data-images'));

    if (!urls.length) return;

    setHostDefaults(host, height);

    const shadowRoot = host.shadowRoot || host.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = '';

    const style = buildStyle();
    const wrapper = document.createElement('div');
    wrapper.className = 'ticker';

    const track = document.createElement('div');
    track.className = 'ticker-track';
    if (pauseOnHover) {
      track.dataset.pause = 'true';
    }

    // Сначала создаем один набор картинок
    urls.forEach((url, index) => {
      const img = document.createElement('img');
      img.src = url;
      img.alt = `ticker image ${index + 1}`;
      img.decoding = 'async';
      img.loading = 'lazy';
      track.appendChild(img);
    });

    wrapper.appendChild(track);
    shadowRoot.append(style, wrapper);

    let singleSetWidth = 0; // Ширина одного набора картинок

    const addCopies = () => {
      const containerWidth = host.offsetWidth;
      
      if (singleSetWidth <= 0 || !isFinite(singleSetWidth) || singleSetWidth > 100000) {
        return; // Защита от некорректных значений
      }
      
      if (containerWidth <= 0 || !isFinite(containerWidth)) {
        return; // Защита от некорректных значений контейнера
      }
      
      // Вычисляем сколько копий нужно: контейнер + запас (минимум 2x контейнера)
      const neededWidth = Math.max(containerWidth * 2, containerWidth + singleSetWidth);
      const totalCopiesNeeded = Math.ceil(neededWidth / singleSetWidth);
      
      // Ограничиваем максимальное количество копий (защита от бесконечного цикла)
      const maxCopies = Math.ceil((containerWidth * 3) / singleSetWidth);
      const limitedCopiesNeeded = Math.min(totalCopiesNeeded, maxCopies);
      
      // Считаем сколько уже есть наборов
      const currentImageCount = track.querySelectorAll('img').length;
      const currentSetsCount = currentImageCount / urls.length;
      const copiesToAdd = limitedCopiesNeeded - currentSetsCount;
      
      if (copiesToAdd <= 0) return;
      
      // Добавляем недостающие копии
      const originalImages = Array.from(track.querySelectorAll('img')).slice(0, urls.length);
      for (let i = 0; i < copiesToAdd; i++) {
        originalImages.forEach((originalImg) => {
          const img = document.createElement('img');
          img.src = originalImg.src;
          img.alt = originalImg.alt;
          img.decoding = 'async';
          img.loading = 'lazy';
          track.appendChild(img);
        });
      }
    };

    const calculateSingleSetWidth = () => {
      // Вычисляем ширину одного набора на основе первого набора картинок
      const firstSetImages = Array.from(track.querySelectorAll('img')).slice(0, urls.length);
      if (firstSetImages.length === 0) return 0;
      
      let totalWidth = 0;
      firstSetImages.forEach((img) => {
        if (img.complete && img.naturalWidth > 0) {
          // Вычисляем ширину с учетом высоты контейнера и пропорций изображения
          const containerHeight = host.offsetHeight;
          const aspectRatio = img.naturalWidth / img.naturalHeight;
          const imageWidth = containerHeight * aspectRatio;
          totalWidth += imageWidth;
        } else {
          // Если изображение еще не загружено, используем offsetWidth
          totalWidth += img.offsetWidth || 0;
        }
      });
      
      // Добавляем промежутки между картинками
      const gapsWidth = (firstSetImages.length - 1) * gap;
      return totalWidth + gapsWidth;
    };

    const updateMetrics = async () => {
      // Обновляем высоту контейнера, если она задана явно в параметрах
      if (height) {
        host.style.height = `${height}px`;
      }
      
      track.style.setProperty('--ticker-gap', `${gap}px`);
      
      // Ждем один кадр для получения актуальных размеров
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      // Вычисляем ширину одного набора более точно
      const calculatedWidth = calculateSingleSetWidth();
      if (calculatedWidth > 0 && isFinite(calculatedWidth) && calculatedWidth < 100000) {
        singleSetWidth = calculatedWidth;
      } else {
        // Fallback: используем текущие размеры track
        const totalImageCount = track.querySelectorAll('img').length;
        const setsCount = totalImageCount / urls.length;
        if (setsCount > 0 && track.scrollWidth > 0 && track.scrollWidth < 100000) {
          singleSetWidth = track.scrollWidth / setsCount;
        }
      }
      
      // Проверяем корректность значения
      if (singleSetWidth <= 0 || !isFinite(singleSetWidth) || singleSetWidth > 100000) {
        return; // Пропускаем обновление, если значение некорректно
      }
      
      // Добавляем копии если нужно (на основе текущей ширины контейнера)
      addCopies();
      
      // Ждем еще один кадр после добавления копий
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      // Пересчитываем после добавления копий (проверяем, что значение разумное)
      const finalImageCount = track.querySelectorAll('img').length;
      const finalSetsCount = finalImageCount / urls.length;
      if (finalSetsCount > 0 && track.scrollWidth > 0 && track.scrollWidth < 100000) {
        const recalculated = track.scrollWidth / finalSetsCount;
        if (recalculated > 0 && isFinite(recalculated) && recalculated < 100000) {
          singleSetWidth = recalculated;
        }
      }
      
      // Анимация сдвигается на ширину одного набора
      track.style.setProperty('--ticker-shift', `-${singleSetWidth}px`);
      const duration = singleSetWidth > 0 ? Math.max(6, singleSetWidth / speed) : 30;
      track.style.setProperty('--ticker-duration', `${duration}s`);
    };

    // Ждем загрузки первого набора изображений
    await Promise.all(Array.from(track.querySelectorAll('img')).map(preload));
    
    // Ждем один кадр для рендеринга, чтобы браузер успел вычислить реальные размеры
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    
    // Первоначальный расчет метрик и добавление копий
    await updateMetrics();
    
    // Ждем загрузки всех добавленных изображений (если они были добавлены)
    const allImages = Array.from(track.querySelectorAll('img'));
    if (allImages.length > urls.length) {
      await Promise.all(allImages.map(preload));
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await updateMetrics();
    }
    
    // Финальная проверка стабильности размеров
    await new Promise(resolve => requestAnimationFrame(resolve));
    const checkWidth = track.scrollWidth;
    await updateMetrics();
    
    if (Math.abs(track.scrollWidth - checkWidth) > 1) {
      await new Promise(resolve => requestAnimationFrame(resolve));
      await updateMetrics();
    }
    
    // Только теперь включаем анимацию
    track.setAttribute('data-ready', 'true');

    // Debounce для ResizeObserver, чтобы не вызывать updateMetrics слишком часто
    let resizeTimeout = null;
    const resizeObserver = new ResizeObserver(() => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeTimeout = setTimeout(() => {
        updateMetrics().catch((error) => {
          console.error('[ticker-embed] Ошибка при обновлении метрик:', error);
        });
      }, 100); // Задержка 100мс для группировки быстрых изменений
    });
    resizeObserver.observe(host);
  };

  const mount = () => {
    const scripts = pickScripts();
    scripts.forEach((script) => {
      script.setAttribute(PROCESSED_FLAG, 'true');
      initTicker(script).catch((error) => {
        console.error('[ticker-embed]', error);
      });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})();


