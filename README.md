# 🎮 STARTY // Unity + NestJS Backend Starter

[![NestJS](https://img.shields.io/badge/NestJS-v10.3-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Unity](https://img.shields.io/badge/Unity-2021%2B%20%7C%202022%20%7C%202023-black?style=for-the-badge&logo=unity&logoColor=white)](https://unity.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](http://localhost:3000/api)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

> **Стартовый шаблон серверного бэкенда на NestJS для подключения клиентских игр на Unity.**
> Разработан для практических занятий школы разработки **STARTY Studio** под руководством ментора [@newbshark](https://github.com/newbshark).

---

## ⚡ Архитектура: как это устроено

Вместо того чтобы хранить критическую игровую логику внутри скомпилированного клиента Unity (где её легко взломать через чит-энжины), мы выносим её на авторитетный сервер NestJS.

```
┌─────────────────────────────────┐                 ┌─────────────────────────────────┐
│       🎮 UNITY КЛИЕНТ           │                 │       🚀 БЭКЕНД NESTJS          │
│   (Игровой клиент C#)           │                 │    (Авторитетный сервер)        │
│                                 │                 │                                 │
│  [HUD / Игрок]                  │                 │  [Swagger UI: /api]             │
│        │                        │                 │        │                        │
│        ▼                        │  HTTP GET/POST  │        ▼                        │
│  [ServerBridge.cs] ─────────────┼────────────────►│  [ServerController]             │
│  • UnityWebRequest              │   JSON Data     │  • @Get('status')               │
│  • JsonUtility                  │                 │  • @Get('motd')                 │
│  • Singleton + Coroutines       │                 │  • app.enableCors()             │
└─────────────────────────────────┘                 └─────────────────────────────────┘
```

### Преимущества связки:
1. **Легковесность:** На клиенте нужен всего **один C# файл (`ServerBridge.cs`)** весом 4 КБ без сторонних тяжелых библиотек.
2. **Мгновенная проверка в браузере:** Каждый написанный метод можно сразу протестировать через интерактивный **Swagger UI** (`/api`).
3. **Безопасность:** Деньги, лутбоксы, опыт и античит контролируются сервером.
4. **Прокачка взрослого стека:** Работа с реальным TypeScript, декораторами NestJS, базами данных SQLite/Prisma и REST API.

---

## 🚀 Быстрый старт (за 60 секунд)

### 1. Установка и запуск бэкенда

Убедитесь, что у вас установлен [Node.js](https://nodejs.org/) (версия 18 или выше).

```bash
# 1. Клонируйте репозиторий себе на компьютер
git clone https://github.com/newbshark/unity-backend-starter.git

# 2. Перейдите в папку проекта
cd unity-backend-starter

# 3. Установите зависимости
npm install

# 4. Запустите сервер в режиме горячей перезагрузки (watch mode)
npm run start:dev
```

После запуска в консоли появится сообщение:
```
====================================================
🚀 Игровой бэкенд запущен: http://localhost:3000
📖 Swagger документация: http://localhost:3000/api
🎮 Unity ServerBridge готов принимать подключения!
====================================================
```

Откройте в браузере: **[http://localhost:3000/api](http://localhost:3000/api)** для проверки эндпоинтов!

---

### 2. Подключение к Unity

1. Откройте ваш проект в Unity.
2. Перетащите файл `unity-client/ServerBridge.cs` в папку `Assets/Scripts/` вашего проекта Unity.
3. Добавьте пример вызова (или используйте `unity-client/ServerBridgeExample.cs`):

```csharp
using UnityEngine;

public class MyGameController : MonoBehaviour
{
    void Start()
    {
        // Проверяем статус бэкенда
        ServerBridge.Instance.GetServerStatus((status) =>
        {
            Debug.Log($"[Бэкенд в сети!] Статус: {status.status}, Аптайм: {status.uptimeSeconds} сек");
        },
        (error) =>
        {
            Debug.LogError($"[Ошибка подключения]: {error}");
        });
    }
}
```
4. Нажмите **Play** в Unity и проверьте Console — вы увидите зеленый лог с данными сервера!

---

## 🗺️ Программа курса (Модули)

| Модуль | Тема занятия | Что пишем на NestJS | Что видит игрок в Unity |
| :--- | :--- | :--- | :--- |
| **01** | **Первое рукопожатие** | Контроллер `server`, статусы, CORS, Swagger | Зеленая лампочка пинга и текст MOTD в меню |
| **02** | **Игровой магазин** | POST запросы, DTO валидация баланса | Покупка меча/скина с автообновлением монет |
| **03** | **Античит валидация** | Серверная проверка урона, скорости и таймингов | Блокировка читерских пакетов, бан читеров |
| **04** | **База данных игроков** | SQLite + Prisma ORM, сохранение профилей | Прогресс не сбрасывается при перезапуске |
| **05** | **Серверные Лутбоксы** | Безопасный серверный RNG, вероятности дропа | Анимация открытия сундука с редким дропом |
| **06** | **Таблица лидеров** | Сортировка топ-10 игроков, деплой на VPS | Экран Highscores с реальными никами ребят |

---

## 📋 Как сдавать задания через GitHub

В нашей команде мы работаем как в настоящих IT-компаниях: через **Issues** и **GitHub Projects**!

1. Перейдите во вкладку **Issues** этого репозитория.
2. Нажмите зеленую кнопку **New Issue**.
3. Выберите шаблон **🚀 Сдача домашнего задания / Фичи**.
4. Заполните чек-лист:
   - Прикрепите скриншот открытого **Swagger UI** (`http://localhost:3000/api`).
   - Прикрепите скриншот консоли **Unity** с успешным ответом.
5. Нажмите **Submit new issue**. Ментор [@newbshark](https://github.com/newbshark) проверит ваше решение и оставит ревью!

---

## ⚠️ Частые ошибки и их решение (Troubleshooting)

### 🔴 Ошибка `Cannot GET /server/status` (404)
- **Причина:** Неправильно указан маршрут в декораторе `@Controller('server')` или `@Get('status')`.
- **Решение:** Проверьте точное совпадение URL в Swagger.

### 🔴 Ошибка `CORS policy: No 'Access-Control-Allow-Origin'`
- **Причина:** Забыли включить CORS в `src/main.ts`.
- **Решение:** Убедитесь, что в `bootstrap()` есть вызов `app.enableCors()`.

### 🔴 Ошибка `Connection refused` в Unity
- **Причина:** Сервер NestJS выключен или упал из-за ошибки в коде.
- **Решение:** Загляните в консоль терминала с `npm run start:dev` и устраните ошибку синтаксиса.

---

## 📜 Лицензия
MIT © 2026 [newbshark](https://github.com/newbshark) & STARTY Studio.
