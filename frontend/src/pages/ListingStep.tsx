import { useLocation, useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { GlassCard } from '../components/GlassCard';
import { GoldButton } from '../components/GoldButton';
import { api, Order } from '../lib/api';

export default function ListingStep() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = (location.state as { order?: Order } | null)?.order;
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  if (!order) {
    return (
      <div className="p-5">
        <p className="text-white/60">Заказ не найден. Начните заново.</p>
        <div className="mt-4">
          <GoldButton onClick={() => navigate('/buy')}>Вернуться к покупке</GoldButton>
        </div>
      </div>
    );
  }

  async function handleUpload() {
    if (!file || !order) return;
    setUploading(true);
    setError('');
    try {
      await api.uploadScreenshot(order.public_id, file);
      navigate('/buy/success');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить скриншот');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Выставление лота" subtitle="Шаг 2 из 2" />

      <div className="px-5 space-y-4">
        <GlassCard className="p-6 text-center">
          <p className="text-sm text-white/50">
            Выставьте любой предмет на торговой площадке Standoff 2 за
          </p>
          <motion.p
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-3 text-4xl font-black gold-text"
          >
            {order.listing_price} Gold
          </motion.p>
          <p className="mt-2 text-xs text-white/30">Заказ №{order.public_id}</p>
        </GlassCard>

        <GlassCard className="p-5">
          <p className="text-sm font-medium">Загрузите скриншот выставленного предмета</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-8 text-white/50 transition hover:border-gold-500/50 hover:text-gold-300"
          >
            <Upload size={26} />
            <span className="text-sm">{file ? file.name : 'Нажмите, чтобы выбрать файл'}</span>
          </button>
        </GlassCard>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <GoldButton onClick={handleUpload} disabled={!file || uploading}>
          {uploading ? 'Отправка…' : 'Загрузить скриншот'}
        </GoldButton>
      </div>
    </div>
  );
}
