import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Search, Upload, Package, Calendar } from 'lucide-react';
import axios from 'axios';

const SearchProducts = () => {
  const [searchImage, setSearchImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [limit, setLimit] = useState(5);
  const [userId, setUserId] = useState('');

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSearchImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
      setSearchPerformed(false);
      setResults([]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1
  });

  const handleSearch = async () => {
    if (!searchImage) return;

    setLoading(true);
    setSearchPerformed(false);

    try {
      const formData = new FormData();
      formData.append('image', searchImage);
      formData.append('limit', limit.toString());

      let endpoint = '/search-similar';
      if (userId.trim()) {
        endpoint = '/search-similar-by-user';
        formData.append('user_id', userId.trim());
      }

      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResults(response.data.results || []);
      setSearchPerformed(true);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setResults([]);
      setSearchPerformed(true);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setSearchImage(null);
    setPreview(null);
    setResults([]);
    setSearchPerformed(false);
  };

  const formatSimilarity = (similarity) => {
    return `${(similarity * 100).toFixed(1)}%`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSimilarityColor = (similarity) => {
    if (similarity >= 0.8) return 'bg-green-500';
    if (similarity >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Buscar Productos</h1>
        <p className="page-subtitle">
          Encuentra productos similares subiendo una imagen de referencia
        </p>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">
            <Search className="inline mr-2" size={20} />
            Búsqueda por Similitud de Imagen
          </h2>
        </div>

        <div className="card-content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel de búsqueda */}
            <div>
              <div className="form-group">
                <label className="form-label">
                  <Upload className="inline mr-2" size={16} />
                  Imagen de Búsqueda
                </label>
                
                {!preview ? (
                  <div
                    {...getRootProps()}
                    className={`dropzone ${isDragActive ? 'active' : ''}`}
                  >
                    <input {...getInputProps()} />
                    <div className="dropzone-content">
                      <Search className="dropzone-icon" />
                      <p className="dropzone-text">
                        {isDragActive
                          ? 'Suelta la imagen aquí...'
                          : 'Arrastra una imagen o haz clic para buscar'
                        }
                      </p>
                      <p className="dropzone-subtext">
                        PNG, JPG, GIF hasta 10MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Imagen de búsqueda"
                      className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  ID de Usuario (Opcional)
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="form-input"
                  placeholder="Ej: user123 (dejar vacío para buscar en todos)"
                />
                <small className="text-sm text-gray-600 mt-1 block">
                  Si especificas un ID de usuario, solo buscará en sus productos
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Número de resultados
                </label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value))}
                  className="form-input"
                >
                  <option value={3}>3 resultados</option>
                  <option value={5}>5 resultados</option>
                  <option value={10}>10 resultados</option>
                  <option value={20}>20 resultados</option>
                </select>
              </div>

              <div className="text-center">
                <button
                  onClick={handleSearch}
                  disabled={!searchImage || loading}
                  className="btn btn-primary w-full"
                >
                  {loading ? (
                    <>
                      <div className="spinner" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search size={18} />
                      Buscar Productos Similares
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Panel de información */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-4 text-gray-800">
                ¿Cómo funciona la búsqueda?
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    1
                  </div>
                  <p>Sube una imagen del producto que quieres encontrar</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    2
                  </div>
                  <p>Nuestro sistema CLIP analiza las características visuales</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    3
                  </div>
                  <p>Te mostramos los productos más similares del catálogo</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-2">Consejos para mejores resultados:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Usa imágenes claras y bien iluminadas</li>
                  <li>• Enfoca el producto principal</li>
                  <li>• Evita fondos muy complejos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resultados de búsqueda */}
      {(loading || searchPerformed) && (
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">
              <Package className="inline mr-2" size={20} />
              Resultados de Búsqueda
            </h2>
          </div>

          <div className="card-content">
            {loading ? (
              <div className="loading-container">
                <div className="spinner" style={{ width: '40px', height: '40px' }} />
                <p className="loading-text">Analizando imagen y buscando productos similares...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={result.product_id} className="search-result-item">
                    <img
                      src={`/product-image/${result.product_id}`}
                      alt={result.name}
                      className="search-result-image"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zNSA0MEg2NVY2MEgzNVY0MFoiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+';
                      }}
                    />
                    <div className="search-result-info">
                      <h3 className="search-result-name">{result.name}</h3>
                      <div className={`search-result-similarity ${getSimilarityColor(result.similarity)}`}>
                        Similitud: {formatSimilarity(result.similarity)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Package size={14} />
                          <span>{result.user_id}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{formatDate(result.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full text-lg font-bold text-gray-500">
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Package className="empty-state-icon" />
                <h3 className="empty-state-title">No se encontraron productos similares</h3>
                <p className="empty-state-description">
                  Intenta con una imagen diferente o asegúrate de que haya productos en el catálogo
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchProducts;
