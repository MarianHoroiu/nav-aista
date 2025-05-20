import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  ...props
}) => {
  // Variant classes
  const variantClasses = {
    default: 'bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700',
    outlined: 'border border-secondary-300 dark:border-secondary-600',
    elevated: 'bg-white dark:bg-secondary-800 shadow-md',
  };

  // Padding classes
  const paddingClasses = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  // Combine all classes
  const cardClasses = [
    'rounded-lg',
    variantClasses[variant],
    paddingClasses[padding],
    className,
  ].join(' ');

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;
