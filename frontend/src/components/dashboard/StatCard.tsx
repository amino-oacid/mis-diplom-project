import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}

/**
 * Компонент карточки статистики для дашборда
 */
export const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-content">
        <span className="stat-card-label">{title}</span>
        <span className="stat-card-value">{value}</span>
      </div>
      <div className="stat-card-icon">{icon}</div>
    </div>
  );
};

export default StatCard;
