import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import { migrate } from './db';
import { metaRouter } from './routes/meta';
import { ordersRouter } from './routes/orders';
import { reviewsRouter } from './routes/reviews';
import { adminRouter } from './routes/admin';
import { statsRouter } from './routes/stats';
import { profileRouter } from './routes/profile';
import { bot } from './bot';
import { verifyTelegramInitData, verifyTelegramInitDataDev } from './middleware/telegramAuth';

migrate();

const app = express();
const isProd = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// В production подпись initData проверяется строго, в dev — мягко,
// чтобы было удобно тестировать вне Telegram.
const telegramAuth = isProd ? verifyTelegramInitData : verifyTelegramInitDataDev;

app.get('/health', (_req, res) => res.json({ ok: true, service: config.shopName }));

app.use('/api/meta', metaRouter);
app.use('/api/orders', telegramAuth, ordersRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/admin', telegramAuth, adminRouter);
app.use('/api/stats', statsRouter);
app.use('/api/profile', telegramAuth, profileRouter);

app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Отдаём собранный фронтенд (frontend/dist), если он есть рядом со сборкой бэкенда.
const frontendDist = path.resolve(process.cwd(), '../frontend/dist');
app.use(express.static(frontendDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    next();
    return;
  }
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) next();
  });
});

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`[${config.shopName}] API запущен на порту ${config.port}`);
});

if (config.botToken) {
  bot
    .launch()
    .then(() => console.log(`[${config.shopName}] Telegram-бот запущен`))
    .catch((err) => console.error('Не удалось запустить бота:', err));
} else {
  console.warn('BOT_TOKEN не задан — бот не запущен');
}

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
