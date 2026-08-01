import { motion } from 'framer-motion';
import { Trophy, Users, Zap, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, PublicStats } from '../lib/api';
import { Skeleton } from './Skeleton';

export function StatsBar() {
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    api.getStats().then(setStats).catch(() => undefined);
  }, []);

  if (!stats) {
    return (
      <div className="w-full space-y-3">
        <Skeleton className="h-8 w-40 mx-auto" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    );
  }

  const hasRating = stats.reviewsCount > 0 && stats.avgRating !== null;
  const roundedRating = hasRating ? Math.round(stats.avgRating! * 2) / 2 : 0;

  // Фиксированные значения
  const items = [
    {
      icon: Trophy,
      value: '2 381',
      label: 'выполненных заказов',
    },
    {
      icon: Users,
      value: '891',
      label: 'клиентов',
    },
    {
      icon: Zap,
      value: '12 мин',
      label: 'средняя выдача',
    },
  ];

  return (
    <div className="w-full space-y-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-1"
      >
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => {
            const filled = i + 1 <= Math.floor(roundedRating);
            const half = !filled && i < roundedRating;

            return (
              <Star
                key={i}
                size={18}
                className={
                  filled || half
                    ? 'fill-gold-400 text-gold-400'
                    : 'text-white/15'
                }
              />
            );
          })}
        </div>

        <p className="text-sm font-semibold text-white/70">
          {hasRating
            ? `${roundedRating.toFixed(2)} • ${stats.reviewsCount} отзывов`
            : 'Пока нет оценок'}
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * i }}
            className="glass flex flex-col items-center gap-1 rounded-2xl p-4 text-center"
          >
            <item.icon size={18} className="text-gold-400" />
            <p className="text-lg font-bold">{item.value}</p>
            <p className="text-[11px] leading-tight text-white/40">
              {item.label}
            </p>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="glass flex flex-col items-center justify-center gap-1 rounded-2xl p-4 text-center"
        >
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-green-400" />
          </span>

          <p className="mt-1 text-sm font-semibold">Работаем 24/7</p>
        </motion.div>
      </div>
    </div>
  );
}
