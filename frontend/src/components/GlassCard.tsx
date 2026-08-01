import { motion } from 'framer-motion';
import { PropsWithChildren } from 'react';

interface GlassCardProps extends PropsWithChildren {
  className?: string;
  onClick?: () => void;
  delay?: number;
}

export function GlassCard({ children, className = '', onClick, delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={onClick ? { scale: 1.015, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.985 } : undefined}
      onClick={onClick}
      className={`glass rounded-2xl shadow-glass ${onClick ? 'cursor-pointer active:shadow-gold' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
