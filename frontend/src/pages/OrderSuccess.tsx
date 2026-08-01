import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoldButton } from '../components/GoldButton';

export default function OrderSuccess() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-8 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        className="flex h-24 w-24 items-center justify-center rounded-full bg-gold-gradient shadow-gold"
      >
        <CheckCircle2 className="text-base-950" size={48} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-2xl font-bold"
      >
        Заказ успешно создан
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-2 text-white/50"
      >
        Менеджер проверит вашу заявку.
        <br />
        Среднее время обработки — до 1 часа.
      </motion.p>

      <div className="mt-10 w-full">
        <GoldButton onClick={() => navigate('/')}>На главную</GoldButton>
      </div>
    </div>
  );
}
