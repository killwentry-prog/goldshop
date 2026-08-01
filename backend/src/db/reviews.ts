import { db } from './index';

export interface Review {
  id: number;
  name: string;
  avatar_url: string | null;
  rating: number;
  comment: string;
  approved: number;
  created_at: string;
}

export function listApprovedReviews(): Review[] {
  return db
    .prepare('SELECT * FROM reviews WHERE approved = 1 ORDER BY created_at DESC')
    .all() as Review[];
}

export function listAllReviews(): Review[] {
  return db.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all() as Review[];
}

export function createReview(params: {
  name: string;
  avatarUrl?: string | null;
  rating: number;
  comment: string;
  approved?: boolean;
}): Review {
  const info = db
    .prepare(
      'INSERT INTO reviews (name, avatar_url, rating, comment, approved) VALUES (?, ?, ?, ?, ?)',
    )
    .run(
      params.name,
      params.avatarUrl ?? null,
      params.rating,
      params.comment,
      params.approved ? 1 : 0,
    );
  return db.prepare('SELECT * FROM reviews WHERE id = ?').get(info.lastInsertRowid) as Review;
}

export function setReviewApproval(id: number, approved: boolean): void {
  db.prepare('UPDATE reviews SET approved = ? WHERE id = ?').run(approved ? 1 : 0, id);
}

/** Средний рейтинг считается только по реально одобренным отзывам — без накруток. */
export function getRatingStats(): { avgRating: number | null; count: number } {
  const row = db
    .prepare('SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE approved = 1')
    .get() as { avg: number | null; cnt: number };
  return { avgRating: row.avg, count: row.cnt };
}
