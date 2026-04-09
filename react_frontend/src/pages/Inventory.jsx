import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Search, Plus, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import ProductModal from '../components/ProductModal';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://localhost:8000/api/v1/inventory/products/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar el inventario. Verifica tu conexión.');
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (product = null) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveSuccess = (savedProduct, action) => {
    if (action === 'add') {
      setProducts([savedProduct, ...products]);
    } else {
      setProducts(products.map(p => p.id === savedProduct.id ? savedProduct : p));
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`¿Estás seguro de eliminar el producto ${name}?`)) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.delete(`http://localhost:8000/api/v1/inventory/products/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(products.filter(p => p.id !== id));
      } catch (err) {
        alert("Error al eliminar. Revisa la consola.");
      }
    }
  };

  return (
    <>
      <div className="animate-fade-in">
        <header className="page-header">
          <div>
            <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package /> Inventario
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Gestión de repuestos y productos</p>
          </div>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => openModal()}>
            <Plus size={20} /> Nuevo Producto
          </button>
        </header>

        <div className="table-container">
          <div className="table-toolbar">
            <div className="search-bar">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Buscar por nombre o SKU..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Cargando productos...</div>
          ) : error ? (
            <div className="error-state"><AlertCircle /> {error}</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Proveedor</th>
                  <th>Stock</th>
                  <th>Precio Venta</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{product.sku}</td>
                    <td style={{ fontWeight: '500' }}>{product.name}</td>
                    <td>{product.category_name}</td>
                    <td>{product.supplier_name}</td>
                    <td>
                      {product.stock}
                    </td>
                    <td>Bs. {product.sale_price}</td>
                    <td>
                      {product.stock <= product.min_stock ? (
                        <span className="badge badge-danger">Bajo</span>
                      ) : (
                        <span className="badge badge-success">Óptimo</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => openModal(product)} style={{ background: 'transparent', padding: '0.5rem', boxShadow: 'none', color: '#60a5fa' }} title="Editar">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(product.id, product.name)} style={{ background: 'transparent', padding: '0.5rem', boxShadow: 'none', color: '#f87171' }} title="Eliminar">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="8" className="empty-state">No se encontraron productos.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={selectedProduct} 
        onSaveSuccess={handleSaveSuccess} 
      />
    </>
  );
}
