import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Package, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const UploadProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    user_id: '',
    image: null
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.user_id || !formData.image) {
      setMessage({ type: 'error', text: 'Por favor completa todos los campos' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('user_id', formData.user_id);
      submitData.append('image', formData.image);

      const response = await axios.post('/upload-product', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage({ type: 'success', text: 'Producto subido exitosamente!' });
      
      // Limpiar formulario
      setFormData({ name: '', user_id: '', image: null });
      setPreview(null);
      
    } catch (error) {
      console.error('Error al subir producto:', error);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error al subir el producto';
      
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(err => err.msg || err).join(', ');
        } else {
          errorMessage = 'Error de validación en el servidor';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage({ 
        type: 'error', 
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setPreview(null);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Subir Producto</h1>
        <p className="page-subtitle">
          Agrega un nuevo producto a tu catálogo con imagen y descripción
        </p>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">
            <Package className="inline mr-2" size={20} />
            Información del Producto
          </h2>
        </div>

        <div className="card-content">
          {message.text && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              {message.type === 'success' ? (
                <CheckCircle className="inline mr-2" size={16} />
              ) : (
                <AlertCircle className="inline mr-2" size={16} />
              )}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información del producto */}
              <div>
                <div className="form-group">
                  <label className="form-label">
                    <Package className="inline mr-2" size={16} />
                    Nombre del Producto
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Ej: iPhone 15 Pro Max"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Upload className="inline mr-2" size={16} />
                    ID de Usuario
                  </label>
                  <input
                    type="text"
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Ej: user123"
                    required
                  />
                  <small className="text-sm text-gray-600 mt-1 block">
                    Este será tu identificador único en el sistema
                  </small>
                </div>
              </div>

              {/* Imagen del producto */}
              <div>
                <label className="form-label">
                  <Upload className="inline mr-2" size={16} />
                  Imagen del Producto
                </label>
                
                {!preview ? (
                  <div
                    {...getRootProps()}
                    className={`dropzone ${isDragActive ? 'active' : ''}`}
                  >
                    <input {...getInputProps()} />
                    <div className="dropzone-content">
                      <Upload className="dropzone-icon" />
                      <p className="dropzone-text">
                        {isDragActive
                          ? 'Suelta la imagen aquí...'
                          : 'Arrastra una imagen o haz clic para seleccionar'
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
                      alt="Vista previa"
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
            </div>

            <div className="mt-8 text-center">
              <button
                type="submit"
                disabled={loading || !formData.name || !formData.user_id || !formData.image}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Subir Producto
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadProduct;
