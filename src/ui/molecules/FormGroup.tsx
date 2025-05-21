import React from 'react';

import { Input, InputProps } from '../atoms/Input';
import { Label, LabelProps } from '../atoms/Label';

export interface FormGroupProps {
  id: string;
  label: string;
  labelProps?: Omit<LabelProps, 'htmlFor'>;
  inputProps: Omit<InputProps, 'id'>;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  id,
  label,
  labelProps = {},
  inputProps,
  error,
  hint,
  required = false,
  className = '',
}) => {
  return (
    <div className={`form-group ${className}`}>
      <Label htmlFor={id} required={required} {...labelProps}>
        {label}
      </Label>

      {hint && <p className="text-xs text-secondary-500 mb-1">{hint}</p>}

      <Input id={id} error={error} {...inputProps} />
    </div>
  );
};

export default FormGroup;
