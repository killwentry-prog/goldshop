import { Router } from 'express';
import { z } from 'zod';
import { listApprovedReviews, createReview } from '../db/reviews';
import { notifyAdminNewReview } from '../bot';

export const reviewsRouter = Router();

reviewsRouter.get('/', (_req, res) => {
  res.json(listApprovedReviews());
});

const createReviewSchema = z.object({
  name: z.string().min(1).max(60),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(500),
});

// Пользовательские отзывы уходят на модерацию (approved = false),
// администратор публикует их вручную из админки — без автоматической
// генерации "фейковых" отзывов.
reviewsRouter.post('/', (req, res) => {
  const parsed = createReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Некорректные данные отзыва' });
    return;
  }

  const review = createReview({ ...parsed.data, approved: false });

  notifyAdminNewReview(parsed.data).catch(() => {
    // не блокируем ответ пользователю, если уведомление не ушло
  });

  res.status(201).json({ ok: true, id: review.id });
});
