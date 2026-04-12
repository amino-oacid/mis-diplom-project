import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterRequest, RegisterFormErrors } from '../types/auth.types';
import { authModel } from '../models/auth.model';
import { useAuth } from '../hooks/useAuth';
import { AxiosError } from 'axios';

interface RegisterFormData extends RegisterRequest {
  confirmPassword: string;
}

/**
 * Презентер формы регистрации
 */
export const useRegisterPresenter = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Состояние формы
  const [formData, setFormData] = useState<RegisterFormData>({
    login: '',
    password: '',
    confirmPassword: '',
    lastName: '',
    firstName: '',
    middleName: '',
    email: '',
    phone: '',
    role: 'doctor',
  });

  // Состояние ошибок
  const [errors, setErrors] = useState<RegisterFormErrors>({});

  // Состояние загрузки
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Валидация формы
   */
  const validate = useCallback((): boolean => {
    const newErrors: RegisterFormErrors = {};

    // Логин
    if (!formData.login.trim()) {
      newErrors.login = 'Введите логин';
    } else if (formData.login.length < 3) {
      newErrors.login = 'Логин должен быть не менее 3 символов';
    } else if (formData.login.length > 50) {
      newErrors.login = 'Логин не может быть длиннее 50 символов';
    }

    // Пароль
    if (!formData.password) {
      newErrors.password = 'Введите пароль';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }

    // Подтверждение пароля
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Подтвердите пароль';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    // Фамилия
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Введите фамилию';
    }

    // Имя
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Введите имя';
    }

    // Email (опционально, но если введён - проверяем формат)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * Обработка изменения поля
   */
  const handleChange = useCallback(
    (field: keyof RegisterFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Очищаем ошибку поля при вводе
      if (errors[field as keyof RegisterFormErrors]) {
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

      // Очищаем общую ошибку
      setErrors((prev) => ({ ...prev, general: undefined }));

      // Валидация
      if (!validate()) {
        return;
      }

      setIsSubmitting(true);

      try {
        // Убираем confirmPassword перед отправкой
        const { confirmPassword, ...registerData } = formData;

        // Убираем пустые опциональные поля
        const cleanData: RegisterRequest = {
          login: registerData.login,
          password: registerData.password,
          lastName: registerData.lastName,
          firstName: registerData.firstName,
          role: registerData.role,
        };

        if (registerData.middleName?.trim()) {
          cleanData.middleName = registerData.middleName.trim();
        }
        if (registerData.email?.trim()) {
          cleanData.email = registerData.email.trim();
        }
        if (registerData.phone?.trim()) {
          cleanData.phone = registerData.phone.trim();
        }

        await authModel.register(cleanData);

        // Автоматический вход после успешной регистрации
        await login({ login: cleanData.login, password: cleanData.password });
        navigate('/dashboard');
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;

        if (axiosError.response?.status === 409) {
          setErrors({ login: 'Пользователь с таким логином уже существует' });
        } else if (axiosError.response?.data?.message) {
          setErrors({ general: axiosError.response.data.message });
        } else {
          setErrors({ general: 'Ошибка сервера. Попробуйте позже.' });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validate, login, navigate]
  );

  return {
    // Данные формы
    formData,
    errors,
    isSubmitting,

    // Методы
    handleChange,
    handleSubmit,
  };
};

export default useRegisterPresenter;
