import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { GlassCard } from '../components/GlassCard';
import { GoldButton } from '../components/GoldButton';
import { api, MetaResponse } from '../lib/api';

export default function Buy() {
  const navigate = useNavigate();
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getMeta().then(setMeta).catch(() => undefined);
  }, []);

  const goldAmount = Number(amount) || 0;
  const priceUah = meta ? Math.round(goldAmount * meta.goldRateUah * 100) / 100 : 0;
  const valid = meta ? goldAmount >= meta.minOrderGold : false;

  async function handleContinue() {
    if (!valid) {
      setError(meta ? `Минимальный заказ — ${meta.minOrderGold} Gold` : '');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const order = await api.createOrder(goldAmount);
      navigate('/buy/listing', { state: { order } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка создания заказа');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Купить Gold" subtitle="Шаг 1 из 2" />

      <div className="px-5">
        <GlassCard className="p-5">
          <label className="text-xs uppercase tracking-wide text-white/40">
            Введите количество Gold
          </label>
          <input
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
            placeholder="500"
            className="mt-2 w-full bg-transparent text-3xl font-bold outline-none placeholder:text-white/20"
          />
          {meta && (
            <p className="mt-1 text-xs text-white/40">
              Минимальный заказ: {meta.minOrderGold} Gold
            </p>
          )}
        </GlassCard>

        <AnimatePresence>
          {goldAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <GlassCard className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs text-white/40">Количество Gold</p>
                  <p className="text-xl font-bold">{goldAmount.toLocaleString('ru-RU')}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40">Стоимость</p>
                  <p className="text-xl font-bold gold-text">{priceUah} грн</p>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <div className="mt-6">
          <GoldButton onClick={handleContinue} disabled={loading || !goldAmount}>
            {loading ? 'Создаём заказ…' : 'Продолжить'}
          </GoldButton>
        </div>
      </div>
    </div>
  );
}
