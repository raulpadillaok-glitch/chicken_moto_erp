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
    padding: '0.75rem 1rem',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#f8fafc',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer'
  },
  footer: {
    display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem'
  },
  btn: {
    padding: '0.75rem 1.5rem', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 'bold'
  }
};

export default function ProductModal({ isOpen, onClose, product, onSaveSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    supplier: '',
    stock: 0,
    min_stock: 0,
    sale_price: '',
    description: ''
  });
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar catálogos y setear datos si es modo edición
  useEffect(() => {
    if (!isOpen) return;

    const fetchDropdowns = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const [catsRes, suppRes] = await Promise.all([
          axios.get('http://localhost:8000/api/v1/inventory/categories/', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:8000/api/v1/inventory/suppliers/', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setCategories(catsRes.data);
        setSuppliers(suppRes.data);
      } catch (err) {
        console.error("Error fetching categories or suppliers", err);
      }
    };
    
    fetchDropdowns();

    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        category: product.category || '',
        supplier: product.supplier || '',
        stock: product.stock,
        min_stock: product.min_stock,
        sale_price: product.sale_price,
        description: product.description || ''
      });
    } else {
      setFormData({
        name: '', sku: '', category: '', supplier: '', stock: 0, min_stock: 5, sale_price: '', description: ''
      });
    }
  }, [isOpen, product]);

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
      if (product) {
        // Edit mode
        res = await axios.put(`http://localhost:8000/api/v1/inventory/products/${product.id}/`, formData, { headers });
      } else {
        // Create mode
        res = await axios.post('http://localhost:8000/api/v1/inventory/products/', formData, { headers });
      }
      
      onSaveSuccess(res.data, product ? 'edit' : 'add');
      onClose();
    } catch (err) {
      if (err.response && err.response.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError('Error al guardar producto.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" style={styles.overlay}>
      <form className="glass-card" style={styles.modal} onSubmit={handleSubmit}>
        <div style={styles.header}>
          <h2>{product ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button type="button" onClick={onClose} style={styles.closeBtn}><X /></button>
        </div>
        
        {error && (
          <div className="error-state" style={{ padding: '1rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <div style={styles.grid}>
          <div style={styles.inputGroup}>
            <label>Nombre del Repuesto/Producto *</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Ej. Filtro de Aceite" />
          </div>
          <div style={styles.inputGroup}>
            <label>SKU (Código Interno) *</label>
            <input type="text" name="sku" required value={formData.sku} onChange={handleChange} placeholder="Ej. FLT-001" />
          </div>
          <div style={styles.inputGroup}>
            <label>Categoría *</label>
            <select name="category" required value={formData.category} onChange={handleChange} style={styles.select}>
              <option value="">Seleccione Categoría</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={styles.inputGroup}>
            <label>Proveedor</label>
            <select name="supplier" value={formData.supplier} onChange={handleChange} style={styles.select}>
              <option value="">Seleccione Proveedor</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.business_name}</option>)}
            </select>
          </div>
          <div style={styles.inputGroup}>
            <label>Stock Físico</label>
            <input type="number" name="stock" required value={formData.stock} onChange={handleChange} min="0" />
          </div>
          <div style={styles.inputGroup}>
            <label>Stock Mínimo (Alerta)</label>
            <input type="number" name="min_stock" required value={formData.min_stock} onChange={handleChange} min="0" />
          </div>
          <div style={styles.inputGroup}>
            <label>Precio de Venta (Bs.) *</label>
            <input type="number" step="0.01" name="sale_price" required value={formData.sale_price} onChange={handleChange} />
          </div>
          <div style={styles.inputGroup} className="full-width">
            <label>Descripción técnica</label>
            <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Información extra" />
          </div>
        </div>

        <div style={styles.footer}>
          <button type="button" onClick={onClose} style={{ ...styles.btn, background: 'rgba(255,255,255,0.1)' }}>Cancelar</button>
          <button type="submit" disabled={loading} className="btn-primary" style={{ ...styles.btn, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Save size={18} /> {loading ? 'Guardando...' : 'Guardar Producto'}
          </button>
        </div>
      </form>
    </div>
  );
}
