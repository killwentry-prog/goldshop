import { Router } from 'express';
import { getRatingStats } from '../db/reviews';

export const statsRouter = Router();

statsRouter.get('/', (_req, res) => {
  const rating = getRatingStats();

  res.json({
    completedOrders: 2381,
    clients: 891,
    avgProcessingMinutes: 12,
    avgRating: rating.avgRating,
    reviewsCount: rating.count,
  });
});
