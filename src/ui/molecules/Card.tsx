import React from 'react';

export interface CardProps {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  footer,
  className = '',
  onClick,
  hoverable = false,
  bordered = true,
}) => {
  const baseClasses = 'card';
  const hoverClasses = hoverable ? 'hover:shadow-lg cursor-pointer transition-shadow' : '';
  const borderClasses = bordered ? 'border border-secondary-200 dark:border-secondary-700' : '';
  const clickClasses = onClick ? 'cursor-pointer' : '';

  const classes = `${baseClasses} ${hoverClasses} ${borderClasses} ${clickClasses} ${className}`;

  return (
    <div className={classes} onClick={onClick}>
      {title && <div className="mb-3 font-medium text-lg">{title}</div>}

      <div>{children}</div>

      {footer && (
        <div className="mt-4 pt-3 border-t border-secondary-200 dark:border-secondary-700">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
