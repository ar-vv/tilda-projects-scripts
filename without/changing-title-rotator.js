(function () {
  'use strict';

  function setupChangingTitle(root) {
    if (!root) return;

    // Ожидаем структуру: .changing-title > div > p
    var innerDiv = root.querySelector('div') || root;
    var firstP = innerDiv.querySelector('p');
    if (!firstP) return;

    // Добавляем ещё 4 <p> с нужными текстами
    var texts = ['удобно', 'легко', 'надёжно', 'хочется'];
    texts.forEach(function (t) {
      var p = firstP.cloneNode(true);
      p.textContent = t;
      innerDiv.appendChild(p);
    });

    // Подготовка всех <p> к смене (показываем по одному)
    var items = Array.prototype.slice.call(innerDiv.querySelectorAll('p'));
    items.forEach(function (el) {
      el.classList.remove('active');
      el.setAttribute('aria-hidden', 'true');
    });

    var index = 0;
    items[index].classList.add('active');
    items[index].setAttribute('aria-hidden', 'false');

    // Смена каждые 1 сек, по кругу
    setInterval(function () {
      var prev = index;
      index = (index + 1) % items.length;

      items[prev].classList.remove('active');
      items[prev].setAttribute('aria-hidden', 'true');

      items[index].classList.add('active');
      items[index].setAttribute('aria-hidden', 'false');
    }, 1000);
  }

  function initAll() {
    var blocks = document.querySelectorAll('.changing-title');
    if (!blocks || !blocks.length) return;
    blocks.forEach(function (b) { setupChangingTitle(b); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();


