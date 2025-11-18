(function () {
  const DATA_ATTR = 'data-test-shadow';
  const PROCESSED_FLAG = 'data-test-shadow-ready';

  const pickScripts = () =>
    Array.from(document.querySelectorAll(`script[${DATA_ATTR}]:not([${PROCESSED_FLAG}])`));

  const initTest = (script) => {
    const host = script.parentElement;
    if (!host) return;

    // Получаем параметры (опционально)
    const explicitHeight = Number(script.getAttribute('data-height')) || null;
    const explicitWidth = Number(script.getAttribute('data-width')) || null;

    // Удаляем скрипт из DOM
    script.remove();

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

    // Функция для автоматического определения размеров контейнера
    const detectContainerSize = () => {
      // Ищем родителя с классом tn-elem
      const tnElem = findTnElem(host);
      
      if (tnElem) {
        // Пытаемся получить размеры из атрибутов data-field
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

        if (width > 0 && height > 0) {
          return { width, height };
        }
      }

      // Fallback: если tn-elem не найден, возвращаем 0
      return { width: 0, height: 0 };
    };

    // Автоматически определяем размеры контейнера
    const detectedSize = detectContainerSize();

    // Устанавливаем размеры для host, если они не заданы явно
    if (explicitWidth) {
      host.style.width = `${explicitWidth}px`;
    } else if (detectedSize.width > 0 && !host.style.width && !host.getAttribute('style')?.includes('width')) {
      host.style.width = `${detectedSize.width}px`;
    }

    if (explicitHeight) {
      host.style.height = `${explicitHeight}px`;
    } else if (detectedSize.height > 0 && !host.style.height && !host.getAttribute('style')?.includes('height')) {
      host.style.height = `${detectedSize.height}px`;
    }

    // Устанавливаем базовые стили для host
    if (!host.style.position) host.style.position = 'relative';
    if (!host.style.display) host.style.display = 'block';
    if (!host.style.overflow) host.style.overflow = 'hidden';

    // Создаем Shadow DOM
    const shadowRoot = host.shadowRoot || host.attachShadow({ mode: 'open' });

    // Создаем стили
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        position: relative;
        box-sizing: border-box;
      }

      .test-box {
        width: 100%;
        height: 100%;
        background-color: red;
        box-sizing: border-box;
      }
    `;

    // Создаем красный прямоугольник
    const box = document.createElement('div');
    box.className = 'test-box';

    // Очищаем и добавляем элементы
    shadowRoot.innerHTML = '';
    shadowRoot.append(style, box);

    // Функция для получения текущих размеров из tn-elem
    const getHostSize = () => {
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

    // Обновляем размеры при изменении размера контейнера
    const updateSize = () => {
      const hostSize = getHostSize();
      console.log('Размеры из tn-elem:', hostSize);
      
      // Обновляем размеры host, если они изменились
      if (hostSize.width > 0 && hostSize.height > 0) {
        if (!explicitWidth) {
          host.style.width = `${hostSize.width}px`;
        }
        if (!explicitHeight) {
          host.style.height = `${hostSize.height}px`;
        }
      }
    };

    // Ждем один кадр для получения актуальных размеров
    requestAnimationFrame(() => {
      updateSize();
    });

    // Отслеживаем изменения размеров
    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(host);
    
    // Также отслеживаем изменения в tn-elem, если он найден
    const tnElem = findTnElem(host);
    if (tnElem) {
      resizeObserver.observe(tnElem);
      
      // Отслеживаем изменения атрибутов tn-elem через MutationObserver
      const mutationObserver = new MutationObserver(() => {
        updateSize();
      });
      mutationObserver.observe(tnElem, {
        attributes: true,
        attributeFilter: ['data-field-width-value', 'data-field-height-value', 'style']
      });
    }
  };

  const mount = () => {
    const scripts = pickScripts();
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

