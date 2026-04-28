from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Evento, Ganador, Usuario
from datetime import datetime

eventos_bp = Blueprint('eventos', __name__)


@eventos_bp.route('/eventos', methods=['GET'])
def obtener_eventos():
    """Obtener todos los eventos"""
    estado = request.args.get('estado')  # filtrar por estado si se proporciona
    
    query = Evento.query
    
    if estado:
        query = query.filter_by(estado=estado)
    
    eventos = query.order_by(Evento.fecha_evento.desc()).all()
    
    return jsonify([evento.to_dict() for evento in eventos])


@eventos_bp.route('/eventos/<int:evento_id>', methods=['GET'])
def obtener_evento(evento_id):
    """Obtener un evento específico con sus ganadores"""
    evento = Evento.query.get(evento_id)
    
    if not evento:
        return jsonify({'error': 'Evento no encontrado'}), 404
    
    return jsonify(evento.to_dict(include_ganadores=True))


@eventos_bp.route('/eventos/activo', methods=['GET'])
def obtener_evento_activo():
    """Obtener el evento activo actual"""
    evento = Evento.query.filter_by(estado='activo').first()
    
    if not evento:
        return jsonify({'error': 'No hay evento activo'}), 404
    
    return jsonify(evento.to_dict())


@eventos_bp.route('/eventos', methods=['POST'])
@jwt_required()
def crear_evento():
    """Crear un nuevo evento (requiere autenticación)"""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validar campos requeridos
    required_fields = ['nombre', 'fecha_evento']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Faltan campos requeridos'}), 400
    
    # Convertir fecha_evento a objeto date
    try:
        fecha_evento = datetime.strptime(data['fecha_evento'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}), 400
    
    # Crear el evento
    nuevo_evento = Evento(
        nombre=data['nombre'],
        descripcion=data.get('descripcion'),
        fecha_evento=fecha_evento,
        estado=data.get('estado', 'activo'),
        creado_por=current_user_id,
        cantidad_ganadores=data.get('cantidad_ganadores', 1),
        permite_reganar=data.get('permite_reganar', False)
    )
    
    db.session.add(nuevo_evento)
    db.session.commit()
    
    return jsonify({
        'message': 'Evento creado exitosamente',
        'evento': nuevo_evento.to_dict()
    }), 201


@eventos_bp.route('/eventos/<int:evento_id>', methods=['PUT'])
@jwt_required()
def actualizar_evento(evento_id):
    """Actualizar un evento existente"""
    evento = Evento.query.get(evento_id)
    
    if not evento:
        return jsonify({'error': 'Evento no encontrado'}), 404
    
    data = request.get_json()
    
    # Actualizar campos permitidos
    if 'nombre' in data:
        evento.nombre = data['nombre']
    
    if 'descripcion' in data:
        evento.descripcion = data['descripcion']
    
    if 'fecha_evento' in data:
        try:
            evento.fecha_evento = datetime.strptime(data['fecha_evento'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Formato de fecha inválido'}), 400
    
    if 'estado' in data:
        if data['estado'] not in ['activo', 'finalizado', 'cancelado']:
            return jsonify({'error': 'Estado inválido'}), 400
        evento.estado = data['estado']
    
    if 'cantidad_ganadores' in data:
        evento.cantidad_ganadores = data['cantidad_ganadores']
    
    if 'permite_reganar' in data:
        evento.permite_reganar = data['permite_reganar']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Evento actualizado exitosamente',
        'evento': evento.to_dict()
    })


@eventos_bp.route('/eventos/<int:evento_id>', methods=['DELETE'])
@jwt_required()
def eliminar_evento(evento_id):
    """Eliminar un evento (solo si no tiene ganadores)"""
    evento = Evento.query.get(evento_id)
    
    if not evento:
        return jsonify({'error': 'Evento no encontrado'}), 404
    
    # Verificar si tiene ganadores
    if evento.ganadores:
        return jsonify({
            'error': 'No se puede eliminar un evento con ganadores registrados'
        }), 400
    
    db.session.delete(evento)
    db.session.commit()
    
    return jsonify({'message': 'Evento eliminado exitosamente'})


@eventos_bp.route('/eventos/<int:evento_id>/ganadores', methods=['GET'])
def obtener_ganadores_evento(evento_id):
    """Obtener todos los ganadores de un evento específico"""
    evento = Evento.query.get(evento_id)
    
    if not evento:
        return jsonify({'error': 'Evento no encontrado'}), 404
    
    ganadores = Ganador.query.filter_by(evento_id=evento_id).order_by(Ganador.fecha_hora_ganado.desc()).all()
    
    return jsonify({
        'evento': evento.to_dict(),
        'ganadores': [g.to_dict() for g in ganadores]
    })

