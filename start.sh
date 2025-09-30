#!/bin/bash

# Script para iniciar la aplicación completa
echo "🚀 Iniciando Catálogo de Productos con CLIP..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si Python está instalado
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 no está instalado. Por favor instala Python 3.8 o superior."
    exit 1
fi

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Por favor instala Node.js 16 o superior."
    exit 1
fi

# Crear entorno virtual si no existe
if [ ! -d "venv" ]; then
    print_status "Creando entorno virtual de Python..."
    python3 -m venv venv
    if [ $? -eq 0 ]; then
        print_success "Entorno virtual creado exitosamente"
    else
        print_error "Error al crear entorno virtual"
        exit 1
    fi
fi

# Activar entorno virtual
print_status "Activando entorno virtual..."
source venv/bin/activate

# Instalar dependencias de Python
print_status "Instalando dependencias de Python..."
pip install --upgrade pip
pip install -r requirements.txt
if [ $? -eq 0 ]; then
    print_success "Dependencias de Python instaladas exitosamente"
else
    print_error "Error al instalar dependencias de Python"
    exit 1
fi

# Instalar dependencias de Node.js
print_status "Instalando dependencias de Node.js..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -eq 0 ]; then
        print_success "Dependencias de Node.js instaladas exitosamente"
    else
        print_error "Error al instalar dependencias de Node.js"
        exit 1
    fi
else
    print_success "Dependencias de Node.js ya están instaladas"
fi
cd ..

# Crear directorio de uploads si no existe
if [ ! -d "uploads" ]; then
    mkdir uploads
    print_success "Directorio de uploads creado"
fi

# Función para manejar la terminación del script
cleanup() {
    print_warning "Deteniendo aplicación..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    print_success "Aplicación detenida exitosamente"
    exit 0
}

# Configurar trap para cleanup
trap cleanup SIGINT SIGTERM

# Iniciar backend
print_status "Iniciando backend FastAPI..."
python main.py &
BACKEND_PID=$!

# Esperar un momento para que el backend inicie
sleep 3

# Verificar si el backend está ejecutándose
if ps -p $BACKEND_PID > /dev/null; then
    print_success "Backend iniciado exitosamente (PID: $BACKEND_PID)"
    print_status "Backend disponible en: http://localhost:8000"
    print_status "Documentación API en: http://localhost:8000/docs"
else
    print_error "Error al iniciar el backend"
    exit 1
fi

# Iniciar frontend
print_status "Iniciando frontend React..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

# Esperar un momento para que el frontend inicie
sleep 5

# Verificar si el frontend está ejecutándose
if ps -p $FRONTEND_PID > /dev/null; then
    print_success "Frontend iniciado exitosamente (PID: $FRONTEND_PID)"
    print_status "Frontend disponible en: http://localhost:3000"
else
    print_error "Error al iniciar el frontend"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Mostrar información de la aplicación
echo ""
echo "🎉 ¡Aplicación iniciada exitosamente!"
echo ""
echo "📱 Aplicación Web: http://localhost:3000"
echo "🔧 API Backend: http://localhost:8000"
echo "📚 Documentación API: http://localhost:8000/docs"
echo ""
echo "Para detener la aplicación, presiona Ctrl+C"
echo ""

# Mantener el script ejecutándose
while true; do
    # Verificar si los procesos siguen ejecutándose
    if ! ps -p $BACKEND_PID > /dev/null; then
        print_error "El backend se ha detenido inesperadamente"
        cleanup
    fi
    
    if ! ps -p $FRONTEND_PID > /dev/null; then
        print_error "El frontend se ha detenido inesperadamente"
        cleanup
    fi
    
    sleep 5
done




