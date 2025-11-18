(function () {
  const DATA_ATTR = 'data-test-shadow';
  const PROCESSED_FLAG = 'data-test-shadow-ready';

  const pickScripts = () =>
    Array.from(document.querySelectorAll(`script[${DATA_ATTR}]:not([${PROCESSED_FLAG}])`));

  const initTest = (script) => {
    const host = script.parentElement;
    if (!host) {
      console.error('[test-shadow] Host element not found');
      return;
    }

    console.log('[test-shadow] Initializing, host:', host);

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
    
    console.log('[test-shadow] Red box added to host');
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

