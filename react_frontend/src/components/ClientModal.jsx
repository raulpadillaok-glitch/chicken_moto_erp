import React, { useState } from 'react';
import axios from 'axios';
import { X, Save, AlertCircle } from 'lucide-react';

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
  },
  modal: {
    width: '100%', maxWidth: '600px',
    padding: '2rem', margin: '1rem',
    display: 'flex', flexDirection: 'column'
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem'
  },
  closeBtn: {
    background: 'transparent', padding: '0.5rem', margin: 0, boxShadow: 'none'
  },
  grid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'
  },
  inputGroup: {
    display: 'flex', flexDirection: 'column', gap: '0.5rem'
  },
  footer: {
    display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem'
  },
  btn: {
    padding: '0.75rem 1.5rem'
  }
};

export default function ClientModal({ isOpen, onClose, client, onSaveSuccess }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    ci_nit: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (client && client.person_details) {
      setFormData({
        first_name: client.person_details.first_name || '',
        last_name: client.person_details.last_name || '',
        ci_nit: client.person_details.ci_nit || '',
        phone: client.person_details.phone || '',
        address: client.person_details.address || ''
      });
    } else {
      setFormData({ first_name: '', last_name: '', ci_nit: '', phone: '', address: '' });
    }
  }, [client, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      let response;
      if (client) {
        response = await axios.put(`http://localhost:8000/api/v1/accounts/clients/${client.id}/`, formData, { headers });
        onSaveSuccess(response.data, 'edit');
      } else {
        response = await axios.post('http://localhost:8000/api/v1/accounts/clients/', formData, { headers });
        onSaveSuccess(response.data, 'add');
      }
      onClose();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Ocurrió un problema guardando los datos en el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" style={styles.overlay}>
      <form className="glass-card" style={styles.modal} onSubmit={handleSubmit}>
        <div style={styles.header}>
          <h2>{client ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}</h2>
          <button type="button" onClick={onClose} style={styles.closeBtn}><X /></button>
        </div>
        
        {error && (
          <div className="error-state" style={{ padding: '1rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <div style={styles.grid}>
          <div style={styles.inputGroup}>
            <label>Nombres *</label>
            <input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} placeholder="Ej. Juan" />
          </div>
          <div style={styles.inputGroup}>
            <label>Apellidos *</label>
            <input type="text" name="last_name" required value={formData.last_name} onChange={handleChange} placeholder="Ej. Perez" />
          </div>
          <div style={styles.inputGroup}>
            <label>CI / NIT</label>
            <input type="text" name="ci_nit" value={formData.ci_nit} onChange={handleChange} placeholder="Ej. 10002020" />
          </div>
          <div style={styles.inputGroup}>
            <label>Teléfono</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Ej. 75000000" />
          </div>
          <div style={styles.inputGroup} className="full-width">
            <label>Dirección</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Ej. Av. Blanco Galindo Km 4" />
          </div>
        </div>

        <div style={styles.footer}>
          <button type="button" onClick={onClose} style={{ ...styles.btn, background: 'rgba(255,255,255,0.1)' }}>Cancelar</button>
          <button type="submit" disabled={loading} className="btn-primary" style={{ ...styles.btn, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Save size={18} /> {loading ? 'Procesando...' : 'Guardar Datos'}
          </button>
        </div>
      </form>
    </div>
  );
}
