import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, AlertCircle } from 'lucide-react';

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
  },
  modal: {
    width: '100%', maxWidth: '500px', padding: '2rem', margin: '1rem', display: 'flex', flexDirection: 'column'
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem'
  },
  closeBtn: { background: 'transparent', padding: '0.5rem', margin: 0, boxShadow: 'none', color: '#fff', cursor: 'pointer', border: 'none' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  input: {
    padding: '0.75rem 1rem', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#f8fafc', borderRadius: '8px', fontSize: '1rem'
  },
  footer: { display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' },
  btn: { padding: '0.75rem 1.5rem', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }
};

export default function MotorcycleModal({ isOpen, onClose, clientId, clientName }) {
  const [formData, setFormData] = useState({
    plate: '', brand: '', model_name: '', color: '', year: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({ plate: '', brand: '', model_name: '', color: '', year: '' });
      setError(null);
    }
  }, [isOpen]);

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
      // Post to motorcycles endpoint tying it to the specific client
      await axios.post('http://localhost:8000/api/v1/workshop/motorcycles/', {
        ...formData,
        client: clientId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Motocicleta registrada exitosamente para ' + clientName);
      onClose();
    } catch (err) {
      if (err.response && err.response.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError('Ocurrió un error guardando la motocicleta.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" style={styles.overlay}>
      <form className="glass-card" style={styles.modal} onSubmit={handleSubmit}>
        <div style={styles.header}>
          <h2>Añadir Moto para {clientName}</h2>
          <button type="button" onClick={onClose} style={styles.closeBtn}><X /></button>
        </div>
        
        {error && (
          <div className="error-state" style={{ padding: '1rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
            <AlertCircle size={18} /> Revisa la información (la placa debe ser única).
          </div>
        )}

        <div style={styles.grid}>
          <div style={styles.inputGroup} className="full-width">
            <label>Placa *</label>
            <input type="text" name="plate" required value={formData.plate} onChange={handleChange} placeholder="Ej. 1234ABC" style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label>Marca *</label>
            <input type="text" name="brand" required value={formData.brand} onChange={handleChange} placeholder="Ej. Honda" style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label>Modelo *</label>
            <input type="text" name="model_name" required value={formData.model_name} onChange={handleChange} placeholder="Ej. CBR 500" style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label>Color</label>
            <input type="text" name="color" value={formData.color} onChange={handleChange} placeholder="Ej. Rojo" style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label>Año</label>
            <input type="number" name="year" value={formData.year} onChange={handleChange} placeholder="Ej. 2023" style={styles.input} />
          </div>
        </div>

        <div style={styles.footer}>
          <button type="button" onClick={onClose} style={{ ...styles.btn, background: 'rgba(255,255,255,0.1)' }}>Cancelar</button>
          <button type="submit" disabled={loading} className="btn-primary" style={{ ...styles.btn, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Save size={18} /> {loading ? 'Guardando...' : 'Registrar Moto'}
          </button>
        </div>
      </form>
    </div>
  );
}
