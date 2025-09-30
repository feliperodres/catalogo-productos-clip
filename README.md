# 🛍️ Catálogo de Productos con Búsqueda por Similitud de Imágenes

Una aplicación web moderna que permite gestionar un catálogo de productos con capacidad de búsqueda por similitud visual usando tecnología CLIP (Contrastive Language-Image Pre-Training).

## ✨ Características Principales

- **Gestión de Productos**: Sube productos con imagen, nombre y número de teléfono del usuario
- **Búsqueda Visual**: Encuentra productos similares subiendo una imagen de referencia
- **Tecnología CLIP**: Utiliza modelos de IA avanzados para análisis de similitud visual
- **API RESTful**: Backend robusto con FastAPI
- **Interfaz Moderna**: Frontend responsive con React
- **Base de Datos**: Almacenamiento eficiente con SQLite

## 🚀 Tecnologías Utilizadas

### Backend
- **FastAPI**: Framework web moderno para Python
- **CLIP**: Modelo de OpenAI para análisis de imágenes
- **PyTorch**: Framework de machine learning
- **SQLite**: Base de datos ligera
- **Pillow**: Procesamiento de imágenes

### Frontend
- **React**: Librería de JavaScript para interfaces
- **Axios**: Cliente HTTP para comunicación con API
- **React Dropzone**: Componente para subida de archivos
- **Lucide React**: Iconos modernos
- **CSS Moderno**: Diseño responsive con gradientes

## 📋 Requisitos Previos

- Python 3.8 o superior
- Node.js 16 o superior
- npm o yarn
- Al menos 4GB de RAM (para cargar modelo CLIP)

## 🛠️ Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd busquedacatalogo
```

### 2. Configurar el Backend

```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\\Scripts\\activate
# En macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 3. Configurar el Frontend

```bash
cd frontend
npm install
```

## 🚀 Ejecutar la Aplicación

### Iniciar el Backend

```bash
# Desde la raíz del proyecto
python main.py
```

El backend estará disponible en: `http://localhost:8000`

### Iniciar el Frontend

```bash
# Desde la carpeta frontend
cd frontend
npm start
```

El frontend estará disponible en: `http://localhost:3000`

## 📖 Uso de la Aplicación

### 1. Subir Productos

1. Ve a la sección "Subir Producto"
2. Completa el formulario:
   - **Nombre del Producto**: Descripción del producto
   - **Número de Teléfono**: Tu identificador en el sistema
   - **Imagen**: Arrastra o selecciona una imagen del producto
3. Haz clic en "Subir Producto"

### 2. Buscar Productos Similares

1. Ve a la sección "Buscar"
2. Sube una imagen del producto que quieres encontrar
3. Selecciona el número de resultados deseados
4. Haz clic en "Buscar Productos Similares"
5. Revisa los resultados ordenados por similitud

### 3. Ver Catálogo

1. Ve a la sección "Catálogo"
2. Explora todos los productos disponibles
3. Usa los filtros para buscar por nombre o usuario
4. Actualiza la vista con el botón "Actualizar"

## 🔧 API Endpoints

### Subir Producto
```
POST /upload-product
Content-Type: multipart/form-data

Parámetros:
- name: string (nombre del producto)
- user_phone: string (número de teléfono)
- image: file (archivo de imagen)
```

### Buscar Productos Similares
```
POST /search-similar
Content-Type: multipart/form-data

Parámetros:
- image: file (imagen de búsqueda)
- limit: integer (número de resultados, opcional)
```

### Obtener Productos
```
GET /products
Query Parameters:
- user_phone: string (filtrar por usuario, opcional)
```

### Obtener Imagen de Producto
```
GET /product-image/{product_id}
```

## 📁 Estructura del Proyecto

```
busquedacatalogo/
├── main.py                 # Aplicación FastAPI principal
├── requirements.txt        # Dependencias Python
├── products.db            # Base de datos SQLite (se crea automáticamente)
├── uploads/               # Directorio de imágenes subidas
├── frontend/              # Aplicación React
│   ├── public/
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── App.js        # Componente principal
│   │   ├── App.css       # Estilos de aplicación
│   │   └── index.js      # Punto de entrada
│   └── package.json      # Dependencias Node.js
└── README.md             # Esta documentación
```

## 🔍 Cómo Funciona CLIP

CLIP (Contrastive Language-Image Pre-Training) es un modelo de IA desarrollado por OpenAI que:

1. **Análisis Visual**: Convierte imágenes en vectores numéricos (embeddings) que representan sus características visuales
2. **Similitud Coseno**: Compara embeddings usando distancia coseno para determinar similitud
3. **Búsqueda Eficiente**: Permite encontrar imágenes similares sin necesidad de etiquetas manuales

## ⚡ Optimizaciones y Consideraciones

### Rendimiento
- Los embeddings se calculan una sola vez al subir el producto
- La búsqueda es rápida al comparar vectores pre-calculados
- Se recomienda usar GPU para mejor rendimiento con muchas imágenes

### Escalabilidad
- Para catálogos grandes, considera usar bases de datos vectoriales como Pinecone o Weaviate
- Implementa cache para embeddings frecuentemente consultados
- Usa CDN para servir imágenes en producción

### Seguridad
- Validación de tipos de archivo en frontend y backend
- Límites de tamaño de archivo
- Sanitización de nombres de archivo

## 🐛 Solución de Problemas

### Error al cargar modelo CLIP
```bash
# Instalar dependencias específicas
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

### Puerto en uso
```bash
# Cambiar puerto en main.py
uvicorn.run(app, host="0.0.0.0", port=8001)
```

### Problemas de CORS
- Verifica que el frontend esté configurado en `http://localhost:3000`
- Revisa la configuración CORS en `main.py`

## 🚀 Deployment

### Backend (Heroku, Railway, etc.)
1. Crear `Procfile`:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

2. Configurar variables de entorno según la plataforma

### Frontend (Vercel, Netlify, etc.)
1. Build del proyecto:
```bash
npm run build
```

2. Configurar proxy/API URL para producción

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Si tienes preguntas o problemas:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

---

**¡Disfruta usando tu catálogo de productos inteligente! 🎉**




