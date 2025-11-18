(function () {
  const DATA_ATTR = 'data-test-shadow';
  const PROCESSED_FLAG = 'data-test-shadow-ready';

  const pickScripts = () =>
    Array.from(document.querySelectorAll(`script[${DATA_ATTR}]:not([${PROCESSED_FLAG}])`));

  const initTest = (script) => {
    const host = script.parentElement;
    if (!host) return;

    // Удаляем скрипт из DOM
    script.remove();

    // Устанавливаем базовые стили для host
    if (!host.style.position) host.style.position = 'relative';
    if (!host.style.display) host.style.display = 'block';
    if (!host.style.overflow) host.style.overflow = 'hidden';

    // Создаем красный прямоугольник
    const box = document.createElement('div');
    box.style.cssText = `
      width: 100%;
      height: 100%;
      background-color: red;
      box-sizing: border-box;
    `;

    // Очищаем host и добавляем красный div
    host.innerHTML = '';
    host.appendChild(box);
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

