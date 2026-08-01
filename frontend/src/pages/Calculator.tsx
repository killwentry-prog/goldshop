import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { GlassCard } from '../components/GlassCard';
import { api, MetaResponse } from '../lib/api';

export default function Calculator() {
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    api.getMeta().then(setMeta).catch(() => undefined);
  }, []);

  const goldAmount = Number(amount) || 0;
  const priceUah = meta ? Math.round(goldAmount * meta.goldRateUah * 100) / 100 : 0;

  return (
    <div>
      <PageHeader title="Калькулятор" subtitle="Расчёт в реальном времени" />

      <div className="px-5 space-y-4">
        <GlassCard className="p-5">
          <label className="text-xs uppercase tracking-wide text-white/40">
            Введите количество Gold
          </label>
          <input
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
            placeholder="1000"
            autoFocus
            className="mt-2 w-full bg-transparent text-4xl font-bold outline-none placeholder:text-white/20"
          />
        </GlassCard>

        <GlassCard className="p-6 text-center">
          <p className="text-xs text-white/40">Итоговая стоимость</p>
          <p className="mt-2 text-4xl font-black gold-text">{priceUah} грн</p>
          {meta && (
            <p className="mt-2 text-xs text-white/30">
              Курс: 1 Gold = {meta.goldRateUah} грн
            </p>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
