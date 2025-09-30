#!/usr/bin/env python3
"""
Script para migrar la base de datos de user_phone a user_id
"""

import sqlite3
import os

def migrate_database():
    """Migrar la base de datos de user_phone a user_id"""
    
    # Backup de la base de datos original
    if os.path.exists("products.db"):
        import shutil
        shutil.copy("products.db", "products_backup.db")
        print("✅ Backup creado: products_backup.db")
    
    # Conectar a la base de datos
    conn = sqlite3.connect("products.db")
    cursor = conn.cursor()
    
    try:
        # Verificar si la tabla tiene la columna user_phone
        cursor.execute("PRAGMA table_info(products)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if "user_phone" in columns and "user_id" not in columns:
            print("�� Migrando de user_phone a user_id...")
            
            # Crear nueva tabla con user_id
            cursor.execute("""
                CREATE TABLE products_new (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    image_path TEXT NOT NULL,
                    embedding TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Copiar datos de la tabla antigua a la nueva
            cursor.execute("""
                INSERT INTO products_new (id, name, user_id, image_path, embedding, created_at)
                SELECT id, name, user_phone, image_path, embedding, created_at
                FROM products
            """)
            
            # Eliminar tabla antigua
            cursor.execute("DROP TABLE products")
            
            # Renombrar nueva tabla
            cursor.execute("ALTER TABLE products_new RENAME TO products")
            
            conn.commit()
            print("✅ Migración completada exitosamente")
            
        elif "user_id" in columns:
            print("✅ La base de datos ya tiene user_id")
            
        else:
            print("⚠️  Estructura de tabla no reconocida")
            
    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
        conn.rollback()
        
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()
