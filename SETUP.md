# GitHub Pages Setup Instructions

## 🚨 Проблема: 404 ошибка

Если вы видите 404 ошибку при переходе по ссылкам, это означает, что GitHub Pages не настроен.

## ✅ Решение:

### 1. Перейдите в настройки репозитория
Откройте: https://github.com/ar-vv/tilda-projects-scripts/settings

### 2. Найдите раздел "Pages"
В левом меню найдите раздел "Pages"

### 3. Настройте источник
- **Source**: выберите "GitHub Actions"
- **Branch**: оставьте "main" (если есть выбор)
- Нажмите **"Save"**

### 4. Проверьте статус деплоя
- Перейдите в раздел "Actions" репозитория
- Убедитесь, что workflow "Deploy to GitHub Pages" выполнился успешно
- Если есть ошибки, исправьте их

### 5. Подождите несколько минут
GitHub Pages может потребовать несколько минут для активации.

## 🔗 После настройки ссылки будут работать:

- **CSS**: https://ar-vv.github.io/tilda-projects-scripts/style.css
- **JS**: https://ar-vv.github.io/tilda-projects-scripts/script.js
- **Главная страница**: https://ar-vv.github.io/tilda-projects-scripts/
- **Ссылки для копирования**: https://ar-vv.github.io/tilda-projects-scripts/links.html

## 🛠️ Альтернативное решение (если GitHub Actions не работает):

Если GitHub Actions не работает, можно использовать статический деплой:

1. В настройках Pages выберите **Source**: "Deploy from a branch"
2. **Branch**: выберите "main"
3. **Folder**: выберите "/ (root)"
4. Нажмите **"Save"**

## 📞 Если ничего не помогает:

1. Проверьте, что репозиторий публичный
2. Убедитесь, что файлы находятся в корне репозитория
3. Проверьте права доступа к репозиторию
