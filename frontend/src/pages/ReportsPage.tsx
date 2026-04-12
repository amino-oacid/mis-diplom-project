import React from 'react';
import { Button, Input } from '../components/common';
import { useReportsPresenter } from '../presenters/useReportsPresenter';
import { DownloadIcon, CalendarIcon } from '../components/icons';
import '../styles/reports.css';

/**
 * Страница отчетов
 */
export const ReportsPage: React.FC = () => {
  const {
    activeReport,
    params,
    appointmentsReport,
    revenueReport,
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

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price);
  };

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
          className={`tab ${activeReport === 'revenue' ? 'active' : ''}`}
          onClick={() => handleReportChange('revenue')}
        >
          Доходы
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
            {activeReport === 'appointments' && appointmentsReport && (
              <div className="report-table-container">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Услуга</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointmentsReport.appointments?.map((appointment, idx) => (
                      <tr key={idx}>
                        <td>{new Date(appointment.date).toLocaleDateString('ru-RU')}</td>
                        <td>{appointment.service}</td>
                      </tr>
                    ))}
                    {(!appointmentsReport.appointments || appointmentsReport.appointments.length === 0) && (
                      <tr>
                        <td colSpan={2} className="empty-cell">Нет данных о приёмах</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeReport === 'revenue' && revenueReport && (
              <div className="report-table-container">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Период</th>
                      <th>Приёмы</th>
                      <th>Доход</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueReport.byPeriod?.map((period, idx) => (
                      <tr key={idx}>
                        <td>{period.period}</td>
                        <td>{period.count}</td>
                        <td>{formatPrice(period.revenue)}</td>
                      </tr>
                    ))}
                    {(!revenueReport.byPeriod || revenueReport.byPeriod.length === 0) && (
                      <tr>
                        <td colSpan={3} className="empty-cell">Нет данных о доходах</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeReport === 'inventory' && inventoryReport && (
              <div className="report-table-container">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Наименование</th>
                      <th>Тип</th>
                      <th>Израсходовано</th>
                      <th>Остаток</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryReport.lowStock?.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name}</td>
                        <td>Медикамент</td>
                        <td>—</td>
                        <td className={item.quantity <= item.minQuantity ? 'quantity-low' : ''}>
                          {item.quantity} {item.unit || 'шт'}
                        </td>
                      </tr>
                    ))}
                    {(!inventoryReport.lowStock || inventoryReport.lowStock.length === 0) && (
                      <tr>
                        <td colSpan={4} className="empty-cell">Нет данных о расходе материалов</td>
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
