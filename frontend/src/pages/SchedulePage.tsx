import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select } from '../components/common';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/icons';
import { appointmentModel, doctorModel } from '../models';
import { Appointment, DoctorInfo } from '../types';
import { useAuth } from '../hooks/useAuth';
import '../styles/schedule.css';

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

const getWeekDays = (startDate: Date) => {
  const days = [];
  const start = new Date(startDate);
  start.setDate(start.getDate() - start.getDay() + 1); // Monday

  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    days.push(date);
  }
  return days;
};

const formatWeekRange = (startDate: Date) => {
  const days = getWeekDays(startDate);
  const first = days[0];
  const last = days[6];

  const formatDay = (d: Date) => {
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const monthNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
                       'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]}`;
  };

  return `${formatDay(first)} - ${formatDay(last)}`;
};

const isToday = (date: Date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Страница расписания
 */
export const SchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null); // null = не инициализировано
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [doctorsLoaded, setDoctorsLoaded] = useState(false);

  const weekDays = getWeekDays(currentWeek);

  useEffect(() => {
    loadDoctors();
  }, []);

  // Установить текущего пользователя-врача по умолчанию 
  useEffect(() => {
    if (doctorsLoaded && doctors.length > 0 && user && selectedDoctor === null) {
      const currentDoctor = doctors.find(d => d.userId === user.id);
      if (currentDoctor) {
        setSelectedDoctor(String(currentDoctor.id));
      } else {
        setSelectedDoctor(''); // Все врачи
      }
    }
  }, [doctorsLoaded, doctors, user]);

  useEffect(() => {
    if (doctorsLoaded && selectedDoctor !== null) {
      loadAppointments();
    }
  }, [currentWeek, selectedDoctor, doctorsLoaded]);

  const loadDoctors = async () => {
    try {
      const data = await doctorModel.getAll();
      setDoctors(data);
      setDoctorsLoaded(true);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setDoctorsLoaded(true);
    }
  };

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const dateFrom = weekDays[0].toISOString().split('T')[0];
      const dateTo = weekDays[6].toISOString().split('T')[0];

      const params: { dateFrom: string; dateTo: string; doctorId?: number } = {
        dateFrom,
        dateTo,
      };

      if (selectedDoctor) {
        params.doctorId = Number(selectedDoctor);
      }

      const response = await appointmentModel.getAll(params);
      setAppointments(response.items || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentWeek(newDate);
  };

  // Преобразование времени в минуты для сравнения
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  };

  // Найти приём в 30-минутном слоте
  const getAppointmentAt = (date: Date, slotTime: string): Appointment | undefined => {
    const dateStr = date.toISOString().split('T')[0];
    const slotMinutes = timeToMinutes(slotTime);
    const nextSlotMinutes = slotMinutes + 30;

    return appointments.find(a => {
      // Нормализуем дату приёма (может приходить в разных форматах)
      const aptDateStr = typeof a.appointmentDate === 'string'
        ? a.appointmentDate.split('T')[0]
        : new Date(a.appointmentDate).toISOString().split('T')[0];

      if (aptDateStr !== dateStr) return false;

      const aptStart = timeToMinutes(a.startTime || '');
      const aptEnd = timeToMinutes(a.endTime || '');

      // Приём пересекается со слотом
      return aptStart < nextSlotMinutes && aptEnd > slotMinutes;
    });
  };

  const formatDayHeader = (date: Date) => {
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const monthNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
                       'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]}`;
  };

  const doctorOptions = [
    { value: '', label: 'Все врачи' },
    ...doctors.map(d => ({ value: String(d.id), label: d.user.fullName }))
  ];

  return (
    <div className="page schedule-page">
      <header className="page-header">
        <div>
          <h1>Расписание</h1>
          <p className="page-subtitle">Управление расписанием приёмов врачей</p>
        </div>
      </header>

      <div className="schedule-controls">
        <div className="schedule-filter">
          <Select
            options={doctorOptions}
            value={selectedDoctor || ''}
            onChange={(e) => setSelectedDoctor(e.target.value)}
          />
        </div>

        <div className="week-navigation">
          <button className="nav-btn" onClick={() => navigateWeek(-1)}>
            <ChevronLeftIcon size={20} />
          </button>
          <span className="week-range">{formatWeekRange(currentWeek)}</span>
          <button className="nav-btn" onClick={() => navigateWeek(1)}>
            <ChevronRightIcon size={20} />
          </button>
        </div>
      </div>

      <section className="card schedule-card">
        <h3 className="section-title">Недельный график</h3>

        {isLoading ? (
          <div className="loading-state">
            <div className="spinner-large"></div>
            <span>Загрузка...</span>
          </div>
        ) : (
          <div className="schedule-grid">
            <div className="schedule-header">
              <div className="time-header"></div>
              {weekDays.map((day, index) => (
                <div
                  key={index}
                  className={`day-header ${isToday(day) ? 'today' : ''}`}
                >
                  {formatDayHeader(day)}
                </div>
              ))}
            </div>

            <div className="schedule-body">
              {timeSlots.map((time) => (
                <div key={time} className="schedule-row">
                  <div className="time-cell">{time}</div>
                  {weekDays.map((day, dayIndex) => {
                    const appointment = getAppointmentAt(day, time);
                    return (
                      <div
                        key={dayIndex}
                        className={`slot-cell ${isToday(day) ? 'today' : ''}`}
                        onClick={() => !appointment && navigate(`/appointments/new?date=${day.toISOString().split('T')[0]}&time=${time}`)}
                      >
                        {appointment ? (
                          <div
                            className="appointment-slot"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/appointments/${appointment.id}`);
                            }}
                          >
                            <span className="slot-patient">{appointment.patient?.fullName}</span>
                            <span className="slot-service">{appointment.service?.name}</span>
                          </div>
                        ) : (
                          <span className="free-slot">Свободно</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default SchedulePage;
