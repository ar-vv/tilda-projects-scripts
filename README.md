# Tilda Projects Scripts

Коллекция полезных скриптов и стилей для проектов на платформе Tilda.

## 📋 Содержание

- [Описание](#описание)
- [Структура проекта](#структура-проекта)
- [Установка и использование](#установка-и-использование)
- [Примеры скриптов](#примеры-скриптов)
- [Стили](#стили)
- [Рекомендации](#рекомендации)
- [Вклад в проект](#вклад-в-проект)

## Описание

Этот репозиторий содержит готовые к использованию скрипты JavaScript и CSS стили, которые можно легко интегрировать в проекты Tilda для расширения функциональности и улучшения пользовательского опыта.

## Структура проекта

```
tilda-projects-scripts/
├── README.md                 # Этот файл
├── examples/                 # Примеры использования
│   ├── animations/           # Анимации и эффекты
│   ├── forms/               # Работа с формами
│   ├── navigation/          # Навигация и меню
│   └── widgets/             # Кастомные виджеты
├── scripts/                 # Готовые скрипты
│   ├── common/              # Общие функции
│   ├── ui/                  # UI компоненты
│   └── utils/               # Утилиты
├── styles/                  # CSS стили
│   ├── components/          # Стили компонентов
│   ├── layouts/             # Макеты
│   └── themes/              # Темы оформления
└── without/                 # Скрипты без зависимостей
```

## Установка и использование

### 1. Клонирование репозитория

```bash
git clone https://github.com/ar-vv/tilda-projects-scripts.git
cd tilda-projects-scripts
```

### 2. Интеграция в Tilda

#### Для JavaScript:
1. Откройте настройки сайта в Tilda
2. Перейдите в раздел "Настройки сайта" → "HTML код для вставки в <head>"
3. Добавьте нужный скрипт:

```html
<script>
// Вставьте код скрипта здесь
</script>
```

#### Для CSS:
1. Перейдите в "Настройки сайта" → "CSS"
2. Добавьте стили в конец файла

### 3. Использование готовых компонентов

Многие скрипты готовы к использованию без дополнительной настройки. Просто скопируйте код и вставьте в соответствующий раздел Tilda.

## Примеры скриптов

### Анимации

#### Плавное появление элементов при скролле
```javascript
// Файл: scripts/ui/scroll-animations.js
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initScrollAnimations);
```

### Работа с формами

#### Валидация формы
```javascript
// Файл: scripts/forms/form-validation.js
function validateForm(formSelector) {
    const form = document.querySelector(formSelector);
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('error');
                isValid = false;
            } else {
                input.classList.remove('error');
            }
        });

        if (isValid) {
            // Отправка формы
            console.log('Форма валидна, отправляем данные');
        }
    });
}
```

### Навигация

#### Мобильное меню
```javascript
// Файл: scripts/navigation/mobile-menu.js
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
}
```

## Стили

### Базовые стили для анимаций
```css
/* Файл: styles/components/animations.css */
.animate-on-scroll {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.6s ease-out;
}

.animate-on-scroll.animate-in {
    opacity: 1;
    transform: translateY(0);
}

.fade-in {
    animation: fadeIn 0.8s ease-in;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
```

### Стили для форм
```css
/* Файл: styles/components/forms.css */
.form-input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.3s ease;
}

.form-input:focus {
    outline: none;
    border-color: #007bff;
}

.form-input.error {
    border-color: #dc3545;
}

.form-button {
    background: #007bff;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.form-button:hover {
    background: #0056b3;
}
```

## Рекомендации

### Производительность
- Используйте `DOMContentLoaded` для инициализации скриптов
- Минимизируйте количество DOM запросов
- Используйте `requestAnimationFrame` для анимаций

### Совместимость
- Все скрипты протестированы в современных браузерах
- Используйте полифиллы для старых браузеров при необходимости

### Безопасность
- Валидируйте все пользовательские данные
- Используйте HTTPS для внешних запросов
- Избегайте использования `eval()` и подобных функций

## Вклад в проект

Мы приветствуем вклад в развитие проекта! 

### Как внести вклад:

1. Форкните репозиторий
2. Создайте ветку для новой функции: `git checkout -b feature/new-feature`
3. Внесите изменения и добавьте тесты
4. Сделайте коммит: `git commit -m 'Add new feature'`
5. Отправьте изменения: `git push origin feature/new-feature`
6. Создайте Pull Request

### Требования к коду:

- Код должен быть хорошо документирован
- Используйте понятные имена переменных и функций
- Добавляйте комментарии для сложной логики
- Следуйте принципам чистого кода

## Лицензия

Этот проект распространяется под лицензией MIT. См. файл [LICENSE](LICENSE) для подробностей.

## Поддержка

Если у вас есть вопросы или предложения, создайте [Issue](https://github.com/ar-vv/tilda-projects-scripts/issues) в репозитории.

---

**Создано с ❤️ для сообщества Tilda**
