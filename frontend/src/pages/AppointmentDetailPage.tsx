import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Alert } from '../components/common';
import { ArrowLeftIcon, UserIcon, CalendarIcon } from '../components/icons';
import { appointmentModel } from '../models/appointment.model';
import { Appointment, appointmentStatusLabels } from '../types/appointment.types';
import '../styles/appointments.css';

/**
 * Страница ведения приема
 */
export const AppointmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Форма заключения
  const [formData, setFormData] = useState({
    complaints: '',
    diagnosis: '',
    conclusion: '',
    recommendations: '',
  });

  useEffect(() => {
    if (id) {
      loadAppointment();
    }
  }, [id]);

  const loadAppointment = async () => {
    try {
      setIsLoading(true);
      const data = await appointmentModel.getById(Number(id));
      setAppointment(data);
      setFormData({
        complaints: data.complaints || '',
        diagnosis: data.diagnosis || '',
        conclusion: data.conclusion || '',
        recommendations: data.recommendations || '',
      });
    } catch (err) {
      setError('Ошибка загрузки приёма');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    if (!appointment) return;

    setIsSaving(true);
    setError(null);

    try {
      await appointmentModel.update(appointment.id, formData);
      await loadAppointment();
      setIsEditing(false);
    } catch (err) {
      setError('Ошибка сохранения');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!appointment) return;

    if (!formData.diagnosis.trim()) {
      setError('Для завершения приёма необходимо указать диагноз');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await appointmentModel.complete(appointment.id, {
        diagnosis: formData.diagnosis,
        complaints: formData.complaints,
        conclusion: formData.conclusion,
        recommendations: formData.recommendations,
      });
      await loadAppointment();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка завершения приёма');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStart = async () => {
    if (!appointment) return;

    try {
      await appointmentModel.start(appointment.id);
      await loadAppointment();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка начала приёма');
    }
  };

  const handleCancel = async () => {
    if (!appointment) return;

    try {
      await appointmentModel.cancel(appointment.id);
      await loadAppointment();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка отмены приёма');
    }
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'scheduled': return 'badge-info';
      case 'in_progress': return 'badge-warning';
      case 'completed': return 'badge-success';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  if (isLoading) {
    return (
      <div className="page">
        <div className="loading-state">
          <div className="spinner-large"></div>
          <span>Загрузка...</span>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="page">
        <Alert type="error" message="Приём не найден" />
        <Button onClick={() => navigate('/appointments')}>К списку приёмов</Button>
      </div>
    );
  }

  return (
    <div className="page appointment-detail-page">
      <a className="back-link" onClick={() => navigate('/appointments')}>
        <ArrowLeftIcon size={16} />
        Вернуться к списку приёмов
      </a>

      <header className="page-header">
        <div>
          <h1>Приём #{appointment.id}</h1>
          <p className="page-subtitle">{formatDate(appointment.appointmentDate)}</p>
        </div>
        <span className={`badge badge-lg ${getStatusClass(appointment.status)}`}>
          {appointmentStatusLabels[appointment.status]}
        </span>
      </header>

      {error && <Alert type="error" message={error} />}

      <div className="appointment-detail-grid">
        {/* Информация о приёме */}
        <section className="card">
          <h3 className="section-title">Информация о приёме</h3>

          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">
                <CalendarIcon size={16} />
                Дата и время
              </span>
              <span className="info-value">
                {formatDate(appointment.appointmentDate)}, {appointment.startTime?.slice(0, 5)} — {appointment.endTime?.slice(0, 5)}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">
                <UserIcon size={16} />
                Пациент
              </span>
              <span className="info-value">
                {appointment.patient?.fullName || '—'}
                {appointment.patient?.phone && (
                  <span className="info-secondary"> • {appointment.patient.phone}</span>
                )}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">
                <UserIcon size={16} />
                Врач
              </span>
              <span className="info-value">
                {appointment.doctor?.user?.fullName || '—'}
                {appointment.doctor?.specialization && (
                  <span className="info-secondary"> • {appointment.doctor.specialization}</span>
                )}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Услуга</span>
              <span className="info-value">
                {appointment.service?.name || '—'}
                {appointment.service?.price && (
                  <span className="info-secondary"> • {appointment.service.price} ₽</span>
                )}
              </span>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="appointment-actions">
            {appointment.status === 'scheduled' && (
              <>
                <Button variant="primary" onClick={handleStart}>
                  Начать приём
                </Button>
                <Button variant="danger" onClick={handleCancel}>
                  Отменить
                </Button>
              </>
            )}
          </div>
        </section>

        {/* Заключение */}
        <section className="card">
          <div className="section-header">
            <h3 className="section-title">Заключение</h3>
            {appointment.status === 'completed' && !isEditing && (
              <Button variant="outline" size="small" onClick={() => setIsEditing(true)}>
                Редактировать
              </Button>
            )}
          </div>

          {isEditing || appointment.status === 'in_progress' ? (
            <div className="conclusion-form">
              <div className="input-wrapper">
                <label className="input-label">Жалобы пациента</label>
                <textarea
                  className="input textarea"
                  placeholder="Опишите жалобы пациента..."
                  value={formData.complaints}
                  onChange={handleChange('complaints')}
                  rows={3}
                />
              </div>

              <div className="input-wrapper">
                <label className="input-label">Диагноз *</label>
                <textarea
                  className="input textarea"
                  placeholder="Укажите диагноз..."
                  value={formData.diagnosis}
                  onChange={handleChange('diagnosis')}
                  rows={3}
                />
              </div>

              <div className="input-wrapper">
                <label className="input-label">Заключение</label>
                <textarea
                  className="input textarea"
                  placeholder="Заключение врача..."
                  value={formData.conclusion}
                  onChange={handleChange('conclusion')}
                  rows={3}
                />
              </div>

              <div className="input-wrapper">
                <label className="input-label">Рекомендации</label>
                <textarea
                  className="input textarea"
                  placeholder="Рекомендации пациенту..."
                  value={formData.recommendations}
                  onChange={handleChange('recommendations')}
                  rows={3}
                />
              </div>

              <div className="form-actions">
                {appointment.status === 'in_progress' ? (
                  <>
                    <Button variant="secondary" onClick={() => setIsEditing(false)}>
                      Отмена
                    </Button>
                    <Button variant="secondary" onClick={handleSave} loading={isSaving}>
                      Сохранить черновик
                    </Button>
                    <Button variant="primary" onClick={handleComplete} loading={isSaving}>
                      Завершить приём
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="secondary" onClick={() => setIsEditing(false)}>
                      Отмена
                    </Button>
                    <Button variant="primary" onClick={handleSave} loading={isSaving}>
                      Сохранить
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="conclusion-view">
              {appointment.complaints && (
                <div className="conclusion-item">
                  <span className="conclusion-label">Жалобы:</span>
                  <span className="conclusion-value">{appointment.complaints}</span>
                </div>
              )}

              {appointment.diagnosis ? (
                <div className="conclusion-item">
                  <span className="conclusion-label">Диагноз:</span>
                  <span className="conclusion-value">{appointment.diagnosis}</span>
                </div>
              ) : (
                <div className="empty-conclusion">Заключение не заполнено</div>
              )}

              {appointment.conclusion && (
                <div className="conclusion-item">
                  <span className="conclusion-label">Заключение:</span>
                  <span className="conclusion-value">{appointment.conclusion}</span>
                </div>
              )}

              {appointment.recommendations && (
                <div className="conclusion-item">
                  <span className="conclusion-label">Рекомендации:</span>
                  <span className="conclusion-value">{appointment.recommendations}</span>
                </div>
              )}

            </div>
          )}
        </section>
      </div>

      {/* Быстрые действия */}
      <div className="quick-actions">
        <Button
          variant="outline"
          onClick={() => navigate(`/patients/${appointment.patient?.id}/card`)}
        >
          Карта пациента
        </Button>
        {appointment.status === 'completed' && (
          <Button
            variant="outline"
            onClick={() => navigate(`/prescriptions/new/${appointment.id}?patientId=${appointment.patient?.id}`)}
          >
            Добавить назначение
          </Button>
        )}
      </div>
    </div>
  );
};

export default AppointmentDetailPage;
