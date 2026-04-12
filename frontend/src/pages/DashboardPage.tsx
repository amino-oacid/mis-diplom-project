import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common';
import { StatCard, AppointmentCard } from '../components/dashboard';
import { CalendarIcon, UsersIcon, ClockIcon, TrendingUpIcon } from '../components/icons';
import { Appointment } from '../types/appointment.types';
import { appointmentModel, reportModel } from '../models';
import '../styles/dashboard.css';

interface DashboardStats {
  todayAppointments: number;
  newPatients: number;
  freeSlots: number;
  monthCompleted: number;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    newPatients: 0,
    freeSlots: 0,
    monthCompleted: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Загружаем данные параллельно
      const [appointmentsData, summaryData] = await Promise.all([
        appointmentModel.getToday(),
        reportModel.getSummary(),
      ]);

      setTodayAppointments(appointmentsData || []);

      setStats({
        todayAppointments: summaryData?.todayAppointments || appointmentsData?.length || 0,
        newPatients: summaryData?.newPatients || 0,
        freeSlots: summaryData?.freeSlots || 0,
        monthCompleted: summaryData?.monthCompleted || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    const formatted = date.toLocaleDateString('ru-RU', options);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  return (
    <div className="page dashboard-page">
      <header className="page-header">
        <div>
          <h1>Панель управления</h1>
          <p className="page-date">{formatDate(new Date())}</p>
        </div>
      </header>

      {/* Карточки статистики */}
      <section className="stats-grid">
        <StatCard
          title="Приёмов сегодня"
          value={stats.todayAppointments}
          icon={<CalendarIcon />}
        />
        <StatCard
          title="Новых пациентов"
          value={stats.newPatients}
          icon={<UsersIcon />}
        />
        <StatCard
          title="Свободных слотов"
          value={stats.freeSlots}
          icon={<ClockIcon />}
        />
        <StatCard
          title="Выполнено за месяц"
          value={stats.monthCompleted}
          icon={<TrendingUpIcon />}
        />
      </section>

      {/* Быстрые действия */}
      <section className="quick-actions">
        <h3 className="quick-actions-title">Быстрые действия</h3>
        <div className="quick-actions-row">
          <Button onClick={() => navigate('/appointments/new')}>
            Записать пациента
          </Button>
          <Button variant="secondary" onClick={() => navigate('/patients')}>
            Найти пациента
          </Button>
          <Button variant="secondary" onClick={() => navigate('/schedule')}>
            Посмотреть расписание
          </Button>
        </div>
      </section>

      {/* Расписание с приёмами на сегодня */}
      <section className="today-appointments">
        <div className="card">
          <h3 className="card-title">Приёмы на сегодня ({todayAppointments.length})</h3>

          {isLoading ? (
            <div className="loading-state">
              <div className="spinner-large"></div>
              <span>Загрузка...</span>
            </div>
          ) : todayAppointments.length === 0 ? (
            <div className="empty-state">
              <p>На сегодня приёмов нет</p>
            </div>
          ) : (
            <div className="appointments-list">
              {todayAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
