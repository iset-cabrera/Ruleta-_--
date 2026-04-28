from . import db

class Sucursal(db.Model):
    __tablename__ = 'sucursales'
    
    sucursal_codigo = db.Column(db.Integer, primary_key=True)
    sucursal_nombre = db.Column(db.String(100), nullable=False)
    
    def to_dict(self):
        return {
            'sucursal_codigo': self.sucursal_codigo,
            'sucursal_nombre': self.sucursal_nombre
        }

