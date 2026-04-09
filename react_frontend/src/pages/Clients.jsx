import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Search, Plus, AlertCircle, Phone, MapPin, Edit2, Trash2, Bike } from 'lucide-react';
import ClientModal from '../components/ClientModal';
import MotorcycleModal from '../components/MotorcycleModal';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isMotoModalOpen, setIsMotoModalOpen] = useState(false);
  const [motoClientId, setMotoClientId] = useState(null);
  const [motoClientName, setMotoClientName] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://localhost:8000/api/v1/accounts/clients/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClients(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar la lista de clientes.');
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const filteredClients = clients.filter(c => {
    if (!c.person_details) return false;
    const fullName = `${c.person_details.first_name || ''} ${c.person_details.last_name || ''}`;
    return fullName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const openModal = (client = null) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const openMotoModal = (id, name) => {
    setMotoClientId(id);
    setMotoClientName(name);
    setIsMotoModalOpen(true);
  };

  const handleSaveSuccess = (savedClient, action) => {
    if (action === 'add') {
      setClients([savedClient, ...clients]);
    } else {
      setClients(clients.map(c => c.id === savedClient.id ? savedClient : c));
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`¿Estás seguro de eliminar el cliente ${name} permanentemente?`)) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.delete(`http://localhost:8000/api/v1/accounts/clients/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClients(clients.filter(c => c.id !== id));
      } catch (err) {
        alert("Error al eliminar cliente. Puede estar asociado a otro registro.");
      }
    }
  };

  return (
    <>
      <div className="animate-fade-in">
        <header className="page-header">
          <div>
            <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users /> Clientes
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Gestión de datos de clientes y programas de fidelización</p>
          </div>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => openModal()}>
            <Plus size={20} /> Nuevo Cliente
          </button>
        </header>
        
        <div className="table-container">
          <div className="table-toolbar">
            <div className="search-bar">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Buscar cliente por nombre..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Cargando base de datos de clientes...</div>
          ) : error ? (
            <div className="error-state"><AlertCircle /> {error}</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre Completo</th>
                  <th>Datos de Contacto</th>
                  <th>Dirección</th>
                  <th>Puntos de Fidelidad</th>
                  <th>Antigüedad</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map(client => {
                  if (!client.person_details) return null;
                  const firstInitial = client.person_details.first_name ? client.person_details.first_name.charAt(0) : '?';
                  return (
                  <tr key={client.id}>
                    <td style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
                        {firstInitial}
                      </div>
                      {client.person_details.first_name} {client.person_details.last_name}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                        <Phone size={14} /> {client.person_details.phone || 'Sin registrar'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                        <MapPin size={14} /> {client.person_details.address || 'Sin registrar'}
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: 'rgba(255, 107, 53, 0.2)', color: 'var(--primary-color)' }}>
                        {client.loyalty_points} Ptos
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {new Date(client.created_at).getFullYear()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => openMotoModal(client.id, client.person_details.first_name)} style={{ background: 'transparent', padding: '0.5rem', boxShadow: 'none', color: '#10b981' }} title="Añadir Moto a Cliente">
                        <Bike size={18} />
                      </button>
                      <button onClick={() => openModal(client)} style={{ background: 'transparent', padding: '0.5rem', boxShadow: 'none', color: '#60a5fa' }} title="Editar">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(client.id, client.person_details.first_name)} style={{ background: 'transparent', padding: '0.5rem', boxShadow: 'none', color: '#f87171' }} title="Eliminar">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                )})}
                {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-state">No hay clientes registrados en la base de datos.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODALS RENDERED OUTSIDE THE ANIMATED CONTAINER TO PREVENT STACKING CONTEXT BUGS */}
      <ClientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        client={selectedClient} 
        onSaveSuccess={handleSaveSuccess} 
      />

      <MotorcycleModal 
        isOpen={isMotoModalOpen} 
        onClose={() => setIsMotoModalOpen(false)} 
        clientId={motoClientId} 
        clientName={motoClientName} 
      />
    </>
  );
}
