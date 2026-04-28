"""
Script para actualizar la contraseña del usuario admin
"""
from app import create_app
from models import db, Usuario
from werkzeug.security import generate_password_hash
from datetime import datetime

app = create_app('development')

with app.app_context():
    # Buscar el usuario admin
    admin = Usuario.query.filter_by(username='admin').first()
    
    if admin:
        # Actualizar la contraseña y fecha_creacion si es necesario
        admin.set_password('admin123')
        if not admin.fecha_creacion:
            admin.fecha_creacion = datetime.now()
        if not admin.activo:
            admin.activo = True
        db.session.commit()
        print("✅ Contraseña del usuario 'admin' actualizada correctamente")
        print("   Usuario: admin")
        print("   Contraseña: admin123")
    else:
        # Si no existe, crearlo
        admin = Usuario(
            username='admin',
            nombre_completo='Administrador',
            email='admin@reducto.com',
            rol='admin',
            activo=True,
            fecha_creacion=datetime.now()
        )
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
        print("✅ Usuario admin creado correctamente")
        print("   Usuario: admin")
        print("   Contraseña: admin123")

