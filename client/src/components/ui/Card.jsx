import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({
  children,
  hover = false,
  active = false,
  className = '',
}) => {
  const baseClasses = 'bg-surface-slate border rounded-card p-6';
  
  const activeStyles = active
    ? 'border-brand-mint shadow-[0_0_0_1px_var(--brand-mint)_inset]'
    : 'border-surface-border';

  const hoverProps = hover
    ? {
        whileHover: {
          borderColor: 'var(--brand-console)',
          transition: { duration: 0.15, ease: 'easeOut' },
        },
      }
    : {};

  return (
    <motion.div
      className={`${baseClasses} ${activeStyles} ${className}`}
      {...hoverProps}
    >
      {children}
    </motion.div>
  );
};
