import { Router } from 'express';
import { listOrders, getStats } from '../db/orders';
import { listAllReviews, setReviewApproval } from '../db/reviews';
import { requireAdmin } from '../middleware/adminAuth';

export const adminRouter = Router();

adminRouter.use(requireAdmin);

adminRouter.get('/stats', (_req, res) => {
  res.json(getStats());
});

adminRouter.get('/orders', (req, res) => {
  const { search, status, limit, offset } = req.query;
  const orders = listOrders({
    search: typeof search === 'string' ? search : undefined,
    status: typeof status === 'string' ? (status as 'pending' | 'accepted' | 'rejected') : undefined,
    limit: limit ? Number(limit) : undefined,
    offset: offset ? Number(offset) : undefined,
  });
  res.json(orders);
});

adminRouter.get('/orders/export.csv', (_req, res) => {
  const orders = listOrders({ limit: 100000, offset: 0 });
  const header = 'id,public_id,telegram_id,username,gold_amount,price_uah,listing_price,status,created_at';
  const rows = orders.map((o) =>
    [
      o.id,
      o.public_id,
      o.telegram_id,
      o.username ?? '',
      o.gold_amount,
      o.price_uah,
      o.listing_price,
      o.status,
      o.created_at,
    ].join(','),
  );
  const csv = [header, ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
  res.send(csv);
});

adminRouter.get('/reviews', (_req, res) => {
  res.json(listAllReviews());
});

adminRouter.post('/reviews/:id/approve', (req, res) => {
  setReviewApproval(Number(req.params.id), true);
  res.json({ ok: true });
});

adminRouter.post('/reviews/:id/reject', (req, res) => {
  setReviewApproval(Number(req.params.id), false);
  res.json({ ok: true });
});
