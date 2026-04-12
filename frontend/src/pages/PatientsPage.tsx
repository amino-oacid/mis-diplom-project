import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Pagination, Button } from '../components/common';
import { usePatientListPresenter } from '../presenters/usePatientListPresenter';
import { Patient, GenderType } from '../types/patient.types';
import { SearchIcon, EyeIcon } from '../components/icons';
import '../styles/patients.css';

/**
 * Страница списка пациентов
 */
export const PatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    patients,
    pagination,
    searchQuery,
    isLoading,
    error,
    handlePageChange,
    handleSearchChange,
  } = usePatientListPresenter();

  const formatGender = (gender: GenderType): string => {
    return gender === 'male' ? 'Мужской' : 'Женский';
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('ru-RU');
  };

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

  const formatAgeLabel = (age: number): string => {
    const lastDigit = age % 10;
    const lastTwoDigits = age % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return `${age} лет`;
    }
    if (lastDigit === 1) {
      return `${age} год`;
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
      return `${age} года`;
    }
    return `${age} лет`;
  };

  const columns = [
    { key: 'fullName', title: 'ФИО' },
    {
      key: 'birthDate',
      title: 'Дата рождения',
      render: (p: Patient) => formatDate(p.birthDate),
    },
    {
      key: 'age',
      title: 'Возраст',
      render: (p: Patient) => formatAgeLabel(calculateAge(p.birthDate)),
    },
    {
      key: 'gender',
      title: 'Пол',
      render: (p: Patient) => formatGender(p.gender),
    },
    { key: 'phone', title: 'Телефон' },
    {
      key: 'actions',
      title: '',
      width: '120px',
      render: (p: Patient) => (
        <Button
          size="small"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/patients/${p.id}/card`);
          }}
        >
          <EyeIcon size={16} />
          Карта
        </Button>
      ),
    },
  ];

  return (
    <div className="page patients-page">
      <header className="page-header">
        <div>
          <h1>Пациенты</h1>
          <p className="page-subtitle">Управление базой данных пациентов</p>
        </div>
        <Button onClick={() => navigate('/patients/new')}>
          + Добавить пациента
        </Button>
      </header>

      <div className="search-bar">
        <SearchIcon size={20} />
        <input
          type="text"
          placeholder="Поиск по ФИО или телефону..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="card">
        <h3 className="section-title">Список пациентов ({pagination.total})</h3>

        <Table
          columns={columns}
          data={patients}
          keyField="id"
          isLoading={isLoading}
          emptyMessage="Пациенты не найдены"
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

export default PatientsPage;
