import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LogoIcon,
  GridIcon,
  UsersIcon,
  CalendarIcon,
  ClipboardIcon,
  BoxIcon,
  ChartIcon,
  UserIcon,
  LogoutIcon,
} from '../icons';
import '../../styles/layout.css';

/**
 * Тип для пункта навигации
 */
interface NavItem {
  path: string;       // URL маршрута
  label: string;      // Текст в меню
  icon: React.ReactNode; // Иконка (SVG компонент)
  roles?: string[];   // Разрешённые роли (если не указано — все)
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Главная', icon: <GridIcon /> },
  { path: '/patients', label: 'Пациенты', icon: <UsersIcon /> },
  { path: '/appointments', label: 'Приёмы', icon: <CalendarIcon /> },
  { path: '/schedule', label: 'Расписание', icon: <ClipboardIcon /> },
  { path: '/inventory', label: 'Склад', icon: <BoxIcon />, roles: ['admin'] },
  { path: '/reports', label: 'Отчёты', icon: <ChartIcon />, roles: ['admin'] },
];

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'doctor':
        return 'Врач';
      default:
        return 'Неизвестная роль';
    }
  };

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  });

  return (
    <div className="main-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <LogoIcon className="logo-icon" size={40} />
          <div className="logo-text">
            <span className="logo-title">МедКлиника</span>
            <span className="logo-subtitle">Система управления</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/profile" className="user-profile-link">
            <div className="user-avatar">
              <UserIcon size={20} />
            </div>
            <div className="user-info">
              <span className="user-name">{user?.fullName || 'Пользователь'}</span>
              <span className="user-role">{getRoleLabel(user?.role)}</span>
            </div>
          </NavLink>
          <button className="logout-btn" onClick={handleLogout}>
            <LogoutIcon size={20} />
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
