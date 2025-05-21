import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, icon, iconPosition = 'left', ...props }, ref) => {
    const hasError = !!error;
    const baseClasses = 'form-input';
    const errorClasses = hasError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';
    const iconClasses = icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : '';

    const classes = `${baseClasses} ${errorClasses} ${iconClasses} ${className}`;

    return (
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-secondary-500">
            {icon}
          </div>
        )}

        <input className={classes} ref={ref} {...props} />

        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-secondary-500">
            {icon}
          </div>
        )}

        {hasError && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
