import React, { useState, useEffect } from 'react';
import { Package, Calendar, Search, Filter, RefreshCw } from 'lucide-react';
import axios from 'axios';

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [uniqueUserIds, setUniqueUserIds] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, userIdFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/products');
      const productsData = response.data.products || [];
      setProducts(productsData);
      
      // Extraer IDs de usuario únicos para el filtro
      const userIds = [...new Set(productsData.map(p => p.user_id))];
      setUniqueUserIds(userIds);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por ID de usuario
    if (userIdFilter) {
      filtered = filtered.filter(product => product.user_id === userIdFilter);
    }

    setFilteredProducts(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setUserIdFilter('');
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Catálogo de Productos</h1>
        <p className="page-subtitle">
          Explora todos los productos disponibles en el sistema
        </p>
      </div>

      {/* Controles y filtros */}
      <div className="content-card mb-6">
        <div className="card-content">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Búsqueda por nombre */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Buscar por nombre de producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                />
              </div>

              {/* Filtro por usuario */}
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <select
                  value={userIdFilter}
                  onChange={(e) => setUserIdFilter(e.target.value)}
                  className="form-input pl-10"
                >
                  <option value="">Todos los usuarios</option>
                  {uniqueUserIds.map(userId => (
                    <option key={userId} value={userId}>{userId}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              {(searchTerm || userIdFilter) && (
                <button
                  onClick={clearFilters}
                  className="btn btn-secondary"
                >
                  <Filter size={16} />
                  Limpiar Filtros
                </button>
              )}
              <button
                onClick={fetchProducts}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <div className="spinner" />
                ) : (
                  <RefreshCw size={16} />
                )}
                Actualizar
              </button>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{products.length}</div>
                <div className="text-sm text-blue-800">Total de Productos</div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{uniqueUserIds.length}</div>
                <div className="text-sm text-green-800">Usuarios Activos</div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{filteredProducts.length}</div>
                <div className="text-sm text-purple-800">Productos Mostrados</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de productos */}
      <div className="content-card">
        <div className="card-content">
          {loading ? (
            <div className="loading-container">
              <div className="spinner" style={{ width: '40px', height: '40px' }} />
              <p className="loading-text">Cargando productos del catálogo...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card">
                  <img
                    src={`/product-image/${product.id}`}
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDI4MCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMTAgODBIMTcwVjEyMEgxMTBWODBaIiBmaWxsPSIjRDFENURCIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iMTM1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QkEwIiBmb250LXNpemU9IjEyIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD4KPC9zdmc+';
                    }}
                  />
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-user">
                      <Package size={14} />
                      <span>{product.user_id}</span>
                    </div>
                    <div className="product-date">
                      <Calendar size={12} className="inline mr-1" />
                      {formatDate(product.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Package className="empty-state-icon" />
              <h3 className="empty-state-title">
                {products.length === 0 ? 'No hay productos en el catálogo' : 'No se encontraron productos'}
              </h3>
              <p className="empty-state-description">
                {products.length === 0 
                  ? 'Comienza subiendo tu primer producto al catálogo'
                  : 'Intenta ajustar los filtros de búsqueda'
                }
              </p>
              {products.length === 0 && (
                <div className="mt-4">
                  <a href="/upload" className="btn btn-primary">
                    <Package size={16} />
                    Subir Primer Producto
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;
