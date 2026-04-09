import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wrench, Package, TrendingUp, AlertCircle, Loader } from 'lucide-react';

export default function DashboardHome() {
  const role = localStorage.getItem('user_role') || 'Usuario';
  const token = localStorage.getItem('access_token');
  
  const [stats, setStats] = useState({
    active_repairs: 0,
    total_stock: 0,
    low_stock_alerts: 0,
    monthly_income: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/v1/dashboard/stats/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (err) {
        setError('Error al sincronizar estadísticas con la base de datos.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [token]);
  
  return (
    <div className="animate-fade-in premium-dashboard">
      <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <div className="header-info">
          <h1 style={{ fontSize: '2rem' }} className="gradient-text">Resumen General</h1>
          <p style={{ color: 'var(--text-muted)' }}>Bienvenido de nuevo. Nivel de acceso: <strong style={{color: 'var(--primary-color)'}}>{role.toUpperCase()}</strong></p>
        </div>
      </header>

      {error && (
        <div className="error-state glass-card" style={{ marginBottom: '2rem' }}>
          <AlertCircle /> {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state glass-card" style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Loader className="spinner" size={32} style={{ color: 'var(--primary-color)', animation: 'spin 1s linear infinite' }} />
          <p>Conectando a la base de datos...</p>
        </div>
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-card premium-card">
            <div className="card-header">
              <h3>Reparaciones Activas</h3>
              <div className="icon-wrapper bg-blue"><Wrench className="card-icon" /></div>
            </div>
            <p className="card-number glow-text">{stats.active_repairs}</p>
            <span className="card-stats neutral">En taller dinámico</span>
          </div>

          <div className="dashboard-card premium-card">
            <div className="card-header">
              <h3>Productos en Stock</h3>
              <div className="icon-wrapper bg-green"><Package className="card-icon" /></div>
            </div>
            <p className="card-number glow-text">{stats.total_stock}</p>
            <span className="card-stats positive">Suma total inventario</span>
          </div>

          <div className="dashboard-card premium-card alert-card">
            <div className="card-header">
              <h3 style={{ color: '#ef4444' }}>Alertas de Stock</h3>
              <div className="icon-wrapper bg-red"><AlertCircle className="card-icon" style={{ color: '#ef4444' }} /></div>
            </div>
            <p className="card-number glow-text-red">{stats.low_stock_alerts}</p>
            <span className="card-stats negative">Productos bajo mínimo</span>
          </div>

          <div className="dashboard-card premium-card">
            <div className="card-header">
              <h3>Ingresos (Mes)</h3>
              <div className="icon-wrapper bg-gold"><TrendingUp className="card-icon" /></div>
            </div>
            <p className="card-number gradient-text">Bs. {parseFloat(stats.monthly_income).toLocaleString('es-BO')}</p>
            <span className="card-stats positive">Suma de cotizaciones aprobadas</span>
          </div>
        </div>
      )}
    </div>
  );
}
