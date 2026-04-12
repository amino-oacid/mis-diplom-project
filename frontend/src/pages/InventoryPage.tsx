import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Pagination, Button, Select, Input } from '../components/common';
import { useInventoryListPresenter } from '../presenters/useInventoryListPresenter';
import { AlertTriangleIcon, SearchIcon } from '../components/icons';
import {
  InventoryItem,
  InventoryType,
  inventoryTypeLabels,
} from '../types/inventory.types';
import '../styles/inventory.css';

/**
 * Страница формы склада со списком позиций (для прихода/расхода)
 */
export const InventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    stats,
    pagination,
    filters,
    isLoading,
    error,
    handlePageChange,
    handleTypeChange,
    handleSearchChange,
    toggleLowStock,
    handleIncome,
    handleExpense,
  } = useInventoryListPresenter();

  const [modal, setModal] = useState<{
    type: 'income' | 'expense';
    item: InventoryItem;
  } | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [modalReason, setModalReason] = useState('');

  const typeOptions = [
    { value: '', label: 'Все типы' },
    { value: 'medication', label: 'Медикаменты' },
    { value: 'consumable', label: 'Расходники' },
    { value: 'equipment', label: 'Оборудование' },
  ];

  const handleModalSubmit = async () => {
    if (!modal) return;

    if (modal.type === 'income') {
      await handleIncome(modal.item.id, modalQuantity, modalReason);
    } else {
      await handleExpense(modal.item.id, modalQuantity, modalReason);
    }

    setModal(null);
    setModalQuantity(1);
    setModalReason('');
  };

  const columns = [
    { key: 'name', title: 'Наименование' },
    {
      key: 'type',
      title: 'Тип',
      width: '140px',
      render: (item: InventoryItem) => inventoryTypeLabels[item.type],
    },
    {
      key: 'quantity',
      title: 'Количество',
      width: '120px',
      render: (item: InventoryItem) => (
        <span className={item.quantity <= item.minQuantity ? 'quantity-low' : ''}>
          {item.quantity}
        </span>
      ),
    },
    {
      key: 'unit',
      title: 'Ед. изм.',
      width: '100px',
      render: (item: InventoryItem) => item.unit,
    },
    {
      key: 'actions',
      title: '',
      width: '200px',
      render: (item: InventoryItem) => (
        <div className="table-actions">
          <Button
            size="small"
            variant="primary"
            onClick={(e) => {
              e.stopPropagation();
              setModal({ type: 'income', item });
            }}
          >
            + Приход
          </Button>
          <Button
            size="small"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              setModal({ type: 'expense', item });
            }}
            disabled={item.quantity === 0}
          >
            Списать
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="page inventory-page">
      <header className="page-header">
        <div>
          <h1>Склад</h1>
          <p className="page-subtitle">Управление материалами и медикаментами</p>
        </div>
        <Button onClick={() => navigate('/inventory/new')}>
          + Добавить позицию
        </Button>
      </header>

      {stats && stats.lowStockCount > 0 && (
        <div className="warning-banner">
          <AlertTriangleIcon size={20} />
          <span>
            Внимание! У <strong>{stats.lowStockCount}</strong> позиций низкий уровень запасов.
          </span>
        </div>
      )}

      <div className="inventory-controls">
        <div className="search-bar">
          <SearchIcon size={20} />
          <input
            type="text"
            placeholder="Поиск по наименованию..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="inventory-filters">
          <Select
            options={typeOptions}
            value={filters.type || ''}
            onChange={(e) => handleTypeChange(e.target.value as InventoryType | '')}
          />
          <Button
            variant={filters.lowStock ? 'primary' : 'secondary'}
            onClick={toggleLowStock}
          >
            Заканчивающиеся ({stats?.lowStockCount || 0})
          </Button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="card">
        <h3 className="section-title">Материалы ({pagination.total})</h3>

        <Table
          columns={columns}
          data={items}
          keyField="id"
          isLoading={isLoading}
          emptyMessage="Позиции не найдены"
          onRowClick={(item) => navigate(`/inventory/${item.id}`)}
        />
      </section>

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={handlePageChange}
      />

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              {modal.type === 'income' ? 'Приход' : 'Списание'}: {modal.item.name}
            </h3>

            <div className="modal-body">
              <p>
                Текущий остаток: <strong>{modal.item.quantity} {modal.item.unit}</strong>
              </p>

              <Input
                type="number"
                label="Количество"
                value={modalQuantity}
                onChange={(e) => setModalQuantity(parseInt(e.target.value) || 0)}
                min={1}
                max={modal.type === 'expense' ? modal.item.quantity : undefined}
              />

              <Input
                type="text"
                label="Причина (необязательно)"
                placeholder="Укажите причину..."
                value={modalReason}
                onChange={(e) => setModalReason(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setModal(null)}>
                Отмена
              </Button>
              <Button
                variant={modal.type === 'income' ? 'primary' : 'danger'}
                onClick={handleModalSubmit}
                disabled={modalQuantity < 1}
              >
                {modal.type === 'income' ? 'Оприходовать' : 'Списать'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
