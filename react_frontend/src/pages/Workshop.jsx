import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wrench, Search, Plus, AlertCircle, Clock, Edit2, Trash2 } from 'lucide-react';
import OrderModal from '../components/OrderModal';

export default function Workshop() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://localhost:8000/api/v1/workshop/orders/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar órdenes de trabajo.');
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(o => {
    const term = searchTerm.toLowerCase();
    return o.code.toLowerCase().includes(term) || (o.motorcycle_plate && o.motorcycle_plate.toLowerCase().includes(term));
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span className="badge" style={{ background: 'rgba(255, 170, 0, 0.2)', color: '#ffaa00' }}>Pendiente</span>;
      case 'diagnosing': return <span className="badge" style={{ background: 'rgba(123, 97, 255, 0.2)', color: '#7b61ff' }}>Diagnosticando</span>;
      case 'waiting_parts': return <span className="badge" style={{ background: 'rgba(255, 107, 53, 0.2)', color: '#ff6b35' }}>En Espera</span>;
      case 'in_process': return <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>En Proceso</span>;
      case 'finished': return <span className="badge badge-success">Finalizado</span>;
      case 'delivered': return <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#a1a1aa' }}>Entregado</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const openModal = (order = null) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleSaveSuccess = (savedOrder, action) => {
    if (action === 'add') {
      setOrders([savedOrder, ...orders]);
    } else {
      setOrders(orders.map(o => o.id === savedOrder.id ? savedOrder : o));
    }
  };

  const handleDelete = async (id, code) => {
    if (window.confirm(`¿Estás seguro de eliminar permanentemente la orden #${code}?`)) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.delete(`http://localhost:8000/api/v1/workshop/orders/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(orders.filter(o => o.id !== id));
      } catch (err) {
        alert("Error al eliminar la orden de trabajo.");
      }
    }
  };

  return (
    <>
      <div className="animate-fade-in">
        <header className="page-header">
          <div>
            <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wrench /> Taller Mecánico
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Órdenes de Trabajo y Reparaciones Activas</p>
          </div>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => openModal()}>
            <Plus size={20} /> Nueva Orden
          </button>
        </header>

        <div className="table-container">
          <div className="table-toolbar">
            <div className="search-bar">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Buscar por placa o código..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Cargando taller...</div>
          ) : error ? (
            <div className="error-state"><AlertCircle /> {error}</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Placa Moto</th>
                  <th>Técnico Asignado</th>
                  <th>Descripción / Problema</th>
                  <th>Ingreso</th>
                  <th>Estado actual</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontWeight: '600' }}>#{order.code}</td>
                    <td style={{ fontWeight: '500', color: 'var(--text-main)' }}>{order.motorcycle_plate}</td>
                    <td>{order.technician_name}</td>
                    <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {order.problem_description}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                        <Clock size={14} /> {new Date(order.entry_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => openModal(order)} style={{ background: 'transparent', padding: '0.5rem', boxShadow: 'none', color: '#60a5fa' }} title="Editar">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(order.id, order.code)} style={{ background: 'transparent', padding: '0.5rem', boxShadow: 'none', color: '#f87171' }} title="Eliminar">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="7" className="empty-state">No hay órdenes de reparación activas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <OrderModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        order={selectedOrder} 
        onSaveSuccess={handleSaveSuccess} 
      />
    </>
  );
}
