import React, { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  // Base classes for all buttons
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-colors';

  // Size-specific classes
  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-5 py-2.5',
  };

  // Variant-specific classes
  const variantClasses = {
    primary:
      'bg-primary-500 text-white hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:hover:bg-primary-400',
    secondary:
      'bg-secondary-200 text-secondary-900 hover:bg-secondary-300 focus:ring-2 focus:ring-secondary-400 focus:ring-offset-2 dark:bg-secondary-700 dark:hover:bg-secondary-600 dark:text-white',
    outline:
      'border border-secondary-300 text-secondary-700 hover:bg-secondary-50 focus:ring-2 focus:ring-secondary-400 focus:ring-offset-2 dark:border-secondary-600 dark:text-secondary-200 dark:hover:bg-secondary-800',
    text: 'text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300',
  };

  // Disabled state classes
  const disabledClasses = 'opacity-50 cursor-not-allowed';

  // Full width class
  const widthClass = fullWidth ? 'w-full' : '';

  // Combine all classes
  const buttonClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    disabled || isLoading ? disabledClasses : '',
    widthClass,
    className,
  ].join(' ');

  return (
    <button className={buttonClasses} disabled={disabled || isLoading} {...props}>
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
