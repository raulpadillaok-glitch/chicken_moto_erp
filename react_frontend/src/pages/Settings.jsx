import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings as SettingsIcon, Users, Truck, Tags, Plus, Trash2, Edit2, Save, X } from 'lucide-react';

const btnStyle = { background: 'transparent', padding: '0.5rem', boxShadow: 'none', cursor: 'pointer', border: 'none' };
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
  input: {
    padding: '0.75rem 1rem', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#f8fafc', borderRadius: '8px', fontSize: '1rem'
  },
  footer: { display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem' },
  btn: { padding: '0.75rem 1.5rem', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  
  // Modal States
  const [modalData, setModalData] = useState(null); // stores object to edit or empty obj to create
  const [modalType, setModalType] = useState(null); // 'category', 'supplier', 'technician'
  
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (activeTab === 'categories') {
        const res = await axios.get('http://localhost:8000/api/v1/inventory/categories/', { headers });
        setCategories(res.data);
      } else if (activeTab === 'suppliers') {
        const res = await axios.get('http://localhost:8000/api/v1/inventory/suppliers/', { headers });
        setSuppliers(res.data);
      } else if (activeTab === 'technicians') {
        const res = await axios.get('http://localhost:8000/api/v1/accounts/technicians/', { headers });
        setTechnicians(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    if (item) {
      if (type === 'technician') {
        setModalData({
          id: item.id,
          first_name: item.person_details?.first_name || '', last_name: item.person_details?.last_name || '',
          phone: item.person_details?.phone || '', specialty: item.specialty || ''
        });
      } else {
        setModalData({ ...item });
      }
    } else {
      if (type === 'category') setModalData({ name: '', description: '' });
      if (type === 'supplier') setModalData({ business_name: '', contact_name: '', phone: '' });
      if (type === 'technician') setModalData({ first_name: '', last_name: '', phone: '', specialty: '' });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setModalData(null);
  };

  const handleModalChange = (e) => {
    setModalData({ ...modalData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${token}` };
      let endpoint = '';
      if (modalType === 'category') endpoint = 'http://localhost:8000/api/v1/inventory/categories/';
      if (modalType === 'supplier') endpoint = 'http://localhost:8000/api/v1/inventory/suppliers/';
      if (modalType === 'technician') endpoint = 'http://localhost:8000/api/v1/accounts/technicians/';

      if (modalData.id) {
        await axios.put(`${endpoint}${modalData.id}/`, modalData, { headers });
      } else {
        await axios.post(endpoint, modalData, { headers });
      }
      closeModal();
      fetchData();
    } catch (error) {
      alert("Error al guardar el registro.");
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm("¿Seguro que deseas eliminar este registro? Puede fallar si está en uso.")) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      let endpoint = '';
      if (type === 'category') endpoint = 'http://localhost:8000/api/v1/inventory/categories/';
      if (type === 'supplier') endpoint = 'http://localhost:8000/api/v1/inventory/suppliers/';
      if (type === 'technician') endpoint = 'http://localhost:8000/api/v1/accounts/technicians/';

      await axios.delete(`${endpoint}${id}/`, { headers });
      fetchData();
    } catch (error) {
      alert("No se pudo eliminar. Es posible que existan productos u órdenes vinculadas a este registro.");
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 1rem' }}>
      <header className="page-header" style={{ marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SettingsIcon /> Configuración Global
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Catálogos secundarios y personal del sistema</p>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <button className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
          <Tags size={18}/> Categorías de Repuestos
        </button>
        <button className={`tab-btn ${activeTab === 'suppliers' ? 'active' : ''}`} onClick={() => setActiveTab('suppliers')}>
          <Truck size={18}/> Proveedores
        </button>
        <button className={`tab-btn ${activeTab === 'technicians' ? 'active' : ''}`} onClick={() => setActiveTab('technicians')}>
          <Users size={18}/> Catálogo de Técnicos
        </button>
      </div>

      <div className="table-container">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button className="btn-primary" onClick={() => openModal(activeTab.slice(0, -1))} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Plus size={18} /> Agregar {activeTab === 'categories' ? 'Categoría' : activeTab === 'suppliers' ? 'Proveedor' : 'Técnico'}
          </button>
        </div>

        <table className="data-table">
          <thead>
            {activeTab === 'categories' && (
              <tr><th>Nombre</th><th>Descripción</th><th style={{ textAlign: 'right' }}>Acciones</th></tr>
            )}
            {activeTab === 'suppliers' && (
              <tr><th>Empresa</th><th>Contacto</th><th>Teléfono</th><th style={{ textAlign: 'right' }}>Acciones</th></tr>
            )}
            {activeTab === 'technicians' && (
              <tr><th>Técnico</th><th>Especialidad</th><th>Teléfono</th><th style={{ textAlign: 'right' }}>Acciones</th></tr>
            )}
          </thead>
          <tbody>
            {activeTab === 'categories' && categories.map(c => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td><td>{c.description || '-'}</td>
                <td style={{ textAlign: 'right' }}>
                  <button onClick={() => openModal('category', c)} style={btnStyle}><Edit2 size={18} color="#60a5fa"/></button>
                  <button onClick={() => handleDelete(c.id, 'category')} style={btnStyle}><Trash2 size={18} color="#f87171"/></button>
                </td>
              </tr>
            ))}
            {activeTab === 'suppliers' && suppliers.map(s => (
              <tr key={s.id}>
                <td><strong>{s.business_name}</strong></td><td>{s.contact_name || '-'}</td><td>{s.phone}</td>
                <td style={{ textAlign: 'right' }}>
                  <button onClick={() => openModal('supplier', s)} style={btnStyle}><Edit2 size={18} color="#60a5fa"/></button>
                  <button onClick={() => handleDelete(s.id, 'supplier')} style={btnStyle}><Trash2 size={18} color="#f87171"/></button>
                </td>
              </tr>
            ))}
            {activeTab === 'technicians' && technicians.map(t => (
              <tr key={t.id}>
                <td><strong>{t.person_details?.first_name} {t.person_details?.last_name}</strong></td>
                <td><span className="badge" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>{t.specialty}</span></td>
                <td>{t.person_details?.phone || '-'}</td>
                <td style={{ textAlign: 'right' }}>
                  <button onClick={() => openModal('technician', t)} style={btnStyle}><Edit2 size={18} color="#60a5fa"/></button>
                  <button onClick={() => handleDelete(t.id, 'technician')} style={btnStyle}><Trash2 size={18} color="#f87171"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalType && (
        <div className="modal-overlay animate-fade-in" style={styles.overlay}>
          <form className="glass-card" style={styles.modal} onSubmit={handleSave}>
            <div style={styles.header}>
              <h2>{modalData.id ? 'Editar' : 'Registrar'} {modalType === 'category' ? 'Categoría' : modalType === 'supplier' ? 'Proveedor' : 'Técnico'}</h2>
              <button type="button" onClick={closeModal} style={styles.closeBtn}><X /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {modalType === 'category' && (
                <>
                  <input style={styles.input} required name="name" value={modalData.name} onChange={handleModalChange} placeholder="Nombre de Categoría" />
                  <input style={styles.input} name="description" value={modalData.description} onChange={handleModalChange} placeholder="Descripción" />
                </>
              )}
              {modalType === 'supplier' && (
                <>
                  <input style={styles.input} required name="business_name" value={modalData.business_name} onChange={handleModalChange} placeholder="Nombre de la Empresa" />
                  <input style={styles.input} required name="contact_name" value={modalData.contact_name} onChange={handleModalChange} placeholder="Persona de Contacto" />
                  <input style={styles.input} name="phone" value={modalData.phone} onChange={handleModalChange} placeholder="Nº de Teléfono" />
                </>
              )}
              {modalType === 'technician' && (
                <>
                  <input style={styles.input} required name="first_name" value={modalData.first_name} onChange={handleModalChange} placeholder="Nombre del Técnico" />
                  <input style={styles.input} required name="last_name" value={modalData.last_name} onChange={handleModalChange} placeholder="Apellidos" />
                  <input style={styles.input} required name="specialty" value={modalData.specialty} onChange={handleModalChange} placeholder="Especialidad (Ej. Electricidad)" />
                  <input style={styles.input} name="phone" value={modalData.phone} onChange={handleModalChange} placeholder="Celular" />
                </>
              )}
            </div>

            <div style={styles.footer}>
              <button type="button" onClick={closeModal} style={{ ...styles.btn, background: 'rgba(255,255,255,0.1)' }}>Cancelar</button>
              <button type="submit" className="btn-primary" style={{ ...styles.btn, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Save size={18} /> Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Global CSS for Settings Tabs */}
      <style>{`
        .tab-btn {
          background: transparent; color: var(--text-muted); border: none; padding: 0.75rem 1.5rem;
          cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-weight: bold; border-bottom: 2px solid transparent;
        }
        .tab-btn:hover { color: #fff; }
        .tab-btn.active { color: var(--primary-color); border-bottom: 2px solid var(--primary-color); }
      `}</style>
    </div>
  );
}
