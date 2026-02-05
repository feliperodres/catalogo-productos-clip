from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import torch
import clip
from PIL import Image
import numpy as np
import sqlite3
import json
import os
from typing import List, Optional
import asyncio
from datetime import datetime
import aiofiles
import uuid
from io import BytesIO

app = FastAPI(
    title="Catálogo de Productos con CLIP",
    description="API para gestionar catálogo de productos con búsqueda por similitud de imágenes",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración global
UPLOAD_DIR = "uploads"
DB_PATH = "products.db"

# Crear directorio de uploads si no existe
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Inicializar CLIP
device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

class DatabaseManager:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.init_db()
    
    def init_db(self):
        """Inicializar base de datos"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                user_id TEXT NOT NULL,
                image_path TEXT NOT NULL,
                embedding TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        conn.commit()
        conn.close()
    
    def save_product(self, product_id: str, name: str, user_id: str, 
                    image_path: str, embedding: np.ndarray):
        """Guardar producto en base de datos"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Convertir embedding a JSON string
        embedding_json = json.dumps(embedding.tolist())
        
        cursor.execute("""
            INSERT INTO products (id, name, user_id, image_path, embedding)
            VALUES (?, ?, ?, ?, ?)
        """, (product_id, name, user_id, image_path, embedding_json))
        
        conn.commit()
        conn.close()
    
    def get_all_products(self):
        """Obtener todos los productos"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, name, user_id, image_path, embedding, created_at
            FROM products
        """)
        
        results = cursor.fetchall()
        conn.close()
        
        products = []
        for row in results:
            products.append({
                "id": row[0],
                "name": row[1],
                "user_id": row[2],
                "image_path": row[3],
                "embedding": json.loads(row[4]),
                "created_at": row[5]
            })
        
        return products
    
    def get_products_by_user(self, user_id: str):
        """Obtener productos por usuario"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, name, user_id, image_path, embedding, created_at
            FROM products
            WHERE user_id = ?
        """, (user_id,))
        
        results = cursor.fetchall()
        conn.close()
        
        products = []
        for row in results:
            products.append({
                "id": row[0],
                "name": row[1],
                "user_id": row[2],
                "image_path": row[3],
                "embedding": json.loads(row[4]),
                "created_at": row[5]
            })
        
        return products

# Inicializar base de datos
db_manager = DatabaseManager(DB_PATH)

def generate_image_embedding(image: Image.Image) -> np.ndarray:
    """Generar embedding de imagen usando CLIP"""
    image_input = preprocess(image).unsqueeze(0).to(device)
    
    with torch.no_grad():
        image_features = model.encode_image(image_input)
        image_features = image_features / image_features.norm(dim=-1, keepdim=True)
    
    return image_features.cpu().numpy()[0]

def calculate_similarity(embedding1: np.ndarray, embedding2: np.ndarray) -> float:
    """Calcular similitud coseno entre dos embeddings"""
    return np.dot(embedding1, embedding2) / (np.linalg.norm(embedding1) * np.linalg.norm(embedding2))

@app.get("/")
async def root():
    return {"message": "API de Catálogo de Productos con CLIP"}

