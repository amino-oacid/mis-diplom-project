import React from 'react';

type AlertType = 'error' | 'success' | 'warning' | 'info';

interface AlertProps {
  type?: AlertType;
  message: string;
  onClose?: () => void;
}

/**
 * Компонент отображения уведомлений/ошибок
 */
export const Alert: React.FC<AlertProps> = ({ type = 'error', message, onClose }) => {
  if (!message) {
    return null;
  }

  return (
    <div className={`alert alert-${type}`} role="alert">
      <span className="alert-message">{message}</span>
      {onClose && (
        <button
          type="button"
          className="alert-close"
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
