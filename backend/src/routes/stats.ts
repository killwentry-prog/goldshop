import { Router } from 'express';
import { getPublicStats } from '../db/orders';
import { getRatingStats } from '../db/reviews';

export const statsRouter = Router();

// Публичный роут: отдаёт только агрегированные реальные цифры,
// никаких персональных данных. Используется на главной странице.
statsRouter.get('/', (_req, res) => {
  const orders = getPublicStats();
  const rating = getRatingStats();

  res.json({
    completedOrders: orders.completedOrders,
    clients: orders.clients,
    avgProcessingMinutes: orders.avgProcessingMinutes,
    totalGoldSold: orders.totalGoldSold,
    avgRating: rating.avgRating,
    reviewsCount: rating.count,
  });
});
