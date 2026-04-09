import React, { useState, useEffect } from 'react';
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
    width: '100%', maxWidth: '700px',
    padding: '2rem', margin: '1rem',
    display: 'flex', flexDirection: 'column'
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem'
  },
  closeBtn: {
    background: 'transparent', padding: '0.5rem', margin: 0, boxShadow: 'none', color: '#fff', cursor: 'pointer'
  },
  grid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'
  },
  inputGroup: {
    display: 'flex', flexDirection: 'column', gap: '0.5rem'
  },
  select: {
    padding: '0.75rem 1rem', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#f8fafc', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer'
  },
  input: {
    padding: '0.75rem 1rem', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#f8fafc', borderRadius: '8px', fontSize: '1rem'
  },
  textarea: {
    padding: '0.75rem 1rem', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#f8fafc', borderRadius: '8px', fontSize: '1rem', resize: 'vertical'
  },
  footer: {
    display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem'
  },
  btn: {
    padding: '0.75rem 1.5rem', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 'bold'
  }
};

export default function OrderModal({ isOpen, onClose, order, onSaveSuccess }) {
  const [formData, setFormData] = useState({
    code: '',
    motorcycle: '',
    technician: '',
    status: 'pending',
    problem_description: '',
    entry_at: ''
  });
  const [motorcycles, setMotorcycles] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchDropdowns = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const [motosRes, techRes] = await Promise.all([
          axios.get('http://localhost:8000/api/v1/workshop/motorcycles/', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:8000/api/v1/accounts/technicians/', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setMotorcycles(motosRes.data);
        setTechnicians(techRes.data);
      } catch (err) {
        console.error("Error fetching dropdowns for Order", err);
      }
    };
    fetchDropdowns();

    if (order) {
      setFormData({
        code: order.code,
        motorcycle: order.motorcycle || '',
        technician: order.technician || '',
        status: order.status,
        problem_description: order.problem_description,
        entry_at: new Date(order.entry_at).toISOString().slice(0, 16)
      });
    } else {
      const randomCode = `ORD-${Math.floor(Math.random() * 10000)}`;
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setFormData({
        code: randomCode, motorcycle: '', technician: '', status: 'pending', problem_description: '', entry_at: now.toISOString().slice(0,16)
      });
    }
  }, [isOpen, order]);

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
      
      let res;
      if (order) {
        res = await axios.put(`http://localhost:8000/api/v1/workshop/orders/${order.id}/`, formData, { headers });
      } else {
        res = await axios.post('http://localhost:8000/api/v1/workshop/orders/', formData, { headers });
      }
      
      onSaveSuccess(res.data, order ? 'edit' : 'add');
      onClose();
    } catch (err) {
      if (err.response && err.response.data) {
        setError("Verifica que no exista un código duplicado y envía todos los datos requeridos.");
      } else {
        setError('Error de comunicación con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" style={styles.overlay}>
      <form className="glass-card" style={styles.modal} onSubmit={handleSubmit}>
        <div style={styles.header}>
          <h2>{order ? 'Editar Orden Taller' : 'Nueva Orden Taller'}</h2>
          <button type="button" onClick={onClose} style={styles.closeBtn}><X /></button>
        </div>
        
        {error && (
          <div className="error-state" style={{ padding: '1rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <div style={styles.grid}>
          <div style={styles.inputGroup}>
            <label>Código de Orden *</label>
            <input type="text" name="code" required value={formData.code} onChange={handleChange} placeholder="Ej. ORD-1020" />
          </div>
          <div style={styles.inputGroup}>
            <label>Fecha de Ingreso *</label>
            <input type="datetime-local" name="entry_at" required value={formData.entry_at} onChange={handleChange} style={styles.input} />
          </div>
          
          <div style={styles.inputGroup}>
            <label>Motocicleta *</label>
            <select name="motorcycle" required value={formData.motorcycle} onChange={handleChange} style={styles.select}>
              <option value="">Seleccionar Moto</option>
              {motorcycles.map(m => <option key={m.id} value={m.id}>{m.plate} - {m.brand}</option>)}
            </select>
          </div>
          <div style={styles.inputGroup}>
            <label>Mecánico Asignado *</label>
            <select name="technician" required value={formData.technician} onChange={handleChange} style={styles.select}>
              <option value="">Asignar Técnico</option>
              {technicians.map(t => {
                 if(!t.person_details) return null;
                 return <option key={t.id} value={t.id}>{t.person_details.first_name} {t.person_details.last_name}</option>
              })}
            </select>
          </div>

          <div style={styles.inputGroup} className="full-width">
            <label>Descripción del Problema *</label>
            <textarea name="problem_description" required value={formData.problem_description} onChange={handleChange} placeholder="Describa el motivo de ingreso al taller..." rows={3} style={styles.textarea} />
          </div>

          <div style={styles.inputGroup} className="full-width">
            <label>Estado de Reparación</label>
            <select name="status" value={formData.status} onChange={handleChange} style={styles.select}>
              <option value="pending">Pendiente</option>
              <option value="diagnosing">Diagnosticando</option>
              <option value="waiting_parts">Esperando Repuestos</option>
              <option value="in_process">En Proceso</option>
              <option value="finished">Finalizado</option>
              <option value="delivered">Entregado</option>
            </select>
          </div>
        </div>

        <div style={styles.footer}>
          <button type="button" onClick={onClose} style={{ ...styles.btn, background: 'rgba(255,255,255,0.1)' }}>Cancelar</button>
          <button type="submit" disabled={loading} className="btn-primary" style={{ ...styles.btn, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Save size={18} /> {loading ? 'Guardando...' : 'Guardar Orden'}
          </button>
        </div>
      </form>
    </div>
  );
}
