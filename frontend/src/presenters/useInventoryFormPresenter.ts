import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  InventoryItem,
  CreateInventoryRequest,
  InventoryFormErrors,
  InventoryType,
} from '../types/inventory.types';
import { inventoryModel } from '../models/inventory.model';
import { AxiosError } from 'axios';

/**
 * Презентер формы склада
 */
export const useInventoryFormPresenter = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  // Начальное состояние
  const initialFormData: CreateInventoryRequest = {
    name: '',
    type: 'medication' as InventoryType,
    quantity: 0,
    unit: 'шт',
    minQuantity: 0,
    purchasePrice: 0,
    expiryDate: '',
    description: '',
  };

  // Состояние формы
  const [formData, setFormData] = useState<CreateInventoryRequest>(initialFormData);
  const [errors, setErrors] = useState<InventoryFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Загрузка данных для редактирования
   */
  useEffect(() => {
    if (isEditMode && id) {
      setIsLoading(true);
      inventoryModel
        .getById(parseInt(id))
        .then((item: InventoryItem) => {
          setFormData({
            name: item.name,
            type: item.type,
            quantity: item.quantity,
            unit: item.unit,
            minQuantity: item.minQuantity,
            purchasePrice: item.purchasePrice,
            expiryDate: item.expiryDate?.split('T')[0] || '',
            description: item.description || '',
          });
        })
        .catch((err) => {
          console.error(err);
          setErrors({ general: 'Ошибка загрузки данных' });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id, isEditMode]);

  /**
   * Валидация формы
   */
  const validate = useCallback((): boolean => {
    const newErrors: InventoryFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Введите название';
    }

    if (!formData.type) {
      newErrors.type = 'Выберите тип';
    }

    if (formData.quantity < 0) {
      newErrors.quantity = 'Количество не может быть отрицательным';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'Введите единицу измерения';
    }

    if (formData.purchasePrice !== undefined && formData.purchasePrice < 0) {
      newErrors.purchasePrice = 'Цена не может быть отрицательной';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * Обработка изменения поля
   */
  const handleChange = useCallback(
    (field: keyof CreateInventoryRequest) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const value =
          e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field as keyof InventoryFormErrors]) {
          setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
      },
    [errors]
  );

  /**
   * Отправка формы
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrors((prev) => ({ ...prev, general: undefined }));

      if (!validate()) return;

      setIsSubmitting(true);

      try {
        if (isEditMode && id) {
          await inventoryModel.update(parseInt(id), formData);
        } else {
          await inventoryModel.create(formData);
        }
        navigate('/inventory');
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        if (axiosError.response?.data?.message) {
          setErrors({ general: axiosError.response.data.message });
        } else {
          setErrors({ general: 'Ошибка сохранения' });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, isEditMode, id, navigate, validate]
  );

  /**
   * Отмена
   */
  const handleCancel = useCallback(() => {
    navigate('/inventory');
  }, [navigate]);

  return {
    // Данные
    formData,
    errors,
    isEditMode,

    // Состояние
    isLoading,
    isSubmitting,

    // Методы
    handleChange,
    handleSubmit,
    handleCancel,
  };
};

export default useInventoryFormPresenter;
