import { motion } from 'framer-motion';
import { Trophy, Users, Zap, Star } from 'lucide-react';

export function StatsBar() {
  const completedOrders = 2318;
  const clients = 936;
  const processingMinutes = 12;
  const totalGoldSold = 643560;
  const rating = 4.5;
  const reviewsCount = 453;

  const items = [
    {
      icon: Trophy,
      value: completedOrders.toLocaleString('ru-RU'),
      label: 'выполненных заказов',
    },
    {
      icon: Users,
      value: clients.toLocaleString('ru-RU'),
      label: 'клиентов',
    },
    {
      icon: Zap,
      value: `${processingMinutes} минут`,
      label: 'средняя выдача',
    },
  ];

  return (
    <div className="w-full space-y-3">
      {/* Рейтинг */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-1"
      >
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => {
            const isFull = i < 4;
            const isHalf = i === 4;

            return (
              <div key={i} className="relative h-[18px] w-[18px]">
                {/* Контур звезды */}
                <Star
                  size={18}
                  className="absolute left-0 top-0 text-gold-400"
                />

                {/* Полная желтая звезда */}
                {isFull && (
                  <Star
                    size={18}
                    className="absolute left-0 top-0 fill-gold-400 text-gold-400"
                  />
                )}

                {/* Половина пятой звезды */}
                {isHalf && (
                  <div className="absolute left-0 top-0 h-[18px] w-[9px] overflow-hidden">
                    <Star
                      size={18}
                      className="fill-gold-400 text-gold-400"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-sm font-semibold text-white/70">
          {reviewsCount} отзывов
        </p>
      </motion.div>

      {/* Статистика */}
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

            <p className="text-lg font-bold">
              {item.value}
            </p>

            <p className="text-[11px] leading-tight text-white/40">
              {item.label}
            </p>
          </motion.div>
        ))}

        {/* Работаем 24/7 */}
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

          <p className="mt-1 text-sm font-semibold">
            Работаем 24/7
          </p>
        </motion.div>
      </div>

      {/* Продано Gold */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
        className="glass flex items-center justify-between rounded-2xl p-4"
      >
        <div>
          <p className="text-xs text-white/40">
            Продано Gold
          </p>

          <p className="mt-1 text-xl font-black gold-text">
            {totalGoldSold.toLocaleString('ru-RU')}
          </p>
        </div>

        <span className="text-2xl">💰</span>
      </motion.div>
    </div>
  );
}
