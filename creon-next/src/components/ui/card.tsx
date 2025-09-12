import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = true,
  padding = 'md',
  onClick,
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const classes = clsx(
    'bg-white rounded-2xl shadow-xl border border-gray-100 transition-all duration-200',
    paddingClasses[padding],
    {
      'hover:shadow-2xl hover:-translate-y-1 cursor-pointer': hover && onClick,
      'hover:shadow-2xl': hover && !onClick,
    },
    className
  );

  const CardComponent = onClick ? motion.div : 'div';
  const motionProps = onClick
    ? {
        whileHover: { y: -4, scale: 1.02 },
        whileTap: { scale: 0.98 },
        onClick,
      }
    : {};

  return (
    <CardComponent className={classes} {...motionProps}>
      {children}
    </CardComponent>
  );
};

export default Card;