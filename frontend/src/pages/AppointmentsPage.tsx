import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Pagination, Button, Select } from '../components/common';
import { useAppointmentListPresenter } from '../presenters/useAppointmentListPresenter';
import { SearchIcon } from '../components/icons';
import {
  Appointment,
  AppointmentStatus,
  appointmentStatusLabels,
} from '../types/appointment.types';
import '../styles/appointments.css';

/**
 * Страница приемов
 */
export const AppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    appointments,
    pagination,
    filters,
    isLoading,
    error,
    handlePageChange,
    handleFilterChange,
  } = useAppointmentListPresenter();

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('ru-RU');
  };

  const formatTime = (time: string): string => {
    return time.slice(0, 5);
  };

  const getStatusClass = (status: AppointmentStatus): string => {
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

  const statusOptions = [
    { value: '', label: 'Все статусы' },
    { value: 'scheduled', label: 'Запланирован' },
    { value: 'in_progress', label: 'В процессе' },
    { value: 'completed', label: 'Завершён' },
    { value: 'cancelled', label: 'Отменён' },
  ];

  const columns = [
    {
      key: 'date',
      title: 'Дата',
      width: '120px',
      render: (a: Appointment) => formatDate(a.appointmentDate),
    },
    {
      key: 'time',
      title: 'Время',
      width: '80px',
      render: (a: Appointment) => formatTime(a.startTime),
    },
    {
      key: 'patient',
      title: 'Пациент',
      render: (a: Appointment) => a.patient?.fullName || '—',
    },
    {
      key: 'doctor',
      title: 'Врач',
      render: (a: Appointment) => a.doctor?.user?.fullName || '—',
    },
    {
      key: 'service',
      title: 'Услуга',
      render: (a: Appointment) => a.service?.name || '—',
    },
    {
      key: 'status',
      title: 'Статус',
      width: '140px',
      render: (a: Appointment) => (
        <span className={`badge ${getStatusClass(a.status)}`}>
          {appointmentStatusLabels[a.status]}
        </span>
      ),
    },
  ];

  return (
    <div className="page appointments-page">
      <header className="page-header">
        <div>
          <h1>Приёмы</h1>
          <p className="page-subtitle">Управление записями на приём</p>
        </div>
        <Button onClick={() => navigate('/appointments/new')}>
          + Новая запись
        </Button>
      </header>

      <div className="appointments-controls">
        <div className="search-bar">
          <SearchIcon size={20} />
          <input
            type="text"
            placeholder="Поиск по пациенту или врачу..."
            value={filters.search || ''}
            onChange={(e) => {
              const event = { target: { value: e.target.value } } as React.ChangeEvent<HTMLInputElement>;
              handleFilterChange('search')(event);
            }}
          />
        </div>
        <div className="appointments-filter">
          <Select
            options={statusOptions}
            value={filters.status || ''}
            onChange={handleFilterChange('status')}
          />
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="card">
        <h3 className="section-title">Список приёмов ({pagination.total})</h3>

        <Table
          columns={columns}
          data={appointments}
          keyField="id"
          isLoading={isLoading}
          emptyMessage="Приёмы не найдены"
          onRowClick={(a) => navigate(`/appointments/${a.id}`)}
        />
      </section>

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default AppointmentsPage;
