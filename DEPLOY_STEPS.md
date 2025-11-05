# 🎯 Быстрая инструкция: GitHub → Render

## ✅ Шаг 1: GitHub (Готово!) 

Ваш проект уже на GitHub:
**https://github.com/HoustonTon/ton-spread-calculator**

---

## 🚀 Шаг 2: Деплой на Render (5 минут)

### 1. Откройте Render
👉 https://render.com

### 2. Войдите через GitHub
- Нажмите **"Get Started"**
- Выберите **"Sign up with GitHub"**
- Разрешите доступ к репозиториям

### 3. Создайте Web Service
- Нажмите **"New +"** → **"Web Service"**
- Найдите репозиторий: `ton-spread-calculator`
- Нажмите **"Connect"**

### 4. Заполните настройки:

```
Name: ton-spread-calculator
Region: Frankfurt (EU Central)
Branch: main
Runtime: Node

Build Command: npm install
Start Command: npm start

Instance Type: Free
```

### 5. Нажмите **"Create Web Service"**

### 6. Дождитесь деплоя (3-5 минут)

Вы увидите логи:
```
==> Cloning from GitHub...
==> Running 'npm install'...
==> Starting service...
✓ Live!
```

### 7. Получите URL

После деплоя вверху появится URL:
```
https://ton-spread-calculator.onrender.com
```

---

## 📱 Шаг 3: Настройка в Telegram

### 1. Откройте @BotFather

### 2. Создайте Mini App:
```
/newapp
```

### 3. Заполните данные:
- Выберите вашего бота
- Название: TON Spread Calculator
- Описание: Калькулятор спреда TON
- URL: https://ton-spread-calculator.onrender.com/index.html
- Короткое имя: TON Calc

---

## ✅ Готово!

Ваше приложение теперь:
- ✅ На GitHub: https://github.com/HoustonTon/ton-spread-calculator
- ✅ На Render: https://ton-spread-calculator.onrender.com
- ✅ В Telegram: Mini App доступен всем пользователям

---

## 🔄 Обновление приложения:

Когда нужно обновить код:

```bash
cd Documents/ton-spread-calculator
# Внесите изменения в файлы
git add .
git commit -m "Описание изменений"
git push
```

Render **автоматически** пересоберет и задеплоит новую версию!

---

## 💡 Полезные ссылки:

- **GitHub репозиторий:** https://github.com/HoustonTon/ton-spread-calculator
- **Render Dashboard:** https://dashboard.render.com
- **Документация Render:** https://render.com/docs
- **Полная инструкция:** См. [`RENDER_DEPLOY.md`](RENDER_DEPLOY.md)