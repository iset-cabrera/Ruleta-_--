"""
Script para crear un evento inicial activo
"""
from app import create_app
from models import db, Evento, Usuario
from datetime import datetime, date

app = create_app('development')

with app.app_context():
    # Buscar si ya existe un evento activo
    evento_activo = Evento.query.filter_by(estado='activo').first()
    
    if evento_activo:
        print(f"✅ Ya existe un evento activo: {evento_activo.nombre}")
    else:
        # Buscar el usuario admin
        admin = Usuario.query.filter_by(username='admin').first()
        
        # Crear evento inicial
        evento = Evento(
            nombre='Sorteo Octubre 2025',
            descripcion='Primer sorteo del sistema',
            fecha_evento=date.today(),
            estado='activo',
            creado_por=admin.id if admin else None,
            cantidad_ganadores=10,
            permite_reganar=False,
            fecha_creacion=datetime.now()
        )
        
        db.session.add(evento)
        db.session.commit()
        
        print("✅ Evento creado exitosamente!")
        print(f"   ID: {evento.id}")
        print(f"   Nombre: {evento.nombre}")
        print(f"   Estado: {evento.estado}")
        print(f"   Fecha: {evento.fecha_evento}")

