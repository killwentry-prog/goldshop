# ExpShop — Gold Standoff 2

Telegram Mini App + Telegram Bot для магазина продажи Gold Standoff 2.

Менеджер: **@expshopgold**

## Стек

- Backend: Node.js, TypeScript, Express, Telegraf, better-sqlite3
- Frontend: React, Vite, TailwindCSS, Framer Motion, Telegram WebApp SDK
- Деплой: Docker, Railway
- Качество кода: ESLint, Prettier, строгий TypeScript

## Структура проекта

```
expshop/
├── backend/           # API + Telegram-бот
│   └── src/
│       ├── bot/       # логика бота, уведомления админу
│       ├── db/        # SQLite, миграции, доступ к данным
│       ├── middleware/# проверка initData, admin-guard
│       ├── routes/    # REST-роуты
│       └── utils/     # расчёт цены
├── frontend/          # Mini App (React + Vite)
│   └── src/
│       ├── components/
│       ├── lib/       # API-клиент, Telegram SDK хелперы
│       └── pages/
├── Dockerfile
├── railway.json
├── docker-compose.yml
└── .env.example
```

---

## 1. Как создать бота

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram.
2. Отправьте `/newbot`, укажите имя и username бота (например, `ExpShopGoldBot`).
3. BotFather выдаст токен вида `123456789:AA...` — это `BOT_TOKEN`.
4. Узнайте свой Telegram ID (например, через [@userinfobot](https://t.me/userinfobot)) — это `ADMIN_ID`.

## 2. Как подключить Mini App

1. В BotFather выполните `/mybots` → выберите бота → **Bot Settings → Menu Button** (или `/setmenubutton`).
2. В качестве URL укажите ваш будущий домен Railway, например `https://expshop.up.railway.app`.
3. Дополнительно можно настроить `/newapp`, если нужен отдельный Mini App с собственной ссылкой (Direct Link).

## 3. Как получить домен Railway

1. Зарегистрируйтесь на [railway.app](https://railway.app) и создайте новый проект.
2. Подключите этот репозиторий (Deploy from GitHub repo) — Railway автоматически найдёт `Dockerfile`.
3. После первого деплоя зайдите в **Settings → Networking → Generate Domain** — получите публичный URL вида `https://<project>.up.railway.app`.

## 4. Как прописать WebApp URL

1. Скопируйте домен из Railway.
2. В переменных окружения проекта (см. ниже) укажите `WEBAPP_URL=https://<project>.up.railway.app` (без слэша на конце).
3. Обновите Menu Button / Mini App ссылку в BotFather на этот же URL.
4. Перезапустите деплой в Railway, чтобы бот подхватил новый `WEBAPP_URL`.

## 5. Переменные окружения

Скопируйте `.env.example` → `.env` и заполните:

```
BOT_TOKEN=            # токен от BotFather
ADMIN_ID=              # ваш Telegram ID
WEBAPP_URL=            # https://<project>.up.railway.app
DATABASE_URL=./data/expshop.db
PORT=3000
GOLD_RATE_UAH=0.30
MIN_ORDER_GOLD=500
LISTING_MARKUP=1.25
SHOP_NAME=ExpShop
MANAGER_USERNAME=expshopgold
```

В Railway эти переменные задаются в **Project → Variables**.

## 6. Как запустить локально

Требуется Node.js 20+.

```bash
# Backend
cd backend
cp ../.env.example ../.env   # если ещё не создан
npm install
npm run dev                  # http://localhost:3000

# Frontend (в отдельном терминале)
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

Фронтенд в dev-режиме проксирует `/api` на `http://localhost:3000` (см. `vite.config.ts`).
Для тестирования вне Telegram middleware проверки подписи работает в мягком режиме (dev), в production — строго проверяет `initData`.

Локально через Docker Compose:

```bash
docker compose up --build
```

## 7. Как задеплоить на Railway

1. Запушьте проект в свой GitHub-репозиторий.
2. В Railway: **New Project → Deploy from GitHub repo**, выберите репозиторий.
3. Railway соберёт образ по `Dockerfile` (мультистейдж: фронтенд собирается в статику, бэкенд — в `dist/`, финальный образ раздаёт и API, и Mini App с одного домена).
4. Укажите переменные окружения (см. пункт 5).
5. Сгенерируйте домен (Settings → Networking → Generate Domain).
6. Пропишите этот домен в `WEBAPP_URL` и обновите ссылку в BotFather.
7. Готово — бот и Mini App работают на одном Railway-сервисе.

> Для персистентности БД и загруженных скриншотов между деплоями подключите Railway Volume к `/app/backend/data` и `/app/backend/uploads`.

---

## Как это работает

1. Пользователь открывает Mini App через бота, вводит количество Gold (от 500).
2. Backend считает стоимость в грн по курсу (`GOLD_RATE_UAH`) и создаёт заказ.
3. Пользователю показывается сумма, на которую нужно выставить любой предмет на торговой площадке Standoff 2 (`Gold × LISTING_MARKUP` + уникальные случайные копейки).
4. Пользователь загружает скриншот — бот отправляет админу карточку заказа с фото и кнопками **✅ Принять / ❌ Отклонить**.
5. При нажатии кнопки пользователь получает автоматическое уведомление о статусе заказа.
6. Все заказы, статистика и отзывы доступны в админке (`/admin` внутри Mini App), доступ проверяется по `ADMIN_ID` через подпись `initData`.

## О разделе «Отзывы»

Раздел отзывов подключён к реальной БД с модерацией: пользователи отправляют отзыв через форму, он попадает в очередь на проверку (`approved = 0`), администратор одобряет его через API (`/api/admin/reviews/:id/approve`) — сейчас в UI админки нет отдельной вкладки модерации отзывов, она легко добавляется по аналогии со списком заказов, эндпоинты для этого уже готовы (`GET /api/admin/reviews`, `POST /api/admin/reviews/:id/approve|reject`).

## Лицензия / ответственность

Механика «выставление лота дороже на комиссию» завязана на правилах торговой площадки Standoff 2 и может противоречить пользовательскому соглашению самой игры/маркетплейса — перед запуском в коммерческую эксплуатацию проверьте актуальные правила площадки.
