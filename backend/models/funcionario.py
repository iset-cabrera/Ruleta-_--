from . import db
from datetime import datetime

class Funcionario(db.Model):
    __tablename__ = 'funcionarios'
    
    cedula = db.Column(db.String(15), primary_key=True)
    nombre_completo = db.Column(db.String(255), nullable=False)
    sucursal_codigo = db.Column(db.Integer, db.ForeignKey('sucursales.sucursal_codigo'), nullable=False)
    socio_numero = db.Column(db.BigInteger, nullable=False)
    activo = db.Column(db.Boolean, default=True)
    tipo = db.Column(db.String(50), default='funcionario')
    fecha_creacion = db.Column(db.DateTime, default=datetime.now)
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Relación con sucursal
    sucursal = db.relationship('Sucursal', backref='funcionarios')
    
    def to_dict(self):
        return {
            'ci': self.cedula,
            'nombre_completo': self.nombre_completo,
            'sucursal_codigo': self.sucursal_codigo,
            'socio_numero': self.socio_numero,
            'sucursal_nombre': self.sucursal.sucursal_nombre if self.sucursal else None,
            'activo': self.activo,
            'tipo': self.tipo,
            'fecha_creacion': self.fecha_creacion.strftime("%Y-%m-%d %H:%M:%S") if self.fecha_creacion else None,
            'fecha_actualizacion': self.fecha_actualizacion.strftime("%Y-%m-%d %H:%M:%S") if self.fecha_actualizacion else None
        }

