import { Router } from 'express';
import { getUserOrderSummary } from '../db/orders';

export const profileRouter = Router();

profileRouter.get('/', (req, res) => {
  const telegramUser = req.telegramUser;
  if (!telegramUser) {
    res.status(401).json({ error: 'Не удалось определить пользователя Telegram' });
    return;
  }

  const summary = getUserOrderSummary(telegramUser.id);

  res.json({
    id: telegramUser.id,
    username: telegramUser.username ?? null,
    firstName: telegramUser.first_name ?? null,
    totalGoldBought: summary.totalGoldBought,
    ordersCount: summary.ordersCount,
  });
});
