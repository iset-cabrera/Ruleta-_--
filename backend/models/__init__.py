from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def normalizar_nombre(valor):
    """Normaliza un texto: trim + colapsa espacios + UPPER. Devuelve None si queda vacío."""
    if valor is None:
        return None
    texto = str(valor).strip()
    if not texto:
        return None
    return ' '.join(texto.split()).upper()


# Importar todos los modelos para que estén disponibles
from .funcionario import Funcionario
from .ganador import Ganador
from .sucursal import Sucursal
from .usuario import Usuario
from .evento import Evento

__all__ = ['db', 'normalizar_nombre', 'Funcionario', 'Ganador', 'Sucursal', 'Usuario', 'Evento']

