(function () {
  const DATA_ATTR = 'data-test-shadow';
  const PROCESSED_FLAG = 'data-test-shadow-ready';

  const pickScripts = () =>
    Array.from(document.querySelectorAll(`script[${DATA_ATTR}]:not([${PROCESSED_FLAG}])`));

  // Функция для поиска родителя с классом tn-elem
  const findTnElem = (element) => {
    let current = element;
    let level = 0;
    while (current && level < 3) {
      if (current.classList && current.classList.contains('tn-elem')) {
        return current;
      }
      current = current.parentElement;
      level++;
    }
    return null;
  };

  // Функция для получения размера из стиля (например, "1240px" -> 1240)
  const parseSizeFromStyle = (styleValue) => {
    if (!styleValue) return 0;
    const match = styleValue.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  // Функция для получения размеров из tn-elem
  const getSizeFromTnElem = (host) => {
    const tnElem = findTnElem(host);
    if (!tnElem) {
      return { width: 0, height: 0 };
    }

    // Получаем размеры из атрибутов или стилей tn-elem
    let width = Number(tnElem.getAttribute('data-field-width-value')) || 0;
    let height = Number(tnElem.getAttribute('data-field-height-value')) || 0;

    // Если атрибуты не найдены, пытаемся получить из inline стилей
    if (width <= 0 && tnElem.style.width) {
      width = parseSizeFromStyle(tnElem.style.width);
    }

    if (height <= 0 && tnElem.style.height) {
      height = parseSizeFromStyle(tnElem.style.height);
    }

    // Если все еще не найдено, пытаемся получить из getComputedStyle
    if (width <= 0) {
      const computedWidth = getComputedStyle(tnElem).width;
      width = parseSizeFromStyle(computedWidth);
    }

    if (height <= 0) {
      const computedHeight = getComputedStyle(tnElem).height;
      height = parseSizeFromStyle(computedHeight);
    }

    return { width, height };
  };

  const initTest = (script) => {
    const host = script.parentElement;
    if (!host) {
      console.error('[test-shadow] Host element not found');
      return;
    }

    console.log('[test-shadow] Initializing, host:', host);

    // Удаляем скрипт из DOM
    script.remove();

    // Получаем размеры из tn-elem
    const size = getSizeFromTnElem(host);
    console.log('[test-shadow] Size from tn-elem:', size);

    // Устанавливаем базовые стили для host
    if (!host.style.position) host.style.position = 'relative';
    if (!host.style.display) host.style.display = 'block';
    if (!host.style.overflow) host.style.overflow = 'hidden';

    // Устанавливаем размеры для host, если они найдены
    if (size.width > 0) {
      host.style.width = `${size.width}px`;
    }
    if (size.height > 0) {
      host.style.height = `${size.height}px`;
    }

    // Создаем красный прямоугольник с явными размерами
    const box = document.createElement('div');
    if (size.width > 0 && size.height > 0) {
      // Используем явные размеры из tn-elem
      box.style.cssText = `
        width: ${size.width}px;
        height: ${size.height}px;
        background-color: red;
        box-sizing: border-box;
      `;
    } else {
      // Fallback на 100%, если размеры не найдены
      box.style.cssText = `
        width: 100%;
        height: 100%;
        background-color: red;
        box-sizing: border-box;
      `;
    }

    // Очищаем host и добавляем красный div
    host.innerHTML = '';
    host.appendChild(box);
    
    console.log('[test-shadow] Red box added to host with size:', size);
  };

  const mount = () => {
    const scripts = pickScripts();
    console.log('[test-shadow] Found scripts:', scripts.length);
    scripts.forEach((script) => {
      script.setAttribute(PROCESSED_FLAG, 'true');
      initTest(script);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})();

