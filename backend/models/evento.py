from sqlalchemy.orm import validates
from . import db, normalizar_nombre
from datetime import datetime

class Evento(db.Model):
    __tablename__ = 'eventos'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text)
    fecha_evento = db.Column(db.Date, nullable=False)
    fecha_creacion = db.Column(db.DateTime, default=datetime.now)
    estado = db.Column(db.String(20), default='activo')  # activo, finalizado, cancelado
    creado_por = db.Column(db.Integer, db.ForeignKey('usuarios.id'))
    cantidad_ganadores = db.Column(db.Integer, default=1)
    permite_reganar = db.Column(db.Boolean, default=False)

    # Relación con usuario creador
    creador = db.relationship('Usuario', backref='eventos_creados')

    @validates('nombre')
    def _normalizar_a_mayusculas(self, key, value):
        return normalizar_nombre(value)
    
    def to_dict(self, include_ganadores=False):
        data = {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'fecha_evento': self.fecha_evento.strftime("%Y-%m-%d") if self.fecha_evento else None,
            'fecha_creacion': self.fecha_creacion.strftime("%Y-%m-%d %H:%M:%S") if self.fecha_creacion else None,
            'estado': self.estado,
            'creado_por': self.creado_por,
            'creador_nombre': self.creador.nombre_completo if self.creador else None,
            'cantidad_ganadores': self.cantidad_ganadores,
            'permite_reganar': self.permite_reganar,
            'total_ganadores': len(self.ganadores) if hasattr(self, 'ganadores') else 0
        }
        
        if include_ganadores and hasattr(self, 'ganadores'):
            data['ganadores'] = [g.to_dict() for g in self.ganadores]
        
        return data

