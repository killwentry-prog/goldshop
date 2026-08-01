import { motion } from 'framer-motion';
import { PropsWithChildren } from 'react';
import { haptic } from '../lib/telegram';

interface GoldButtonProps extends PropsWithChildren {
  onClick?: () => void;
  variant?: 'gold' | 'ghost';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function GoldButton({
  children,
  onClick,
  variant = 'gold',
  className = '',
  disabled,
  type = 'button',
}: GoldButtonProps) {
  const base =
    variant === 'gold'
      ? 'bg-gold-gradient text-base-950 shadow-gold'
      : 'glass text-gold-300';

  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.97 }}
      onClick={() => {
        if (disabled) return;
        haptic('medium');
        onClick?.();
      }}
      disabled={disabled}
      className={`w-full rounded-2xl py-4 font-semibold text-base transition-opacity disabled:opacity-40 ${base} ${className}`}
    >
      {children}
    </motion.button>
  );
}
