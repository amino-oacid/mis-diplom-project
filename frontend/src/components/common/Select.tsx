import React from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * Переиспользуемый компонент выпадающего списка
 */
export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  placeholder,
  fullWidth = true,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || `select-${props.name}`;

  return (
    <div className={`input-wrapper ${fullWidth ? 'full-width' : ''}`}>
      {label && (
        <label htmlFor={selectId} className="input-label">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`input select ${error ? 'input-error' : ''} ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
};

export default Select;
