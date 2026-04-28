from . import db
from datetime import datetime

class Ganador(db.Model):
    __tablename__ = 'ganadores'
    
    id = db.Column(db.Integer, primary_key=True)
    ci = db.Column(db.String(15), nullable=False)
    nombre_completo = db.Column(db.String(255), nullable=False)
    sucursal_codigo = db.Column(db.Integer, db.ForeignKey('sucursales.sucursal_codigo'), nullable=False)
    socio_numero = db.Column(db.BigInteger, nullable=False)
    fecha_hora_ganado = db.Column(db.DateTime, default=datetime.now, nullable=False)
    concepto = db.Column(db.String(100))
    evento_id = db.Column(db.Integer, db.ForeignKey('eventos.id'))
    
    # Relaciones
    sucursal = db.relationship('Sucursal', backref='ganadores')
    evento = db.relationship('Evento', backref='ganadores')
    
    def to_dict(self):
        return {
            'id': self.id,
            'ci': self.ci,
            'nombre_completo': self.nombre_completo,
            'sucursal_codigo': self.sucursal_codigo,
            'sucursal': self.sucursal.sucursal_nombre if self.sucursal else None,
            'socio_numero': self.socio_numero,
            'fecha': self.fecha_hora_ganado.strftime("%Y-%m-%d %H:%M:%S"),
            'concepto': self.concepto,
            'evento_id': self.evento_id,
            'evento_nombre': self.evento.nombre if self.evento else None
        }

