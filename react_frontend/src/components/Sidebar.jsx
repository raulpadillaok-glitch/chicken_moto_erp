import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Package, Wrench, Users, Settings, LogOut } from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    navigate('/login');
  };

  const role = localStorage.getItem('user_role') || 'client';

  const navItems = [
    { to: '/dashboard', icon: <Home size={20} />, label: 'Inicio', roles: ['admin', 'technician', 'client'] },
    { to: '/dashboard/inventory', icon: <Package size={20} />, label: 'Inventario', roles: ['admin', 'technician'] },
    { to: '/dashboard/workshop', icon: <Wrench size={20} />, label: 'Taller', roles: ['admin', 'technician'] },
    { to: '/dashboard/clients', icon: <Users size={20} />, label: 'Clientes', roles: ['admin'] },
    { to: '/dashboard/settings', icon: <Settings size={20} />, label: 'Configuración', roles: ['admin'] },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span style={{ fontSize: '1.5rem' }}>🏍️</span>
        <h2>Moto ERP</h2>
      </div>
      
      <nav className="sidebar-nav">
        {visibleItems.map((item) => (
          <NavLink 
            key={item.to} 
            to={item.to} 
            end={item.to === '/dashboard'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
