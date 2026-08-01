import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { GlassCard } from '../components/GlassCard';
import { SkeletonList } from '../components/Skeleton';
import { api, AdminReview, Order } from '../lib/api';
import { getTelegramUser } from '../lib/telegram';

interface Stats {
  ordersToday: number;
  ordersTotal: number;
  goldTotal: number;
  revenueTotal: number;
}

export default function Admin() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [denied, setDenied] = useState(false);
  const [reviews, setReviews] = useState<AdminReview[] | null>(null);
  const [tab, setTab] = useState<'orders' | 'reviews'>('orders');

  useEffect(() => {
    if (tab === 'reviews') {
      api.admin.reviews().then(setReviews).catch(() => setReviews([]));
    }
  }, [tab]);

  async function handleApprove(id: number) {
    await api.admin.approveReview(id);
    setReviews((prev) => prev?.map((r) => (r.id === id ? { ...r, approved: 1 } : r)) ?? null);
  }

  async function handleReject(id: number) {
    await api.admin.rejectReview(id);
    setReviews((prev) => prev?.map((r) => (r.id === id ? { ...r, approved: 0 } : r)) ?? null);
  }

  useEffect(() => {
    api.admin
      .stats()
      .then(setStats)
      .catch(() => setDenied(true));
  }, []);

  useEffect(() => {
    api.admin
      .orders({ search: search || undefined, status: status || undefined })
      .then(setOrders)
      .catch(() => setOrders([]));
  }, [search, status]);

  if (denied) {
    return (
      <div className="p-5">
        <PageHeader title="Админка" />
        <GlassCard className="p-6 text-center text-white/50">
          Доступ только для администратора магазина.
        </GlassCard>
      </div>
    );
  }

  const user = getTelegramUser();

  return (
    <div>
      <PageHeader title="Админка" subtitle={user?.username ? `@${user.username}` : undefined} />

      <div className="px-5 space-y-4">
        {!stats ? (
          <SkeletonList count={2} />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Заказов сегодня" value={stats.ordersToday} />
            <StatCard label="Всего заказов" value={stats.ordersTotal} />
            <StatCard label="Объём Gold" value={stats.goldTotal.toLocaleString('ru-RU')} />
            <StatCard label="Доход, грн" value={stats.revenueTotal.toLocaleString('ru-RU')} />
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => setTab('orders')}
            className={`flex-1 rounded-xl py-2 text-sm font-medium ${
              tab === 'orders' ? 'bg-gold-gradient text-base-950' : 'glass text-white/50'
            }`}
          >
            Заказы
          </button>
          <button
            onClick={() => setTab('reviews')}
            className={`flex-1 rounded-xl py-2 text-sm font-medium ${
              tab === 'reviews' ? 'bg-gold-gradient text-base-950' : 'glass text-white/50'
            }`}
          >
            Отзывы на модерации
          </button>
        </div>

        {tab === 'orders' && (
        <>
        <GlassCard className="p-4">
          <div className="flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по username / ID / номеру заказа"
              className="flex-1 rounded-xl bg-white/[0.05] px-3 py-2 text-sm outline-none placeholder:text-white/30"
            />
          </div>
          <div className="mt-3 flex gap-2">
            {['', 'pending', 'accepted', 'rejected'].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`rounded-full px-3 py-1 text-xs ${
                  status === s ? 'bg-gold-gradient text-base-950' : 'glass text-white/50'
                }`}
              >
                {s === '' ? 'Все' : s === 'pending' ? 'В ожидании' : s === 'accepted' ? 'Приняты' : 'Отклонены'}
              </button>
            ))}
          </div>
          <a
            href="/api/admin/orders/export.csv"
            className="mt-3 inline-block text-xs text-gold-300 underline"
          >
            Экспорт CSV
          </a>
        </GlassCard>

        <div className="space-y-2">
          {orders === null && <SkeletonList count={3} />}
          {orders?.map((o) => (
            <GlassCard key={o.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-semibold">#{o.public_id}</p>
                <p className="text-xs text-white/40">{new Date(o.created_at).toLocaleString('ru-RU')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{o.gold_amount} Gold</p>
                <p className={`text-xs ${statusColor(o.status)}`}>{statusLabel(o.status)}</p>
              </div>
            </GlassCard>
          ))}
        </div>
        </>
        )}

        {tab === 'reviews' && (
          <div className="space-y-2">
            {reviews === null && <SkeletonList count={3} />}
            {reviews?.length === 0 && (
              <GlassCard className="p-6 text-center text-white/40">Отзывов нет</GlassCard>
            )}
            {reviews?.map((r) => (
              <GlassCard key={r.id} className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{r.name}</p>
                  <span
                    className={`text-xs ${r.approved ? 'text-green-400' : 'text-yellow-400'}`}
                  >
                    {r.approved ? 'Опубликован' : 'На модерации'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-white/60">{r.comment}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleApprove(r.id)}
                    className="flex-1 rounded-lg bg-green-500/20 py-2 text-xs font-medium text-green-400"
                  >
                    Опубликовать
                  </button>
                  <button
                    onClick={() => handleReject(r.id)}
                    className="flex-1 rounded-lg bg-red-500/20 py-2 text-xs font-medium text-red-400"
                  >
                    Скрыть
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <GlassCard className="p-4">
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-1 text-xl font-bold gold-text">{value}</p>
    </GlassCard>
  );
}

function statusLabel(status: Order['status']): string {
  if (status === 'accepted') return 'Принят';
  if (status === 'rejected') return 'Отклонён';
  return 'В ожидании';
}

function statusColor(status: Order['status']): string {
  if (status === 'accepted') return 'text-green-400';
  if (status === 'rejected') return 'text-red-400';
  return 'text-yellow-400';
}
