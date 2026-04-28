from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Importar todos los modelos para que estén disponibles
from .funcionario import Funcionario
from .ganador import Ganador
from .sucursal import Sucursal
from .usuario import Usuario
from .evento import Evento

__all__ = ['db', 'Funcionario', 'Ganador', 'Sucursal', 'Usuario', 'Evento']

