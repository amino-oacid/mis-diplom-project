import React from 'react';
import { Input, Button, Alert } from '../components/common';
import { usePrescriptionFormPresenter } from '../presenters/usePrescriptionFormPresenter';
import '../styles/medical.css';

/**
 * Страница формы назначения (для создания и редактирования)
 */
export const PrescriptionFormPage: React.FC = () => {
  const {
    prescriptions,
    existingPrescriptions,
    errors,
    appointmentId,
    patientId,
    inventoryItems,
    isSubmitting,
    addPrescription,
    removePrescription,
    handleModeChange,
    handleItemChange,
    handleSubmit,
    handleCancel,
    handleDeleteExisting,
  } = usePrescriptionFormPresenter();

  if (!appointmentId || !patientId) {
    return (
      <div className="page">
        <Alert type="error" message="Не указан приём или пациент" />
        <Button onClick={handleCancel}>Назад</Button>
      </div>
    );
  }

  return (
    <div className="page prescription-form-page">
      <div className="page-header">
        <h1>Назначения</h1>
        <p className="header-subtitle">Приём #{appointmentId}</p>
      </div>

      {errors.general && <Alert type="error" message={errors.general} />}

      {/* Существующие назначения */}
      {existingPrescriptions.length > 0 && (
        <div className="existing-prescriptions">
          <h3>Существующие назначения</h3>
          {existingPrescriptions.map((p) => (
            <div key={p.id} className="existing-prescription-card">
              <div className="prescription-info">
                <strong>{p.medicationName}</strong>
                {p.quantity && (
                  <span className="prescription-quantity">
                    (списано: {p.quantity})
                  </span>
                )}
                <span>
                  {p.dosage} • {p.frequency} • {p.duration}
                </span>
              </div>
              <Button
                size="small"
                variant="danger"
                onClick={() => handleDeleteExisting(p.id)}
              >
                Удалить
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Форма новых назначений */}
      <form className="prescription-form" onSubmit={handleSubmit}>
        <h3>Новые назначения</h3>

        {prescriptions.map((item, index) => (
          <div key={item.id} className="prescription-item">
            <div className="item-header">
              <span className="item-number">Назначение {index + 1}</span>
              {prescriptions.length > 1 && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removePrescription(item.id)}
                >
                  ×
                </button>
              )}
            </div>

            {/* Переключатель режима */}
            <div className="mode-toggle">
              <button
                type="button"
                className={`mode-btn ${item.mode === 'inventory' ? 'active' : ''}`}
                onClick={() => handleModeChange(item.id, 'inventory')}
              >
                Со склада
              </button>
              <button
                type="button"
                className={`mode-btn ${item.mode === 'manual' ? 'active' : ''}`}
                onClick={() => handleModeChange(item.id, 'manual')}
              >
                Ручной ввод
              </button>
            </div>

            {item.mode === 'inventory' ? (
              /* Режим "Со склада" */
              <div className="form-row">
                <div className="input-wrapper">
                  <label className="input-label">Позиция склада *</label>
                  <select
                    className={`input ${errors.inventoryId ? 'input-error-border' : ''}`}
                    value={item.inventoryId || ''}
                    onChange={handleItemChange(item.id, 'inventoryId')}
                  >
                    <option value="">-- Выберите --</option>
                    {inventoryItems.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.name} (остаток: {inv.quantity} {inv.unit})
                      </option>
                    ))}
                  </select>
                  {errors.inventoryId && (
                    <span className="input-error">{errors.inventoryId}</span>
                  )}
                </div>

                <Input
                  type="number"
                  name={`quantity-${item.id}`}
                  label="Количество *"
                  placeholder="1"
                  min={1}
                  value={item.quantity || ''}
                  onChange={handleItemChange(item.id, 'quantity')}
                  error={errors.quantity}
                />
              </div>
            ) : (
              /* Режим "Ручной ввод" */
              <div className="form-row">
                <Input
                  type="text"
                  name={`medicationName-${item.id}`}
                  label="Препарат *"
                  placeholder="Название препарата"
                  value={item.medicationName}
                  onChange={handleItemChange(item.id, 'medicationName')}
                  error={errors.medicationName}
                />
              </div>
            )}

            {/* Общие поля */}
            <div className="form-row">
              <Input
                type="text"
                name={`dosage-${item.id}`}
                label="Дозировка *"
                placeholder="500 мг"
                value={item.dosage}
                onChange={handleItemChange(item.id, 'dosage')}
                error={errors.dosage}
              />

              <Input
                type="text"
                name={`frequency-${item.id}`}
                label="Частота приёма *"
                placeholder="2 раза в день"
                value={item.frequency}
                onChange={handleItemChange(item.id, 'frequency')}
                error={errors.frequency}
              />
            </div>

            <div className="form-row">
              <Input
                type="text"
                name={`duration-${item.id}`}
                label="Длительность *"
                placeholder="7 дней"
                value={item.duration}
                onChange={handleItemChange(item.id, 'duration')}
                error={errors.duration}
              />
            </div>

            <div className="input-wrapper">
              <label className="input-label">Инструкции</label>
              <textarea
                name={`instructions-${item.id}`}
                className="input textarea"
                placeholder="Принимать после еды..."
                value={item.instructions}
                onChange={handleItemChange(item.id, 'instructions')}
                rows={2}
              />
            </div>
          </div>
        ))}

        <Button type="button" variant="secondary" onClick={addPrescription}>
          + Добавить назначение
        </Button>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Отмена
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Сохранить назначения
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PrescriptionFormPage;
