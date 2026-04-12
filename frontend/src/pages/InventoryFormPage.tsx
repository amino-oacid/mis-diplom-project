import React from 'react';
import { Input, Button, Select, Alert } from '../components/common';
import { useInventoryFormPresenter } from '../presenters/useInventoryFormPresenter';
import { inventoryTypeLabels } from '../types/inventory.types';
import '../styles/inventory.css';

/**
 * Страница формы позиции со склада (просмотр/редактирование)
 */
export const InventoryFormPage: React.FC = () => {
  const {
    formData,
    errors,
    isEditMode,
    isLoading,
    isSubmitting,
    handleChange,
    handleSubmit,
    handleCancel,
  } = useInventoryFormPresenter();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner-large" />
        <p>Загрузка...</p>
      </div>
    );
  }

  // Режим просмотра (если есть id)
  if (isEditMode) {
    return (
      <div className="page inventory-form-page">
        <div className="page-header">
          <h1>Просмотр позиции</h1>
        </div>

        <div className="form-card">
          <div className="form-section">
            <h3>Основная информация</h3>

            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Название</span>
                <span className="info-value">{formData.name}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Тип</span>
                <span className="info-value">{inventoryTypeLabels[formData.type]}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Единица измерения</span>
                <span className="info-value">{formData.unit}</span>
              </div>

              {formData.description && (
                <div className="info-item full-width">
                  <span className="info-label">Описание</span>
                  <span className="info-value">{formData.description}</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Количество и цена</h3>

            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Количество</span>
                <span className="info-value">{formData.quantity} {formData.unit}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Минимальный остаток</span>
                <span className="info-value">{formData.minQuantity} {formData.unit}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Цена закупки</span>
                <span className="info-value">
                  {formData.purchasePrice ? `${formData.purchasePrice} ₽` : '—'}
                </span>
              </div>

              <div className="info-item">
                <span className="info-label">Срок годности</span>
                <span className="info-value">
                  {formData.expiryDate
                    ? new Date(formData.expiryDate).toLocaleDateString('ru-RU')
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Назад
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Режим создания
  const typeOptions = [
    { value: 'medication', label: 'Медикаменты' },
    { value: 'consumable', label: 'Расходники' },
    { value: 'equipment', label: 'Оборудование' },
  ];

  const unitOptions = [
    { value: 'шт', label: 'шт' },
    { value: 'уп', label: 'уп' },
    { value: 'мл', label: 'мл' },
    { value: 'г', label: 'г' },
    { value: 'л', label: 'л' },
    { value: 'кг', label: 'кг' },
  ];

  return (
    <div className="page inventory-form-page">
      <div className="page-header">
        <h1>Новая позиция</h1>
      </div>

      <form className="form-card" onSubmit={handleSubmit} noValidate>
        {errors.general && <Alert type="error" message={errors.general} />}

        <div className="form-section">
          <h3>Основная информация</h3>

          <Input
            type="text"
            name="name"
            label="Название *"
            placeholder="Название товара"
            value={formData.name}
            onChange={handleChange('name')}
            error={errors.name}
          />

          <div className="form-row">
            <Select
              name="type"
              label="Тип *"
              value={formData.type}
              onChange={handleChange('type')}
              options={typeOptions}
              error={errors.type}
            />

            <Select
              name="unit"
              label="Единица измерения *"
              value={formData.unit}
              onChange={handleChange('unit')}
              options={unitOptions}
              error={errors.unit}
            />
          </div>

          <div className="input-wrapper">
            <label className="input-label">Описание</label>
            <textarea
              name="description"
              className="input textarea"
              placeholder="Описание товара..."
              value={formData.description}
              onChange={handleChange('description')}
              rows={3}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Количество и цена</h3>

          <div className="form-row">
            <Input
              type="number"
              name="quantity"
              label="Количество"
              value={formData.quantity}
              onChange={handleChange('quantity')}
              error={errors.quantity}
              min={0}
            />

            <Input
              type="number"
              name="minQuantity"
              label="Минимальный остаток"
              value={formData.minQuantity}
              onChange={handleChange('minQuantity')}
              min={0}
            />
          </div>

          <div className="form-row">
            <Input
              type="number"
              name="purchasePrice"
              label="Цена закупки (₽)"
              value={formData.purchasePrice}
              onChange={handleChange('purchasePrice')}
              error={errors.purchasePrice}
              min={0}
              step={0.01}
            />

            <Input
              type="date"
              name="expiryDate"
              label="Срок годности"
              value={formData.expiryDate}
              onChange={handleChange('expiryDate')}
            />
          </div>
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Отмена
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Создать
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InventoryFormPage;