@app.post("/upload-product")
async def upload_product(
    name: str = Form(...),
    user_id: str = Form(...),
    image: UploadFile = File(...)
):
    """Subir nuevo producto al catálogo"""
    try:
        # Validar formato de imagen
        if not image.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")
        
        # Generar ID único para el producto
        product_id = str(uuid.uuid4())
        
        # Guardar imagen
        file_extension = image.filename.split(".")[-1]
        image_filename = f"{product_id}.{file_extension}"
        image_path = os.path.join(UPLOAD_DIR, image_filename)
        
        async with aiofiles.open(image_path, 'wb') as f:
            content = await image.read()
            await f.write(content)
        
        # Procesar imagen y generar embedding
        pil_image = Image.open(image_path).convert("RGB")
        embedding = generate_image_embedding(pil_image)
        
        # Guardar en base de datos
        db_manager.save_product(product_id, name, user_id, image_path, embedding)
        
        return {
            "message": "Producto subido exitosamente",
            "product_id": product_id,
            "name": name,
            "user_id": user_id
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al subir producto: {str(e)}")

@app.post("/search-similar")
async def search_similar(
    request: Request,
    image: UploadFile = File(...),
    limit: int = Form(10)
):
    """Buscar productos similares por imagen"""
    try:
        # Validar formato de imagen
        if not image.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")
        
        # Procesar imagen de búsqueda
        content = await image.read()
        pil_image = Image.open(BytesIO(content)).convert("RGB")
        search_embedding = generate_image_embedding(pil_image)
        
        # Obtener todos los productos
        all_products = db_manager.get_all_products()
        
        # Calcular similitudes
        similarities = []
        base_url = str(request.base_url)
        for product in all_products:
            product_embedding = np.array(product["embedding"])
            similarity = calculate_similarity(search_embedding, product_embedding)
            
            similarities.append({
                "product_id": product["id"],
                "name": product["name"],
                "user_id": product["user_id"],
                "image_path": product["image_path"],
                "image_url": f"{base_url}product-image/{product['id']}",
                "similarity": float(similarity),
                "created_at": product["created_at"]
            })
        
        # Ordenar por similitud y limitar resultados
        similarities.sort(key=lambda x: x["similarity"], reverse=True)
        top_results = similarities[:limit]
        
        return {
            "message": "Búsqueda completada",
            "results": top_results,
            "total_found": len(similarities)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en búsqueda: {str(e)}")

@app.post("/search-similar-by-user")
async def search_similar_by_user(
    request: Request,
    image: UploadFile = File(...),
    user_id: str = Form(...),
    limit: int = Form(10)
):
    """Buscar productos similares por imagen filtrado por usuario"""
    try:
        # Validar formato de imagen
        if not image.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")
        
        # Procesar imagen de búsqueda
        content = await image.read()
        pil_image = Image.open(BytesIO(content)).convert("RGB")
        search_embedding = generate_image_embedding(pil_image)
        
        # Obtener productos solo del usuario específico
        user_products = db_manager.get_products_by_user(user_id)
        
        if not user_products:
            return {
                "message": "No se encontraron productos para este usuario",
                "results": [],
                "total_found": 0,
                "user_id": user_id
            }
        
        # Calcular similitudes
        similarities = []
        base_url = str(request.base_url)
        for product in user_products:
            product_embedding = np.array(product["embedding"])
            similarity = calculate_similarity(search_embedding, product_embedding)
            
            similarities.append({
                "product_id": product["id"],
                "name": product["name"],
                "user_id": product["user_id"],
                "image_path": product["image_path"],
                "image_url": f"{base_url}product-image/{product['id']}",
                "similarity": float(similarity),
                "created_at": product["created_at"]
            })
        
        # Ordenar por similitud y limitar resultados
        similarities.sort(key=lambda x: x["similarity"], reverse=True)
        top_results = similarities[:limit]
        
        return {
            "message": f"Búsqueda completada para usuario {user_id}",
            "results": top_results,
            "total_found": len(similarities),
            "user_id": user_id
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en búsqueda: {str(e)}")

@app.get("/products")
async def get_products(user_id: Optional[str] = None):
    """Obtener productos del catálogo"""
    try:
        if user_id:
            products = db_manager.get_products_by_user(user_id)
        else:
            products = db_manager.get_all_products()
        
        # No incluir embeddings en la respuesta para reducir tamaño
        for product in products:
            del product["embedding"]
        
        return {
            "message": "Productos obtenidos exitosamente",
            "products": products,
            "total": len(products)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener productos: {str(e)}")

@app.get("/product-image/{product_id}")
async def get_product_image(product_id: str):
    """Obtener imagen de producto"""
    try:
        products = db_manager.get_all_products()
        product = next((p for p in products if p["id"] == product_id), None)
        
        if not product:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        
        image_path = product["image_path"]
        if not os.path.exists(image_path):
            raise HTTPException(status_code=404, detail="Imagen no encontrada")
        
        from fastapi.responses import FileResponse
        return FileResponse(image_path)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener imagen: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Configuración para producción
if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
