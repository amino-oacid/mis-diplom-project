import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

/**
 * Переиспользуемый компонент поля ввода
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = true, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${props.name}`;

    return (
      <div className={`input-wrapper ${fullWidth ? 'full-width' : ''}`}>
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`input ${error ? 'input-error' : ''} ${className}`}
          {...props}
        />
        {error && <span className="input-error-text">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
