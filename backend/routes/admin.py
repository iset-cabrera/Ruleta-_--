from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Usuario, Evento, Ganador, Funcionario, Sucursal
from sqlalchemy import func

admin_bp = Blueprint('admin', __name__)


def verificar_admin():
    """Función auxiliar para verificar que el usuario actual es admin"""
    current_user_id = get_jwt_identity()
    usuario = Usuario.query.get(int(current_user_id))
    
    if not usuario or not usuario.activo or usuario.rol != 'admin':
        return None
    
    return usuario


@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    """Obtener estadísticas generales para el dashboard"""
    usuario = verificar_admin()
    if not usuario:
        return jsonify({'error': 'No autorizado'}), 403
    
    # Contar totales
    total_eventos = Evento.query.count()
    total_ganadores = Ganador.query.count()
    total_funcionarios = Funcionario.query.count()
    total_sucursales = Sucursal.query.count()
    
    # Eventos activos
    eventos_activos = Evento.query.filter_by(estado='activo').count()
    
    # Ganadores por sucursal
    ganadores_por_sucursal = db.session.query(
        Sucursal.sucursal_nombre,
        func.count(Ganador.id).label('total')
    ).join(Ganador, Ganador.sucursal_codigo == Sucursal.sucursal_codigo)\
     .group_by(Sucursal.sucursal_nombre)\
     .all()
    
    # Últimos eventos
    ultimos_eventos = Evento.query.order_by(Evento.fecha_creacion.desc()).limit(5).all()
    
    return jsonify({
        'estadisticas': {
            'total_eventos': total_eventos,
            'total_ganadores': total_ganadores,
            'total_funcionarios': total_funcionarios,
            'total_sucursales': total_sucursales,
            'eventos_activos': eventos_activos
        },
        'ganadores_por_sucursal': [
            {'sucursal': r[0], 'total': r[1]} 
            for r in ganadores_por_sucursal
        ],
        'ultimos_eventos': [e.to_dict() for e in ultimos_eventos]
    })


@admin_bp.route('/usuarios', methods=['GET'])
@jwt_required()
def listar_usuarios():
    """Listar todos los usuarios (solo admin)"""
    usuario = verificar_admin()
    if not usuario:
        return jsonify({'error': 'No autorizado'}), 403
    
    usuarios = Usuario.query.all()
    return jsonify([u.to_dict() for u in usuarios])

