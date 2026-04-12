import { useState, useCallback, useEffect } from 'react';
import { authModel } from '../models/auth.model';
import { doctorModel } from '../models/doctor.model';
import { User } from '../types';
import { AxiosError } from 'axios';

interface ProfileFormData {
  lastName: string;
  firstName: string;
  middleName: string;
  email: string;
  phone: string;
  position: string;
}

interface DoctorFormData {
  specialization: string;
  experienceYears: string;
  officeNumber: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfileErrors {
  lastName?: string;
  firstName?: string;
  email?: string;
  general?: string;
}

interface PasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

/**
 * Презентер страницы профиля пользователя
 */
export const useProfilePresenter = () => {
  // Данные пользователя
  const [user, setUser] = useState<User | null>(null);

  // Состояние загрузки и режимов
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Данные формы профиля
  const [formData, setFormData] = useState<ProfileFormData>({
    lastName: '',
    firstName: '',
    middleName: '',
    email: '',
    phone: '',
    position: '',
  });

  // Данные формы врача
  const [doctorFormData, setDoctorFormData] = useState<DoctorFormData>({
    specialization: '',
    experienceYears: '',
    officeNumber: '',
  });

  // Данные формы смены пароля
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Ошибки валидации и сообщение об успехе
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  /**
   * Загрузка данных пользователя при монтировании
   */
  useEffect(() => {
    loadUser();
  }, []);

  /**
   * Загрузка профиля текущего пользователя
   */
  const loadUser = async () => {
    try {
      setIsLoading(true);
      const userData = await authModel.getMe();
      setUser(userData);
      setFormData({
        lastName: userData.lastName || '',
        firstName: userData.firstName || '',
        middleName: userData.middleName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        position: userData.position || '',
      });
      if (userData.doctor) {
        setDoctorFormData({
          specialization: userData.doctor.specialization || '',
          experienceYears: userData.doctor.experienceYears?.toString() || '',
          officeNumber: userData.doctor.officeNumber || '',
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
      setErrors({ general: 'Ошибка загрузки профиля' });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Валидация данных профиля
   */
  const validateProfile = useCallback((): boolean => {
    const newErrors: ProfileErrors = {};

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Введите фамилию';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Введите имя';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Неверный формат email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * Валидация данных смены пароля
   */
  const validatePassword = useCallback((): boolean => {
    const newErrors: PasswordErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Введите текущий пароль';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Введите новый пароль';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Пароль должен быть не менее 6 символов';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [passwordData]);

  /**
   * Обработка изменения полей профиля
   */
  const handleChange = useCallback(
    (field: keyof ProfileFormData) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        if (errors[field as keyof ProfileErrors]) {
          setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
      },
    [errors]
  );

  /**
   * Обработка изменения полей формы врача
   */
  const handleDoctorChange = useCallback(
    (field: keyof DoctorFormData) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setDoctorFormData((prev) => ({ ...prev, [field]: e.target.value }));
      },
    []
  );

  /**
   * Обработка изменения полей формы пароля
   */
  const handlePasswordChange = useCallback(
    (field: keyof PasswordFormData) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData((prev) => ({ ...prev, [field]: e.target.value }));
        if (passwordErrors[field as keyof PasswordErrors]) {
          setPasswordErrors((prev) => ({ ...prev, [field]: undefined }));
        }
      },
    [passwordErrors]
  );

  /**
   * Сохранение изменений профиля
   */
  const handleSaveProfile = useCallback(async () => {
    setSuccessMessage('');
    setErrors((prev) => ({ ...prev, general: undefined }));

    if (!validateProfile()) {
      return;
    }

    setIsSaving(true);

    try {
      const updatedUser = await authModel.updateProfile({
        lastName: formData.lastName,
        firstName: formData.firstName,
        middleName: formData.middleName || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        position: formData.position || undefined,
      });

      // Если пользователь — врач, сохраняем данные врача
      if (user?.doctor && user.doctor.id) {
        await doctorModel.update(user.doctor.id, {
          specialization: doctorFormData.specialization || undefined,
          experienceYears: doctorFormData.experienceYears
            ? parseInt(doctorFormData.experienceYears)
            : undefined,
          officeNumber: doctorFormData.officeNumber || undefined,
        });
      }

      await loadUser();
      setIsEditMode(false);
      setSuccessMessage('Профиль успешно обновлён');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setErrors({
        general: axiosError.response?.data?.message || 'Ошибка сохранения профиля',
      });
    } finally {
      setIsSaving(false);
    }
  }, [formData, doctorFormData, user, validateProfile]);

  /**
   * Смена пароля пользователя
   */
  const handleChangePassword = useCallback(async () => {
    setSuccessMessage('');
    setPasswordErrors((prev) => ({ ...prev, general: undefined }));

    if (!validatePassword()) {
      return;
    }

    setIsChangingPassword(true);

    try {
      await authModel.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setSuccessMessage('Пароль успешно изменён');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setPasswordErrors({
        general: axiosError.response?.data?.message || 'Ошибка смены пароля',
      });
    } finally {
      setIsChangingPassword(false);
    }
  }, [passwordData, validatePassword]);

  /**
   * Отмена редактирования и сброс формы
   */
  const handleCancelEdit = useCallback(() => {
    if (user) {
      setFormData({
        lastName: user.lastName || '',
        firstName: user.firstName || '',
        middleName: user.middleName || '',
        email: user.email || '',
        phone: user.phone || '',
        position: user.position || '',
      });
      if (user.doctor) {
        setDoctorFormData({
          specialization: user.doctor.specialization || '',
          experienceYears: user.doctor.experienceYears?.toString() || '',
          officeNumber: user.doctor.officeNumber || '',
        });
      }
    }
    setErrors({});
    setIsEditMode(false);
  }, [user]);

  return {
    // Данные пользователя
    user,

    // Состояние
    isLoading,
    isEditMode,
    setIsEditMode,
    isSaving,
    isChangingPassword,

    // Данные форм
    formData,
    doctorFormData,
    passwordData,

    // Ошибки и сообщения
    errors,
    passwordErrors,
    successMessage,

    // Методы
    handleChange,
    handleDoctorChange,
    handlePasswordChange,
    handleSaveProfile,
    handleChangePassword,
    handleCancelEdit,
  };
};

export default useProfilePresenter;
