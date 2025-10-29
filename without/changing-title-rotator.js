(function () {
  'use strict';

  function setupChangingTitle(root) {
    if (!root || root.__changingTitleInitialized) return;
    root.__changingTitleInitialized = true;

    // Ожидаем структуру: .changing-title > .tn-atom > p (или просто div > p)
    var innerDiv = root.querySelector('.tn-atom') || root.querySelector('div') || root;
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
    if (blocks && blocks.length) {
      blocks.forEach(function (b) { setupChangingTitle(b); });
    }
  }

  // Инициализация при готовности DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Автоинициализация для динамически создаваемых узлов (Tilda отрисовывает позже)
  try {
    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var node = added[j];
          if (!(node instanceof Element)) continue;
          if (node.matches && node.matches('.changing-title')) {
            setupChangingTitle(node);
          }
          var found = node.querySelectorAll ? node.querySelectorAll('.changing-title') : [];
          if (found && found.length) {
            found.forEach(function (el) { setupChangingTitle(el); });
          }
        }
      }
    });
    observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
  } catch (e) {
    // no-op
  }
})();


