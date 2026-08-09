import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { GlassCard } from '../components/GlassCard';
import { GoldButton } from '../components/GoldButton';
import { SkeletonList, Skeleton } from '../components/Skeleton';
import { api, PublicStats, Review } from '../lib/api';

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    api.getReviews().then(setReviews).catch(() => setReviews([]));
    api.getStats().then(setStats).catch(() => undefined);
  }, []);

  async function submit() {
    if (!name.trim() || !comment.trim()) return;
    await api.submitReview({ name: name.trim(), comment: comment.trim(), rating });
    setSent(true);
    setName('');
    setComment('');
  }

  return (
    <div>
      <PageHeader title="Отзывы" subtitle="Что говорят наши клиенты" />

      <div className="px-5 space-y-3">
        {!stats ? (
          <Skeleton className="h-20 w-full" />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass flex items-center justify-between rounded-2xl p-5"
          >
            <div>
              <p className="text-xs text-white/40">Продано Gold</p>
              <p className="mt-1 text-2xl font-black gold-text">
                {stats.totalGoldSold.toLocaleString('ru-RU')}
              </p>
            </div>
            <span className="text-3xl">💰</span>
          </motion.div>
        )}

        {reviews === null && <SkeletonList count={4} />}

        {reviews?.map((r, i) => (
          <GlassCard key={r.id} delay={i * 0.05} className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-gradient text-sm font-bold text-base-950">
                {r.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{r.name}</p>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      size={12}
                      className={idx < r.rating ? 'fill-gold-400 text-gold-400' : 'text-white/15'}
                    />
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-white/70">{r.comment}</p>
          </GlassCard>
        ))}

        <GlassCard className="mt-6 p-5">
          <p className="text-sm font-semibold">Оставить отзыв</p>
          {sent ? (
            <p className="mt-3 text-sm text-gold-300">
              Спасибо! Ваш отзыв отправлен на модерацию.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                className="w-full rounded-xl bg-white/[0.05] px-4 py-3 text-sm outline-none placeholder:text-white/30"
              />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ваш комментарий"
                rows={3}
                className="w-full rounded-xl bg-white/[0.05] px-4 py-3 text-sm outline-none placeholder:text-white/30"
              />
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <button key={idx} onClick={() => setRating(idx + 1)}>
                    <Star
                      size={22}
                      className={idx < rating ? 'fill-gold-400 text-gold-400' : 'text-white/15'}
                    />
                  </button>
                ))}
              </div>
              <GoldButton onClick={submit}>Отправить отзыв</GoldButton>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
