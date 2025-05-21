import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}) => {
  // Base classes
  const baseClasses = `btn btn-${variant}`;

  // Size classes
  const sizeClasses = {
    sm: 'text-xs py-1 px-2',
    md: 'text-sm py-2 px-4',
    lg: 'text-base py-3 px-6',
  }[size];

  // Width class
  const widthClass = fullWidth ? 'w-full' : '';

  // Disabled class
  const disabledClass = disabled || isLoading ? 'opacity-50 cursor-not-allowed' : '';

  // Combine classes
  const classes = `${baseClasses} ${sizeClasses} ${widthClass} ${disabledClass} ${className}`;

  return (
    <button className={classes} disabled={disabled || isLoading} {...props}>
      {isLoading && <span className="inline-block animate-spin mr-2">⟳</span>}

      {icon && iconPosition === 'left' && !isLoading && <span className="mr-2">{icon}</span>}

      {children}

      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </button>
  );
};

export default Button;
