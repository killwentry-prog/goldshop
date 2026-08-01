import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Calculator as CalcIcon,
  Star,
  MessageCircle,
  ScrollText,
  User,
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { StatsBar } from '../components/StatsBar';
import { useEffect, useState } from 'react';
import { api, MetaResponse } from '../lib/api';
import { getTelegramUser } from '../lib/telegram';

const items = [
  { icon: ShoppingCart, label: 'Купить', to: '/buy', accent: true },
  { icon: CalcIcon, label: 'Посчитать', to: '/calculator' },
  { icon: Star, label: 'Отзывы', to: '/reviews' },
  { icon: MessageCircle, label: 'Поддержка', to: '/support' },
  { icon: ScrollText, label: 'Условия использования', to: '/terms' },
];

export default function Home() {
  const navigate = useNavigate();
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const tgUser = getTelegramUser();

  useEffect(() => {
    api.getMeta().then(setMeta).catch(() => undefined);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center px-5 pt-10">
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => navigate('/profile')}
        className="self-end"
      >
        <div className="h-10 w-10 overflow-hidden rounded-full border border-white/10">
          {tgUser?.photo_url ? (
            <img src={tgUser.photo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gold-gradient text-sm font-bold text-base-950">
              <User size={16} />
            </div>
          )}
        </div>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mt-2 flex h-24 w-24 items-center justify-center rounded-3xl bg-gold-gradient text-4xl font-black text-base-950 shadow-gold"
      >
        ES
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-6 text-3xl font-extrabold tracking-tight gold-text"
      >
        ExpShop
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-1 text-sm text-white/50"
      >
        Покупка Gold Standoff 2
      </motion.p>

      {meta && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 flex gap-2 text-xs text-white/40"
        >
          <span className="glass rounded-full px-3 py-1">1 Gold = {meta.goldRateUah} грн</span>
          <span className="glass rounded-full px-3 py-1">от {meta.minOrderGold} Gold</span>
        </motion.div>
      )}

      <div className="mt-6 w-full">
        <StatsBar />
      </div>

      <div className="mt-6 w-full space-y-3">
        {items.map((item, i) => (
          <GlassCard
            key={item.to}
            delay={0.1 * i}
            onClick={() => navigate(item.to)}
            className="flex items-center gap-4 px-5 py-4"
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                item.accent ? 'bg-gold-gradient text-base-950' : 'bg-white/[0.06] text-gold-300'
              }`}
            >
              <item.icon size={20} />
            </div>
            <span className="font-medium">{item.label}</span>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
