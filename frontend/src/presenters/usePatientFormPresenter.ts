import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CreatePatientRequest,
  PatientFormErrors,
  GenderType,
} from '../types/patient.types';
import { patientModel } from '../models/patient.model';
import { AxiosError } from 'axios';

/**
 * Презентер формы пациента
 */
export const usePatientFormPresenter = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  // Начальное состояние формы
  const initialFormData: CreatePatientRequest = {
    lastName: '',
    firstName: '',
    middleName: '',
    birthDate: '',
    gender: 'male' as GenderType,
    phone: '',
    email: '',
    address: '',
    passportSeries: '',
    passportNumber: '',
    insurancePolicy: '',
  };

  // Состояние формы
  const [formData, setFormData] = useState<CreatePatientRequest>(initialFormData);
  const [errors, setErrors] = useState<PatientFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Загрузка данных пациента для редактирования
   */
  useEffect(() => {
    if (isEditMode && id) {
      setIsLoading(true);
      patientModel
        .getById(parseInt(id))
        .then((patient: any) => {
          setFormData({
            lastName: patient.lastName || '',
            firstName: patient.firstName || '',
            middleName: patient.middleName || '',
            birthDate: patient.birthDate?.split?.('T')[0] || patient.birthDate,
            gender: patient.gender,
            phone: patient.phone,
            email: patient.email || '',
            address: patient.address || '',
            passportSeries: patient.passportSeries || '',
            passportNumber: patient.passportNumber || '',
            insurancePolicy: patient.insurancePolicy || '',
          });
        })
        .catch((err) => {
          console.error(err);
          setErrors({ general: 'Ошибка загрузки данных пациента' });
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
    const newErrors: PatientFormErrors = {};

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Введите фамилию';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Введите имя';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'Выберите дату рождения';
    } else {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      if (birthDate > today) {
        newErrors.birthDate = 'Дата рождения не может быть в будущем';
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Введите номер телефона';
    } else if (!/^\+?[\d\s\-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Неверный формат телефона';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Неверный формат email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * Обработка изменения поля
   */
  const handleChange = useCallback(
    (field: keyof CreatePatientRequest) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field as keyof PatientFormErrors]) {
          setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
      },
    [errors]
  );

  /**
   * Обработка отправки формы
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrors((prev) => ({ ...prev, general: undefined }));

      if (!validate()) {
        return;
      }

      setIsSubmitting(true);

      try {
        if (isEditMode && id) {
          await patientModel.update(parseInt(id), formData);
        } else {
          await patientModel.create(formData);
        }
        navigate('/patients');
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        if (axiosError.response?.data?.message) {
          setErrors({ general: axiosError.response.data.message });
        } else {
          setErrors({ general: 'Ошибка сохранения. Попробуйте позже.' });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, isEditMode, id, navigate, validate]
  );

  /**
   * Отмена и возврат к списку
   */
  const handleCancel = useCallback(() => {
    navigate('/patients');
  }, [navigate]);

  return {
    // Данные
    formData,
    errors,
    isLoading,
    isSubmitting,
    isEditMode,

    // Методы
    handleChange,
    handleSubmit,
    handleCancel,
  };
};

export default usePatientFormPresenter;
