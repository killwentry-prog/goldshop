import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { GlassCard } from '../components/GlassCard';
import { Skeleton } from '../components/Skeleton';
import { api, ProfileData } from '../lib/api';
import { getTelegramUser } from '../lib/telegram';

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const tgUser = getTelegramUser();

  useEffect(() => {
    api.getProfile().then(setProfile).catch(() => undefined);
  }, []);

  const displayName = tgUser?.username
    ? `@${tgUser.username}`
    : tgUser?.first_name ?? 'Гость';
  const initial = (tgUser?.first_name ?? tgUser?.username ?? 'E').slice(0, 1).toUpperCase();

  return (
    <div>
      <PageHeader title="Профиль" />

      <div className="px-5">
        <GlassCard className="flex flex-col items-center p-8 text-center">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 16 }}
            className="h-20 w-20 overflow-hidden rounded-full shadow-gold"
          >
            {tgUser?.photo_url ? (
              <img src={tgUser.photo_url} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gold-gradient text-2xl font-bold text-base-950">
                {initial}
              </div>
            )}
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg font-bold"
          >
            {displayName}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 w-full"
          >
            {!profile ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="glass rounded-2xl p-5">
                <p className="text-xs text-white/40">Куплено Gold</p>
                <p className="mt-1 text-3xl font-black gold-text">
                  {profile.totalGoldBought.toLocaleString('ru-RU')}
                </p>
                {profile.ordersCount > 0 && (
                  <p className="mt-1 text-xs text-white/30">
                    Выполненных заказов: {profile.ordersCount}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </GlassCard>
      </div>
    </div>
  );
}
