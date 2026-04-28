from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token,
    jwt_required,
    get_jwt_identity
)
from models import db, Usuario

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
def login():
    """Endpoint de login"""
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Usuario y contraseña son requeridos'}), 400
    
    username = data.get('username')
    password = data.get('password')
    
    # Buscar usuario
    usuario = Usuario.query.filter_by(username=username).first()
    
    if not usuario or not usuario.check_password(password):
        return jsonify({'error': 'Credenciales inválidas'}), 401
    
    if not usuario.activo:
        return jsonify({'error': 'Usuario inactivo'}), 401
    
    # Crear tokens (convertir ID a string)
    access_token = create_access_token(identity=str(usuario.id))
    refresh_token = create_refresh_token(identity=str(usuario.id))
    
    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'usuario': usuario.to_dict()
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Obtener información del usuario actual"""
    current_user_id = get_jwt_identity()
    usuario = Usuario.query.get(int(current_user_id))
    
    if not usuario:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    return jsonify(usuario.to_dict()), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Renovar el access token"""
    current_user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=str(current_user_id))
    
    return jsonify({'access_token': new_access_token}), 200


@auth_bp.route('/register', methods=['POST'])
@jwt_required()
def register():
    """Registrar nuevo usuario (solo admin puede hacer esto)"""
    current_user_id = get_jwt_identity()
    current_user = Usuario.query.get(int(current_user_id))
    
    if not current_user or current_user.rol != 'admin':
        return jsonify({'error': 'No autorizado'}), 403
    
    data = request.get_json()
    
    # Validar datos requeridos
    required_fields = ['username', 'password', 'nombre_completo']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Faltan campos requeridos'}), 400
    
    # Verificar si el usuario ya existe
    if Usuario.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'El nombre de usuario ya existe'}), 400
    
    if data.get('email') and Usuario.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'El email ya está registrado'}), 400
    
    # Crear nuevo usuario
    nuevo_usuario = Usuario(
        username=data['username'],
        nombre_completo=data['nombre_completo'],
        email=data.get('email'),
        rol=data.get('rol', 'admin')
    )
    nuevo_usuario.set_password(data['password'])
    
    db.session.add(nuevo_usuario)
    db.session.commit()
    
    return jsonify({
        'message': 'Usuario creado exitosamente',
        'usuario': nuevo_usuario.to_dict()
    }), 201


@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Cambiar contraseña del usuario actual"""
    current_user_id = get_jwt_identity()
    usuario = Usuario.query.get(int(current_user_id))
    
    if not usuario:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    data = request.get_json()
    
    if not data.get('old_password') or not data.get('new_password'):
        return jsonify({'error': 'Se requiere contraseña actual y nueva'}), 400
    
    # Verificar contraseña actual
    if not usuario.check_password(data['old_password']):
        return jsonify({'error': 'Contraseña actual incorrecta'}), 401
    
    # Actualizar contraseña
    usuario.set_password(data['new_password'])
    db.session.commit()
    
    return jsonify({'message': 'Contraseña actualizada exitosamente'}), 200

