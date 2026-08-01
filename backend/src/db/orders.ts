import { db } from './index';
import { v4 as uuid } from 'uuid';

export type OrderStatus = 'pending' | 'accepted' | 'rejected';

export interface Order {
  id: number;
  public_id: string;
  user_id: number;
  telegram_id: number;
  username: string | null;
  gold_amount: number;
  price_uah: number;
  listing_price: number;
  screenshot_path: string | null;
  status: OrderStatus;
  admin_message_id: number | null;
  created_at: string;
  updated_at: string;
}

export function createOrder(params: {
  userId: number;
  telegramId: number;
  username?: string | null;
  goldAmount: number;
  priceUah: number;
  listingPrice: number;
}): Order {
  const publicId = uuid().slice(0, 8).toUpperCase();
  const info = db
    .prepare(
      `INSERT INTO orders (public_id, user_id, telegram_id, username, gold_amount, price_uah, listing_price)
       VALUES (@publicId, @userId, @telegramId, @username, @goldAmount, @priceUah, @listingPrice)`,
    )
    .run({
      publicId,
      userId: params.userId,
      telegramId: params.telegramId,
      username: params.username ?? null,
      goldAmount: params.goldAmount,
      priceUah: params.priceUah,
      listingPrice: params.listingPrice,
    });

  return getOrderById(Number(info.lastInsertRowid))!;
}

export function getOrderById(id: number): Order | undefined {
  return db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as Order | undefined;
}

export function getOrderByPublicId(publicId: string): Order | undefined {
  return db.prepare('SELECT * FROM orders WHERE public_id = ?').get(publicId) as
    | Order
    | undefined;
}

export function attachScreenshot(orderId: number, screenshotPath: string): void {
  db.prepare(
    "UPDATE orders SET screenshot_path = ?, updated_at = datetime('now') WHERE id = ?",
  ).run(screenshotPath, orderId);
}

export function setAdminMessageId(orderId: number, messageId: number): void {
  db.prepare(
    "UPDATE orders SET admin_message_id = ?, updated_at = datetime('now') WHERE id = ?",
  ).run(messageId, orderId);
}

export function updateOrderStatus(orderId: number, status: OrderStatus): void {
  db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(
    status,
    orderId,
  );
}

export function listOrders(params: {
  search?: string;
  status?: OrderStatus;
  limit?: number;
  offset?: number;
}): Order[] {
  let query = 'SELECT * FROM orders WHERE 1=1';
  const args: (string | number)[] = [];

  if (params.status) {
    query += ' AND status = ?';
    args.push(params.status);
  }
  if (params.search) {
    query += ' AND (username LIKE ? OR public_id LIKE ? OR CAST(telegram_id AS TEXT) LIKE ?)';
    const like = `%${params.search}%`;
    args.push(like, like, like);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  args.push(params.limit ?? 50, params.offset ?? 0);

  return db.prepare(query).all(...args) as Order[];
}

export function getUserOrderSummary(telegramId: number): {
  totalGoldBought: number;
  ordersCount: number;
} {
  const row = db
    .prepare(
      "SELECT COALESCE(SUM(gold_amount),0) as gold, COUNT(*) as cnt FROM orders WHERE telegram_id = ? AND status = 'accepted'",
    )
    .get(telegramId) as { gold: number; cnt: number };
  return { totalGoldBought: row.gold, ordersCount: row.cnt };
}

/**
 * Реальные публичные метрики магазина (никаких выдуманных чисел):
 * сколько заказов реально принято, сколько разных клиентов купили,
 * и среднее время от создания заказа до его принятия админом.
 */
export function getPublicStats(): {
  completedOrders: number;
  clients: number;
  avgProcessingMinutes: number | null;
} {
  const completed = db
    .prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'accepted'")
    .get() as { c: number };
  const clients = db
    .prepare("SELECT COUNT(DISTINCT telegram_id) as c FROM orders WHERE status = 'accepted'")
    .get() as { c: number };
  const avg = db
    .prepare(
      "SELECT AVG((julianday(updated_at) - julianday(created_at)) * 24 * 60) as avgMin FROM orders WHERE status = 'accepted'",
    )
    .get() as { avgMin: number | null };

  return {
    completedOrders: completed.c,
    clients: clients.c,
    avgProcessingMinutes: avg.avgMin,
  };
}
export function getStats(): {
  ordersToday: number;
  ordersTotal: number;
  goldTotal: number;
  revenueTotal: number;
} {
  const ordersToday = db
    .prepare(
      "SELECT COUNT(*) as c FROM orders WHERE date(created_at) = date('now') AND status = 'accepted'",
    )
    .get() as { c: number };
  const ordersTotal = db
    .prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'accepted'")
    .get() as { c: number };
  const totals = db
    .prepare(
      "SELECT COALESCE(SUM(gold_amount),0) as gold, COALESCE(SUM(price_uah),0) as revenue FROM orders WHERE status = 'accepted'",
    )
    .get() as { gold: number; revenue: number };

  return {
    ordersToday: ordersToday.c,
    ordersTotal: ordersTotal.c,
    goldTotal: totals.gold,
    revenueTotal: totals.revenue,
  };
}
