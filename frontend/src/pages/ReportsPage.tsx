import React from 'react';
import { Button, Input } from '../components/common';
import { useReportsPresenter } from '../presenters/useReportsPresenter';
import { DownloadIcon, CalendarIcon } from '../components/icons';
import { appointmentStatusLabels } from '../types/appointment.types';
import '../styles/reports.css';
import '../styles/appointments.css';

/**
 * Страница отчетов
 */
export const ReportsPage: React.FC = () => {
  const {
    activeReport,
    params,
    appointmentsReport,
    inventoryReport,
    isLoading,
    isExporting,
    error,
    handleReportChange,
    handleParamChange,
    applyFilters,
    exportPdf,
    exportExcel,
  } = useReportsPresenter();

  return (
    <div className="page reports-page">
      <header className="page-header">
        <div>
          <h1>Отчёты</h1>
          <p className="page-subtitle">Аналитика и статистика клиники</p>
        </div>
      </header>

      <div className="reports-controls">
        <div className="date-range">
          <div className="date-input">
            <CalendarIcon size={16} />
            <Input
              type="date"
              value={params.dateFrom || ''}
              onChange={handleParamChange('dateFrom')}
            />
          </div>
          <span className="date-separator">—</span>
          <div className="date-input">
            <CalendarIcon size={16} />
            <Input
              type="date"
              value={params.dateTo || ''}
              onChange={handleParamChange('dateTo')}
            />
          </div>
          <Button variant="secondary" onClick={applyFilters}>
            Применить
          </Button>
        </div>
        <div className="export-buttons">
          <Button
            variant="secondary"
            onClick={exportPdf}
            disabled={isLoading || isExporting}
          >
            <DownloadIcon size={16} />
            PDF
          </Button>
          <Button
            variant="secondary"
            onClick={exportExcel}
            disabled={isLoading || isExporting}
          >
            <DownloadIcon size={16} />
            Excel
          </Button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="tabs">
        <button
          className={`tab ${activeReport === 'appointments' ? 'active' : ''}`}
          onClick={() => handleReportChange('appointments')}
        >
          Приёмы
        </button>
        <button
          className={`tab ${activeReport === 'inventory' ? 'active' : ''}`}
          onClick={() => handleReportChange('inventory')}
        >
          Склад
        </button>
      </div>

      <section className="card report-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner-large"></div>
            <span>Загрузка отчёта...</span>
          </div>
        ) : (
          <>
            {activeReport === 'appointments' && !appointmentsReport && (
              <div className="empty-state">
                <p>Выберите период и нажмите «Применить» для загрузки отчёта</p>
              </div>
            )}

            {activeReport === 'appointments' && appointmentsReport && (
              <div className="report-table-container">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Услуга</th>
                      <th>Цена</th>
                      <th>Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointmentsReport.appointments?.map((appointment, idx) => {
                      const getStatusClass = (status: string): string => {
                        switch (status) {
                          case 'scheduled': return 'badge-info';
                          case 'in_progress': return 'badge-warning';
                          case 'completed': return 'badge-success';
                          case 'cancelled': return 'badge-danger';
                          default: return 'badge-info';
                        }
                      };
                      return (
                        <tr key={idx}>
                          <td>{new Date(appointment.date).toLocaleDateString('ru-RU')}</td>
                          <td>{appointment.service}</td>
                          <td>{appointment.cost?.toLocaleString('ru-RU')} ₽</td>
                          <td>
                            <span className={`badge ${getStatusClass(appointment.status)}`}>
                              {appointmentStatusLabels[appointment.status as keyof typeof appointmentStatusLabels] || appointment.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {(!appointmentsReport.appointments || appointmentsReport.appointments.length === 0) && (
                      <tr>
                        <td colSpan={4} className="empty-cell">Нет данных о приёмах</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeReport === 'inventory' && !inventoryReport && (
              <div className="empty-state">
                <p>Нажмите «Применить» для загрузки отчёта по складу</p>
              </div>
            )}

            {activeReport === 'inventory' && inventoryReport && (
              <div className="report-table-container">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Наименование</th>
                      <th>Операция</th>
                      <th>Кол-во</th>
                      <th>Остаток</th>
                      <th>Причина</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryReport.movements?.map((movement, idx) => {
                      const operationLabels: Record<string, string> = {
                        income: 'Приход',
                        expense: 'Расход',
                      };
                      return (
                        <tr key={idx}>
                          <td>{new Date(movement.date).toLocaleDateString('ru-RU')}</td>
                          <td>{movement.itemName}</td>
                          <td>
                            <span className={`operation-badge operation-${movement.operationType}`}>
                              {operationLabels[movement.operationType] || movement.operationType}
                            </span>
                          </td>
                          <td>{movement.operationType === 'income' ? '+' : '-'}{movement.quantity}</td>
                          <td>{movement.quantityAfter}</td>
                          <td>{movement.reason || '—'}</td>
                        </tr>
                      );
                    })}
                    {(!inventoryReport.movements || inventoryReport.movements.length === 0) && (
                      <tr>
                        <td colSpan={6} className="empty-cell">Нет данных о движении склада</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default ReportsPage;
