# Tilda Projects Scripts CDN

Автоматически обновляемые скрипты и стили для Tilda. Каждый проект доступен по отдельной ссылке.

## 📁 Структура проектов

```
tilda-projects-scripts/
├── without/                 # Проект "without"
│   ├── script.js
│   └── style.css
├── my-new-project/          # Ваш новый проект
│   ├── script.js
│   └── style.css
└── another-project/         # Еще один проект
    ├── script.js
    └── style.css
```

## 🚀 Как добавить новый проект

1. **Создайте папку** для вашего проекта в корне репозитория
2. **Добавьте файлы** `script.js` и `style.css` в эту папку
3. **Сделайте коммит** и пуш в GitHub
4. **Проект автоматически** станет доступен по ссылке:
   - CSS: `https://ar-vv.github.io/tilda-projects-scripts/your-project-name/style.css`
   - JS: `https://ar-vv.github.io/tilda-projects-scripts/your-project-name/script.js`

## 📦 Доступные проекты

### 🎨 Without Project
- **Описание**: Анимации и визуальные эффекты
- **CSS**: https://ar-vv.github.io/tilda-projects-scripts/without/style.css
- **JS**: https://ar-vv.github.io/tilda-projects-scripts/without/script.js
- **Эффекты**: .myblur, .glass, .slider, .mybutton, .textglow, .mylink, .shadow

## ⚡ Автоматическое обновление

При каждом push в main ветку:
1. GitHub Actions автоматически деплоит весь репозиторий
2. Все папки с проектами становятся доступны по соответствующим URL
3. Ваши сайты автоматически получают обновления

## 🔧 Настройка GitHub Pages

1. Перейдите в настройки репозитория: Settings → Pages
2. Выберите источник: "GitHub Actions"
3. Сохраните настройки

## 📝 Инструкция для Tilda

1. Откройте настройки сайта в Tilda
2. Перейдите в "Настройки сайта" → "HTML код для вставки в <head>"
3. Добавьте ссылку на CSS нужного проекта
4. Перейдите в "HTML код для вставки перед </body>"
5. Добавьте ссылку на JS нужного проекта
6. Сохраните изменения

## 🎯 Примеры использования

```html
<!-- Для проекта "without" -->
<link rel="stylesheet" href="https://ar-vv.github.io/tilda-projects-scripts/without/style.css">
<script src="https://ar-vv.github.io/tilda-projects-scripts/without/script.js"></script>

<!-- Для проекта "my-new-project" -->
<link rel="stylesheet" href="https://ar-vv.github.io/tilda-projects-scripts/my-new-project/style.css">
<script src="https://ar-vv.github.io/tilda-projects-scripts/my-new-project/script.js"></script>
```

## 🔗 Формат URL

URL формируется по шаблону:
```
https://ar-vv.github.io/tilda-projects-scripts/[название-папки]/[файл]
```

Где:
- `[название-папки]` - название папки с проектом
- `[файл]` - `script.js` или `style.css`

---

**Создано с ❤️ для сообщества Tilda**
