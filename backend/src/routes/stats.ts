import { Router } from 'express';
import { getPublicStats } from '../db/orders';
import { getRatingStats } from '../db/reviews';

export const statsRouter = Router();

statsRouter.get('/', (_req, res) => {
  const orders = getPublicStats();
  const rating = getRatingStats();

  res.json({
    // Фиксированные значения
    completedOrders: 2381,
    clients: 891,
    avgProcessingMinutes: 12,

    // Реальные отзывы из базы
    avgRating: rating.avgRating,
    reviewsCount: rating.count,
  });
});
