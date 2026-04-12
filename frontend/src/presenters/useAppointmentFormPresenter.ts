import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreateAppointmentRequest,
  AppointmentFormErrors,
  TimeSlot,
  DoctorInfo,
  Service,
  Patient,
} from '../types';
import { appointmentModel, doctorModel, serviceModel } from '../models';
import { patientModel } from '../models/patient.model';
import { AxiosError } from 'axios';

/**
 * Презентер формы создания приёма
 */
export const useAppointmentFormPresenter = () => {
  const navigate = useNavigate();

  // Начальное состояние формы
  const initialFormData: CreateAppointmentRequest = {
    patientId: 0,
    doctorId: 0,
    serviceId: 0,
    appointmentDate: '',
    startTime: '',
    endTime: '',
  };

  // Состояние формы
  const [formData, setFormData] = useState<CreateAppointmentRequest>(initialFormData);
  const [errors, setErrors] = useState<AppointmentFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Справочные данные
  const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Поиск пациента
  const [patientSearch, setPatientSearch] = useState('');
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);

  /**
   * Загрузка справочников
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        const [doctorsData, servicesData] = await Promise.all([
          doctorModel.getAll(),
          serviceModel.getAll(),
        ]);
        setDoctors(doctorsData);
        setServices(servicesData);
      } catch (err) {
        console.error('Ошибка загрузки справочников:', err);
      }
    };
    loadData();
  }, []);

  /**
   * Поиск пациентов
   */
  useEffect(() => {
    if (patientSearch.length < 2) {
      setPatientResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingPatients(true);
      try {
        const results = await patientModel.search(patientSearch);
        setPatientResults(results);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingPatients(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [patientSearch]);

  /**
   * Загрузка слотов при выборе врача, даты и услуги
   */
  useEffect(() => {
    if (formData.doctorId && formData.appointmentDate && formData.serviceId) {
      setIsLoadingSlots(true);
      appointmentModel
        .getSlots(formData.doctorId, formData.appointmentDate, formData.serviceId)
        .then(setSlots)
        .catch((err) => {
          console.error(err);
          setSlots([]);
        })
        .finally(() => setIsLoadingSlots(false));
    } else {
      setSlots([]);
    }
  }, [formData.doctorId, formData.appointmentDate, formData.serviceId]);

  /**
   * Валидация формы
   */
  const validate = useCallback((): boolean => {
    const newErrors: AppointmentFormErrors = {};

    if (!formData.patientId) {
      newErrors.patientId = 'Выберите пациента';
    }

    if (!formData.doctorId) {
      newErrors.doctorId = 'Выберите врача';
    }

    if (!formData.serviceId) {
      newErrors.serviceId = 'Выберите услугу';
    }

    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'Выберите дату';
    } else {
      const selectedDate = new Date(formData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.appointmentDate = 'Нельзя записать на прошедшую дату';
      }
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Выберите время';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * Выбор пациента из результатов поиска
   */
  const handleSelectPatient = useCallback((patient: Patient) => {
    setSelectedPatient(patient);
    setFormData((prev) => ({ ...prev, patientId: patient.id }));
    setPatientSearch(patient.fullName || '');
    setPatientResults([]);
    setErrors((prev) => ({ ...prev, patientId: undefined }));
  }, []);

  /**
   * Очистка выбранного пациента
   */
  const handleClearPatient = useCallback(() => {
    setSelectedPatient(null);
    setFormData((prev) => ({ ...prev, patientId: 0 }));
    setPatientSearch('');
    setPatientResults([]);
  }, []);

  /**
   * Обработка изменения поля
   */
  const handleChange = useCallback(
    (field: keyof CreateAppointmentRequest) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        let value: string | number = e.target.value;

        // Преобразуем в число для ID-полей (radio и select возвращают строки)
        if (field === 'doctorId' || field === 'serviceId') {
          value = parseInt(e.target.value) || 0;
        }

        // При выборе времени (startTime) также сохраняем endTime из слота
        if (field === 'startTime') {
          const selectedSlot = slots.find((s) => s.startTime === e.target.value);
          if (selectedSlot) {
            setFormData((prev) => ({
              ...prev,
              startTime: selectedSlot.startTime,
              endTime: selectedSlot.endTime,
            }));
          } else {
            setFormData((prev) => ({ ...prev, startTime: e.target.value }));
          }
        } else {
          setFormData((prev) => ({ ...prev, [field]: value as any }));
        }

        // Сброс времени при изменении врача, даты или услуги
        if (['doctorId', 'appointmentDate', 'serviceId'].includes(field)) {
          setFormData((prev) => ({ ...prev, startTime: '', endTime: '' }));
        }

        if (errors[field as keyof AppointmentFormErrors]) {
          setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
      },
    [errors, slots]
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
        await appointmentModel.create(formData);
        navigate('/appointments');
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        if (axiosError.response?.data?.message) {
          setErrors({ general: axiosError.response.data.message });
        } else {
          setErrors({ general: 'Ошибка создания приёма. Попробуйте позже.' });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, navigate, validate]
  );

  /**
   * Отмена и возврат к списку
   */
  const handleCancel = useCallback(() => {
    navigate('/appointments');
  }, [navigate]);

  return {
    // Данные формы
    formData,
    errors,
    isSubmitting,

    // Справочники
    doctors,
    services,
    slots,
    isLoadingSlots,

    // Поиск пациента
    patientSearch,
    setPatientSearch,
    patientResults,
    selectedPatient,
    isSearchingPatients,

    // Методы
    handleChange,
    handleSelectPatient,
    handleClearPatient,
    handleSubmit,
    handleCancel,
  };
};

export default useAppointmentFormPresenter;
