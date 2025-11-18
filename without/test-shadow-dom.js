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

    // Функция для автоматического определения размеров контейнера
    const detectContainerSize = () => {
      // Сначала пытаемся получить размеры из getBoundingClientRect
      const rect = host.getBoundingClientRect();
      let width = rect.width;
      let height = rect.height;

      // Если размеры не получены, пробуем другие методы
      if (width <= 0 || !isFinite(width)) {
        width = host.offsetWidth || 
                host.clientWidth || 
                parseInt(getComputedStyle(host).width) || 
                0;
      }

      if (height <= 0 || !isFinite(height)) {
        height = host.offsetHeight || 
                 host.clientHeight || 
                 parseInt(getComputedStyle(host).height) || 
                 0;
      }

      return { width, height };
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

    // Функция для получения текущих размеров родителя
    const getHostSize = () => {
      const rect = host.getBoundingClientRect();
      return {
        width: rect.width || host.offsetWidth || 0,
        height: rect.height || host.offsetHeight || 0
      };
    };

    // Обновляем размеры при изменении размера контейнера
    const updateSize = () => {
      const hostSize = getHostSize();
      console.log('Размеры родителя (автоматически определены):', hostSize);
      
      // CSS уже должен автоматически заполнять контейнер через width: 100% и height: 100%
      // Но для отладки можем вывести информацию
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

