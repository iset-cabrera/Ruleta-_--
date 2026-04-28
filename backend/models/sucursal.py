from sqlalchemy.orm import validates
from . import db, normalizar_nombre

class Sucursal(db.Model):
    __tablename__ = 'sucursales'

    sucursal_codigo = db.Column(db.Integer, primary_key=True)
    sucursal_nombre = db.Column(db.String(100), nullable=False)

    @validates('sucursal_nombre')
    def _normalizar_a_mayusculas(self, key, value):
        return normalizar_nombre(value)

    def to_dict(self):
        return {
            'sucursal_codigo': self.sucursal_codigo,
            'sucursal_nombre': self.sucursal_nombre
        }

