import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginRequest, LoginFormErrors } from '../types/auth.types';
import { useAuth } from '../hooks/useAuth';
import { AxiosError } from 'axios';

/**
 * Презентер формы входа
 */
export const useLoginPresenter = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Состояние формы
  const [formData, setFormData] = useState<LoginRequest>({
    login: '',
    password: '',
  });

  // Состояние ошибок
  const [errors, setErrors] = useState<LoginFormErrors>({});

  // Состояние загрузки
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Валидация формы
   */
  const validate = useCallback((): boolean => {
    const newErrors: LoginFormErrors = {};

    if (!formData.login.trim()) {
      newErrors.login = 'Введите логин';
    } else if (formData.login.length < 3) {
      newErrors.login = 'Логин должен быть не менее 3 символов';
    }

    if (!formData.password) {
      newErrors.password = 'Введите пароль';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * Обработка изменения поля
   */
  const handleChange = useCallback(
    (field: keyof LoginRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Очищаем ошибку поля при вводе
      if (errors[field]) {
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
        await login(formData);
        navigate('/dashboard', { replace: true });
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;

        if (axiosError.response?.status === 401) {
          setErrors({ general: 'Неверный логин или пароль' });
        } else if (axiosError.response?.data?.message) {
          setErrors({ general: axiosError.response.data.message });
        } else {
          setErrors({ general: 'Ошибка сервера. Попробуйте позже.' });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, login, navigate, validate]
  );

  /**
   * Очистка формы
   */
  const resetForm = useCallback(() => {
    setFormData({ login: '', password: '' });
    setErrors({});
  }, []);

  return {
    // Данные формы
    formData,
    errors,
    isSubmitting,

    // Методы
    handleChange,
    handleSubmit,
    resetForm,
  };
};

export default useLoginPresenter;
