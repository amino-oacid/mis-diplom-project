import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Appointment, appointmentStatusLabels } from '../../types/appointment.types';
import { Button } from '../common';

interface AppointmentCardProps {
  appointment: Appointment;
}

const getStatusClass = (status: string): string => {
  switch (status) {
    case 'scheduled':
      return 'badge-success';
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

/**
 * Компонент карточки приема
 */
export const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
  const navigate = useNavigate();

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  return (
    <div className="appointment-card">
      <div className="appointment-card-main">
        <h4 className="appointment-patient-name">
          {appointment.patient?.fullName || 'Пациент не указан'}
        </h4>
        <p className="appointment-info">
          {appointment.doctor?.user?.fullName || 'Врач не указан'} • {appointment.service?.name || 'Услуга не указана'}
        </p>
      </div>
      <div className="appointment-card-right">
        <span className="appointment-time">{formatTime(appointment.startTime)}</span>
        <span className={`badge ${getStatusClass(appointment.status)}`}>
          {appointmentStatusLabels[appointment.status] || appointment.status}
        </span>
      </div>
      <Button
        size="small"
        variant="secondary"
        onClick={() => navigate(`/appointments/${appointment.id}`)}
      >
        Подробнее
      </Button>
    </div>
  );
};

export default AppointmentCard;
