from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models import Usuario

def jwt_required_custom(fn):
    """
    Decorador personalizado que verifica JWT y carga el usuario
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        
        # Verificar que el usuario existe y está activo
        usuario = Usuario.query.filter_by(id=current_user_id, activo=True).first()
        if not usuario:
            return jsonify({'error': 'Usuario no autorizado'}), 401
        
        return fn(*args, **kwargs)
    return wrapper


def admin_required(fn):
    """
    Decorador que requiere que el usuario sea admin
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        
        usuario = Usuario.query.filter_by(id=current_user_id).first()
        if not usuario or not usuario.activo:
            return jsonify({'error': 'Usuario no autorizado'}), 401
        
        if usuario.rol != 'admin':
            return jsonify({'error': 'Se requieren permisos de administrador'}), 403
        
        return fn(*args, **kwargs)
    return wrapper

