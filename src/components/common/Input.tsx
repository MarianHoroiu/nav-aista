import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  fullWidth?: boolean;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helpText,
      fullWidth = true,
      className = '',
      inputClassName = '',
      labelClassName = '',
      ...props
    },
    ref
  ) => {
    // Container classes
    const containerClasses = ['flex flex-col', fullWidth ? 'w-full' : '', className].join(' ');

    // Label classes
    const labelClasses = [
      'block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1',
      labelClassName,
    ].join(' ');

    // Input classes
    const inputClasses = [
      'px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary-500',
      error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
        : 'border-secondary-300 focus:border-primary-500 dark:border-secondary-700 dark:bg-secondary-800 dark:text-white',
      props.disabled
        ? 'bg-secondary-100 text-secondary-500 cursor-not-allowed dark:bg-secondary-900'
        : '',
      inputClassName,
    ].join(' ');

    return (
      <div className={containerClasses}>
        {label && (
          <label htmlFor={props.id} className={labelClasses}>
            {label}
          </label>
        )}
        <input ref={ref} className={inputClasses} {...props} />
        {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
        {helpText && !error && (
          <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">{helpText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
