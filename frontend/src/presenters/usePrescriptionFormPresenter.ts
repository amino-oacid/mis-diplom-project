import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Prescription,
  PrescriptionFormErrors,
  InventoryItem,
} from '../types';
import { prescriptionModel } from '../models/prescription.model';
import { inventoryModel } from '../models/inventory.model';
import { AxiosError } from 'axios';

// Режим ввода назначения
type PrescriptionMode = 'inventory' | 'manual';

// Счётчик для генерации уникальных ID
let idCounter = 0;

// Интерфейс для одного назначения в форме
interface PrescriptionItem {
  id: number;
  mode: PrescriptionMode; 
  inventoryId?: number;
  quantity?: number; 
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

/**
 * Презентер формы назначений
 */
export const usePrescriptionFormPresenter = () => {
  const navigate = useNavigate();
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');

  // Начальный элемент
  const createEmptyItem = (): PrescriptionItem => ({
    id: ++idCounter,
    mode: 'inventory', // По умолчанию - со склада
    inventoryId: undefined,
    quantity: undefined,
    medicationName: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
  });

  // Состояние формы
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([createEmptyItem()]);
  const [errors, setErrors] = useState<PrescriptionFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingPrescriptions, setExistingPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Список позиций склада
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  /**
   * Загрузка существующих назначений приёма
   */
  useEffect(() => {
    if (appointmentId) {
      setIsLoading(true);
      prescriptionModel
        .getByAppointment(parseInt(appointmentId))
        .then(setExistingPrescriptions)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [appointmentId]);

  /**
   * Загрузка списка позиций склада
   */
  useEffect(() => {
    inventoryModel
      .getAll({ limit: 1000 })
      .then((res) => setInventoryItems(res.items))
      .catch(console.error);
  }, []);

  /**
   * Добавление нового назначения
   */
  const addPrescription = useCallback(() => {
    setPrescriptions((prev) => [...prev, createEmptyItem()]);
  }, []);

  /**
   * Удаление назначения
   */
  const removePrescription = useCallback((id: number) => {
    setPrescriptions((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  /**
   * Смена режима ввода (склад / ручной)
   */
  const handleModeChange = useCallback((id: number, mode: PrescriptionMode) => {
    setPrescriptions((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              mode,
              inventoryId: undefined,
              quantity: undefined,
              medicationName: '',
            }
          : p
      )
    );
    setErrors({});
  }, []);

  /**
   * Обработка изменения поля назначения
   */
  const handleItemChange = useCallback(
    (id: number, field: keyof Omit<PrescriptionItem, 'id' | 'mode'>) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const rawValue = e.target.value;
        // Преобразуем значение в число для числовых полей
        const value =
          field === 'inventoryId' || field === 'quantity'
            ? rawValue === '' ? undefined : parseInt(rawValue, 10)
            : rawValue;

        setPrescriptions((prev) =>
          prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
        );
        setErrors({});
      },
    []
  );

  /**
   * Валидация формы
   */
  const validate = useCallback((): boolean => {
    for (const p of prescriptions) {
      if (p.mode === 'inventory') {
        // Валидация для режима "Со склада"
        if (!p.inventoryId) {
          setErrors({ inventoryId: 'Выберите позицию склада' });
          return false;
        }
        if (!p.quantity || p.quantity < 1) {
          setErrors({ quantity: 'Укажите количество' });
          return false;
        }
        // Проверка остатка
        const inv = inventoryItems.find((i) => i.id === p.inventoryId);
        if (inv && p.quantity > inv.quantity) {
          setErrors({ quantity: `Недостаточно на складе (доступно: ${inv.quantity})` });
          return false;
        }
      } else {
        // Валидация для режима "Ручной ввод"
        if (!p.medicationName.trim()) {
          setErrors({ medicationName: 'Введите название препарата' });
          return false;
        }
      }

      // Общая валидация
      if (!p.dosage.trim()) {
        setErrors({ dosage: 'Введите дозировку' });
        return false;
      }
      if (!p.frequency.trim()) {
        setErrors({ frequency: 'Введите частоту приёма' });
        return false;
      }
      if (!p.duration.trim()) {
        setErrors({ duration: 'Введите длительность' });
        return false;
      }
    }
    return true;
  }, [prescriptions, inventoryItems]);

  /**
   * Отправка формы
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!appointmentId || !patientId) {
        setErrors({ general: 'Не указан приём или пациент' });
        return;
      }

      if (!validate()) return;

      setIsSubmitting(true);
      setErrors({});

      try {
        await prescriptionModel.createBatch({
          appointmentId: parseInt(appointmentId),
          patientId: parseInt(patientId),
          prescriptions: prescriptions.map((p) => ({
            // Если режим "со склада" - берём название из выбранной позиции
            medicationName:
              p.mode === 'inventory'
                ? inventoryItems.find((i) => i.id === p.inventoryId)?.name || ''
                : p.medicationName,
            dosage: p.dosage,
            frequency: p.frequency,
            duration: p.duration,
            instructions: p.instructions || undefined,
            // Передаём inventoryId и quantity только для режима "со склада"
            inventoryId: p.mode === 'inventory' ? p.inventoryId : undefined,
            quantity: p.mode === 'inventory' ? p.quantity : undefined,
          })),
        });

        navigate(`/appointments/${appointmentId}`);
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        if (axiosError.response?.data?.message) {
          setErrors({ general: axiosError.response.data.message });
        } else {
          setErrors({ general: 'Ошибка сохранения назначений' });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [appointmentId, patientId, prescriptions, inventoryItems, navigate, validate]
  );

  /**
   * Отмена и возврат
   */
  const handleCancel = useCallback(() => {
    if (appointmentId) {
      navigate(`/appointments/${appointmentId}`);
    } else {
      navigate(-1);
    }
  }, [navigate, appointmentId]);

  /**
   * Удаление существующего назначения
   */
  const handleDeleteExisting = useCallback(
    async (id: number) => {
      if (!window.confirm('Удалить назначение?')) return;

      try {
        await prescriptionModel.delete(id);
        setExistingPrescriptions((prev) => prev.filter((p) => p.id !== id));
      } catch (err) {
        console.error(err);
        setErrors({ general: 'Ошибка удаления' });
      }
    },
    []
  );

  return {
    // Данные
    prescriptions,
    existingPrescriptions,
    errors,
    appointmentId: appointmentId ? parseInt(appointmentId) : null,
    patientId: patientId ? parseInt(patientId) : null,
    inventoryItems,

    // Состояние
    isLoading,
    isSubmitting,

    // Методы
    addPrescription,
    removePrescription,
    handleModeChange,
    handleItemChange,
    handleSubmit,
    handleCancel,
    handleDeleteExisting,
  };
};

export default usePrescriptionFormPresenter;
