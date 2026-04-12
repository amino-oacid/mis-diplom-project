import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Select, Alert } from '../components/common';
import {
  ArrowLeftIcon,
  CalendarIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  UserIcon,
} from '../components/icons';
import { patientModel, medicalRecordModel } from '../models';
import {
  Patient,
  Appointment,
  appointmentStatusLabels,
  MedicalRecord,
  MedicalHistory,
  Prescription,
  bloodTypes,
} from '../types';
import '../styles/patient-card.css';

type TabType = 'personal' | 'medical' | 'appointments' | 'prescriptions';

/**
 * Страница медкарты пациента
 */
export const PatientCardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Данные пациента
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [history, setHistory] = useState<MedicalHistory[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  // Состояние UI
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Редактирование медицинских данных
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    bloodType: '',
    allergies: '',
    chronicDiseases: '',
    lifeAnamnesis: '',
    surgeries: '',
    familyAnamnesis: '',
    badHabits: '',
  });

  /**
   * Загрузка данных пациента
   */
  const loadPatientData = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);
      const patientId = Number(id);

      const [patientData, appointmentsData, medicalData, historyData, prescriptionsData] =
        await Promise.all([
          patientModel.getById(patientId),
          patientModel.getAppointments(patientId),
          medicalRecordModel.getByPatientId(patientId).catch(() => null),
          medicalRecordModel.getHistory(patientId).catch(() => []),
          medicalRecordModel.getAllPrescriptions(patientId).catch(() => []),
        ]);

      setPatient(patientData);
      setAppointments(appointmentsData);
      setMedicalRecord(medicalData);
      setHistory(historyData);
      setPrescriptions(prescriptionsData);

      // Заполняем форму данными из ЭМК
      if (medicalData) {
        setFormData({
          bloodType: medicalData.bloodType || '',
          allergies: medicalData.allergies || '',
          chronicDiseases: medicalData.chronicDiseases || '',
          lifeAnamnesis: medicalData.lifeAnamnesis || '',
          surgeries: medicalData.surgeries || '',
          familyAnamnesis: medicalData.familyAnamnesis || '',
          badHabits: medicalData.badHabits || '',
        });
      }
    } catch (err) {
      console.error('Error loading patient data:', err);
      setError('Ошибка загрузки данных пациента');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPatientData();
  }, [loadPatientData]);

  /**
   * Обработка изменения полей формы
   */
  const handleChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  /**
   * Сохранение медицинских данных
   */
  const handleSave = async () => {
    if (!id) return;

    setIsSaving(true);
    setError(null);

    try {
      await medicalRecordModel.update(Number(id), formData);
      await loadPatientData();
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving medical record:', err);
      setError('Ошибка сохранения данных');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Отмена редактирования
   */
  const handleCancelEdit = () => {
    if (medicalRecord) {
      setFormData({
        bloodType: medicalRecord.bloodType || '',
        allergies: medicalRecord.allergies || '',
        chronicDiseases: medicalRecord.chronicDiseases || '',
        lifeAnamnesis: medicalRecord.lifeAnamnesis || '',
        surgeries: medicalRecord.surgeries || '',
        familyAnamnesis: medicalRecord.familyAnamnesis || '',
        badHabits: medicalRecord.badHabits || '',
      });
    }
    setIsEditing(false);
  };

  /**
   * Форматирование даты
   */
  const formatDate = (date: string | Date | undefined | null): string => {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('ru-RU');
  };

  /**
   * Форматирование пола
   */
  const formatGender = (gender: string): string => {
    return gender === 'male' ? 'Мужской' : 'Женский';
  };

  /**
   * Расчёт возраста
   */
  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  /**
   * CSS-класс для статуса приёма
   */
  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'scheduled':
        return 'badge-info';
      case 'completed':
        return 'badge-success';
      case 'in_progress':
        return 'badge-warning';
      case 'cancelled':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  };

  // Опции групп крови
  const bloodTypeOptions = [
    { value: '', label: 'Не указана' },
    ...bloodTypes.map((bt) => ({ value: bt, label: bt })),
  ];

  // Состояние загрузки
  if (isLoading) {
    return (
      <div className="page patient-card-page">
        <div className="loading-state">
          <div className="spinner-large"></div>
          <span>Загрузка...</span>
        </div>
      </div>
    );
  }

  // Пациент не найден
  if (!patient) {
    return (
      <div className="page patient-card-page">
        <div className="empty-state">
          <p>Пациент не найден</p>
          <Button onClick={() => navigate('/patients')}>К списку пациентов</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page patient-card-page">
      <a className="back-link" onClick={() => navigate('/patients')}>
        <ArrowLeftIcon size={16} />
        Вернуться к списку пациентов
      </a>

      <header className="patient-card-header">
        <div>
          <h1>{patient.fullName}</h1>
          <p className="page-subtitle">
            {formatDate(patient.birthDate)} ({calculateAge(patient.birthDate)} лет) •{' '}
            {formatGender(patient.gender)} • {patient.phone}
          </p>
        </div>
        <div className="header-actions">
          <Button variant="outline" onClick={() => navigate(`/patients/${patient.id}`)}>
            Редактировать
          </Button>
          <Button onClick={() => navigate(`/appointments/new?patientId=${patient.id}`)}>
            <CalendarIcon size={16} />
            Записать на приём
          </Button>
        </div>
      </header>

      {error && <Alert type="error" message={error} />}

      {/* Вкладки */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          Личные данные
        </button>
        <button
          className={`tab ${activeTab === 'medical' ? 'active' : ''}`}
          onClick={() => setActiveTab('medical')}
        >
          Медицинские данные
        </button>
        <button
          className={`tab ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          История приёмов ({appointments.length})
        </button>
        <button
          className={`tab ${activeTab === 'prescriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('prescriptions')}
        >
          Назначения ({prescriptions.length})
        </button>
      </div>

      <div className="tab-content">
        {/* Вкладка: Личные данные */}
        {activeTab === 'personal' && (
          <section className="card personal-data-section">
            <h3 className="section-title">Личные данные</h3>
            <div className="personal-data-grid">
              <div className="data-item">
                <span className="data-label">ФИО</span>
                <span className="data-value">{patient.fullName}</span>
              </div>
              <div className="data-item">
                <span className="data-label">Дата рождения</span>
                <span className="data-value">
                  {formatDate(patient.birthDate)} ({calculateAge(patient.birthDate)} лет)
                </span>
              </div>
              <div className="data-item">
                <span className="data-label">Пол</span>
                <span className="data-value">{formatGender(patient.gender)}</span>
              </div>
              <div className="data-item">
                <span className="data-label">
                  <PhoneIcon size={14} />
                  Телефон
                </span>
                <span className="data-value">{patient.phone}</span>
              </div>
              <div className="data-item">
                <span className="data-label">
                  <MailIcon size={14} />
                  Email
                </span>
                <span className="data-value">{patient.email || '—'}</span>
              </div>
              <div className="data-item">
                <span className="data-label">
                  <MapPinIcon size={14} />
                  Адрес
                </span>
                <span className="data-value">{patient.address || '—'}</span>
              </div>
              <div className="data-item">
                <span className="data-label">Паспорт</span>
                <span className="data-value">
                  {patient.passportSeries && patient.passportNumber
                    ? `${patient.passportSeries} ${patient.passportNumber}`
                    : '—'}
                </span>
              </div>
              <div className="data-item">
                <span className="data-label">Полис ОМС</span>
                <span className="data-value">{patient.insurancePolicy || '—'}</span>
              </div>
            </div>
          </section>
        )}

        {/* Вкладка: Медицинские данные */}
        {activeTab === 'medical' && (
          <section className="card medical-data-section">
            <div className="section-header">
              <h3 className="section-title">Медицинские данные (ЭМК)</h3>
              {!isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Редактировать
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="medical-form">
                <Select
                  name="bloodType"
                  label="Группа крови"
                  value={formData.bloodType}
                  onChange={handleChange('bloodType')}
                  options={bloodTypeOptions}
                />

                <div className="input-wrapper">
                  <label className="input-label">Аллергии</label>
                  <textarea
                    className="input textarea"
                    placeholder="Известные аллергии..."
                    value={formData.allergies}
                    onChange={handleChange('allergies')}
                    rows={3}
                  />
                </div>

                <div className="input-wrapper">
                  <label className="input-label">Хронические заболевания</label>
                  <textarea
                    className="input textarea"
                    placeholder="Хронические заболевания..."
                    value={formData.chronicDiseases}
                    onChange={handleChange('chronicDiseases')}
                    rows={3}
                  />
                </div>

                <div className="input-wrapper">
                  <label className="input-label">Анамнез жизни</label>
                  <textarea
                    className="input textarea"
                    placeholder="Анамнез жизни пациента..."
                    value={formData.lifeAnamnesis}
                    onChange={handleChange('lifeAnamnesis')}
                    rows={3}
                  />
                </div>

                <div className="input-wrapper">
                  <label className="input-label">Перенесённые операции</label>
                  <textarea
                    className="input textarea"
                    placeholder="Перенесённые операции..."
                    value={formData.surgeries}
                    onChange={handleChange('surgeries')}
                    rows={3}
                  />
                </div>

                <div className="input-wrapper">
                  <label className="input-label">Семейный анамнез</label>
                  <textarea
                    className="input textarea"
                    placeholder="Семейный анамнез..."
                    value={formData.familyAnamnesis}
                    onChange={handleChange('familyAnamnesis')}
                    rows={3}
                  />
                </div>

                <div className="input-wrapper">
                  <label className="input-label">Вредные привычки</label>
                  <textarea
                    className="input textarea"
                    placeholder="Вредные привычки..."
                    value={formData.badHabits}
                    onChange={handleChange('badHabits')}
                    rows={2}
                  />
                </div>

                <div className="form-actions">
                  <Button variant="secondary" onClick={handleCancelEdit}>
                    Отмена
                  </Button>
                  <Button onClick={handleSave} loading={isSaving}>
                    Сохранить
                  </Button>
                </div>
              </div>
            ) : (
              <div className="medical-data-grid">
                <div className="data-item">
                  <span className="data-label">Группа крови</span>
                  <span className="data-value">{medicalRecord?.bloodType || 'Не указана'}</span>
                </div>
                <div className="data-item">
                  <span className="data-label">Аллергии</span>
                  <span className="data-value">{medicalRecord?.allergies || 'Нет данных'}</span>
                </div>
                <div className="data-item">
                  <span className="data-label">Хронические заболевания</span>
                  <span className="data-value">
                    {medicalRecord?.chronicDiseases || 'Нет данных'}
                  </span>
                </div>
                <div className="data-item">
                  <span className="data-label">Анамнез жизни</span>
                  <span className="data-value">
                    {medicalRecord?.lifeAnamnesis || 'Нет данных'}
                  </span>
                </div>
                <div className="data-item">
                  <span className="data-label">Перенесённые операции</span>
                  <span className="data-value">{medicalRecord?.surgeries || 'Нет данных'}</span>
                </div>
                <div className="data-item">
                  <span className="data-label">Семейный анамнез</span>
                  <span className="data-value">
                    {medicalRecord?.familyAnamnesis || 'Нет данных'}
                  </span>
                </div>
                <div className="data-item">
                  <span className="data-label">Вредные привычки</span>
                  <span className="data-value">{medicalRecord?.badHabits || 'Нет данных'}</span>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Вкладка: История приёмов */}
        {activeTab === 'appointments' && (
          <section className="card appointments-history-section">
            {history.length === 0 && appointments.length === 0 ? (
              <div className="empty-state">
                <p>История приёмов пуста</p>
              </div>
            ) : (
              <div className="appointments-history-list">
                {/* Завершённые приёмы */}
                {history.map((item) => (
                  <div
                    key={item.appointmentId}
                    className="appointment-history-item"
                    onClick={() => navigate(`/appointments/${item.appointmentId}`)}
                  >
                    <div className="appointment-history-main">
                      <div className="appointment-history-date">{formatDate(item.date)}</div>
                      <div className="appointment-history-info">
                        <span className="doctor-name">
                          <UserIcon size={14} />
                          {item.doctor?.fullName || 'Врач не указан'}
                          {item.doctor?.specialization && (
                            <span className="doctor-spec"> • {item.doctor.specialization}</span>
                          )}
                        </span>
                        <span className="service-name">
                          {item.service?.name || 'Услуга не указана'}
                        </span>
                        {item.diagnosis && (
                          <span className="diagnosis">
                            <strong>Диагноз:</strong> {item.diagnosis}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="badge badge-success">Завершён</span>
                  </div>
                ))}

                {/* Незавершённые приёмы */}
                {appointments
                  .filter((a) => a.status !== 'completed')
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="appointment-history-item"
                      onClick={() => navigate(`/appointments/${appointment.id}`)}
                    >
                      <div className="appointment-history-main">
                        <div className="appointment-history-date">
                          {formatDate(appointment.appointmentDate)}
                        </div>
                        <div className="appointment-history-info">
                          <span className="doctor-name">
                            <UserIcon size={14} />
                            {(appointment.doctor as any)?.fullName ||
                              appointment.doctor?.user?.fullName ||
                              'Врач не указан'}
                            {((appointment.doctor as any)?.specialization ||
                              appointment.doctor?.specialization) && (
                              <span className="doctor-spec">
                                {' '}
                                •{' '}
                                {(appointment.doctor as any)?.specialization ||
                                  appointment.doctor?.specialization}
                              </span>
                            )}
                          </span>
                          <span className="service-name">
                            {appointment.service?.name || 'Услуга не указана'}
                          </span>
                        </div>
                      </div>
                      <span className={`badge ${getStatusClass(appointment.status)}`}>
                        {appointmentStatusLabels[appointment.status] || appointment.status}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </section>
        )}

        {/* Вкладка: Назначения */}
        {activeTab === 'prescriptions' && (
          <section className="card prescriptions-section">
            {prescriptions.length === 0 ? (
              <div className="empty-state">
                <p>Нет активных назначений</p>
              </div>
            ) : (
              <div className="prescriptions-list">
                {prescriptions.map((p) => (
                  <div key={p.id} className="prescription-card">
                    <div className="prescription-header">
                      <h4>{p.medicationName}</h4>
                      <span className="badge badge-success">Активно</span>
                    </div>
                    <div className="prescription-body">
                      <div className="prescription-row">
                        <span className="prescription-label">Дозировка:</span>
                        <span>{p.dosage}</span>
                      </div>
                      <div className="prescription-row">
                        <span className="prescription-label">Частота:</span>
                        <span>{p.frequency}</span>
                      </div>
                      <div className="prescription-row">
                        <span className="prescription-label">Длительность:</span>
                        <span>{p.duration}</span>
                      </div>
                      {p.instructions && (
                        <div className="prescription-row">
                          <span className="prescription-label">Инструкции:</span>
                          <span>{p.instructions}</span>
                        </div>
                      )}
                      <div className="prescription-row">
                        <span className="prescription-label">Назначено:</span>
                        <span>{formatDate(p.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default PatientCardPage;
