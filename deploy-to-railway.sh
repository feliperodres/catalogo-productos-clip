#!/bin/bash

echo "🚀 Preparando aplicación para Railway..."

# Verificar que estamos en el directorio correcto
if [ ! -f "main.py" ]; then
    echo "❌ Error: No se encontró main.py. Asegúrate de estar en el directorio correcto."
    exit 1
fi

# Crear archivos de configuración si no existen
if [ ! -f "railway.json" ]; then
    cat > railway.json << 'RAILWAY_EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
RAILWAY_EOF
    echo "✅ railway.json creado"
fi

if [ ! -f "Procfile" ]; then
    echo "web: uvicorn main:app --host 0.0.0.0 --port \$PORT" > Procfile
    echo "✅ Procfile creado"
fi

if [ ! -f "runtime.txt" ]; then
    echo "python-3.9.16" > runtime.txt
    echo "✅ runtime.txt creado"
fi

# Verificar que CLIP esté en requirements.txt
if ! grep -q "git+https://github.com/openai/CLIP.git" requirements.txt; then
    echo "git+https://github.com/openai/CLIP.git" >> requirements.txt
    echo "✅ CLIP agregado a requirements.txt"
fi

# Crear .railwayignore
cat > .railwayignore << 'IGNORE_EOF'
venv/
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
env/
pip-log.txt
pip-delete-this-directory.txt
.tox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
.hypothesis/
.pytest_cache/
frontend/node_modules/
frontend/build/
.DS_Store
*.log
IGNORE_EOF
echo "✅ .railwayignore creado"

echo ""
echo "🎉 ¡Archivos de configuración listos para Railway!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Sube tu código a GitHub:"
echo "   git add ."
echo "   git commit -m 'Ready for Railway deployment'"
echo "   git push origin main"
echo ""
echo "2. Ve a https://railway.app"
echo "3. Crea cuenta con GitHub"
echo "4. 'New Project' → 'Deploy from GitHub repo'"
echo "5. Selecciona tu repositorio"
echo "6. ¡Deploy automático!"
echo ""
echo "🌐 Tu app estará disponible en: https://tu-proyecto.up.railway.app"
