from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Ganador, Funcionario, Sucursal, Evento
from sqlalchemy import select, join
from datetime import datetime

ganadores_bp = Blueprint('ganadores', __name__)


@ganadores_bp.route('/ganadores', methods=['GET'])
def obtener_ganadores():
    """Obtener todos los ganadores o filtrar por evento"""
    evento_id = request.args.get('evento_id', type=int)
    
    # JOIN de ganadores con funcionarios y sucursales
    j1 = join(Ganador, Funcionario, Ganador.ci == Funcionario.cedula, isouter=True)
    j2 = join(j1, Sucursal, Ganador.sucursal_codigo == Sucursal.sucursal_codigo, isouter=True)
    
    stmt = select(
        Ganador.id,
        Ganador.nombre_completo,
        Ganador.ci,
        Ganador.socio_numero,
        Sucursal.sucursal_nombre,
        Ganador.fecha_hora_ganado,
        Ganador.concepto,
        Ganador.evento_id
    ).select_from(j2).order_by(Ganador.fecha_hora_ganado.desc())
    
    # Filtrar por evento si se proporciona
    if evento_id:
        stmt = stmt.where(Ganador.evento_id == evento_id)
    
    result = db.session.execute(stmt).fetchall()
    
    return jsonify([
        {
            "id": r.id,
            "nombre_completo": r.nombre_completo,
            "ci": r.ci,
            "socio_numero": r.socio_numero,
            "sucursal": r.sucursal_nombre,
            "fecha": r.fecha_hora_ganado.strftime("%Y-%m-%d %H:%M:%S"),
            "concepto": r.concepto,
            "evento_id": r.evento_id
        } for r in result
    ])


@ganadores_bp.route('/registrar_ganador', methods=['POST'])
def registrar_ganador():
    """Registrar un nuevo ganador"""
    data = request.get_json()
    
    # Validar campos requeridos
    required_fields = ['ci', 'nombre_completo', 'sucursal_codigo', 'socio_numero', 'evento_id']
    if not all(field in data for field in required_fields):
        return jsonify({
            "status": "error",
            "message": "Faltan campos requeridos"
        }), 400
    
    evento_id = data.get('evento_id')
    ci = data.get('ci')
    
    # Verificar que el evento existe y está activo
    evento = Evento.query.get(evento_id)
    if not evento:
        return jsonify({
            "status": "error",
            "message": "El evento no existe"
        }), 404
    
    if evento.estado != 'activo':
        return jsonify({
            "status": "error",
            "message": "El evento no está activo"
        }), 400
    
    # Verificar si ya existe un ganador con esa cédula en este evento
    # (a menos que el evento permita reganar)
    if not evento.permite_reganar:
        ganador_existente = Ganador.query.filter_by(
            ci=ci,
            evento_id=evento_id
        ).first()
        
        if ganador_existente:
            return jsonify({
                "status": "error",
                "message": f"El funcionario con CI {ci} ya fue registrado como ganador en este evento."
            }), 400
    
    # Registrar el ganador
    nuevo_ganador = Ganador(
        ci=ci,
        nombre_completo=data['nombre_completo'],
        sucursal_codigo=data['sucursal_codigo'],
        socio_numero=data['socio_numero'],
        concepto=data.get('concepto', evento.nombre),
        evento_id=evento_id,
        fecha_hora_ganado=datetime.now()
    )
    
    db.session.add(nuevo_ganador)
    db.session.commit()

    return jsonify({
        "status": "ok",
        "message": "Ganador registrado exitosamente",
        "ganador": nuevo_ganador.to_dict()
    }), 201


@ganadores_bp.route('/ganadores/reset', methods=['DELETE'])
@jwt_required()
def reset_ganadores():
    """Eliminar ganadores (todos o por evento). Para pruebas/admin."""
    evento_id = request.args.get('evento_id', type=int)

    query = Ganador.query
    if evento_id:
        evento = Evento.query.get(evento_id)
        if not evento:
            return jsonify({'error': 'Evento no encontrado'}), 404
        query = query.filter_by(evento_id=evento_id)

    eliminados = query.delete(synchronize_session=False)
    db.session.commit()

    return jsonify({
        'status': 'ok',
        'message': f'{eliminados} ganador(es) eliminado(s) exitosamente',
        'eliminados': eliminados
    })


@ganadores_bp.route('/ganadores/<int:ganador_id>', methods=['DELETE'])
@jwt_required()
def eliminar_ganador(ganador_id):
    """Eliminar un ganador específico por ID."""
    ganador = Ganador.query.get(ganador_id)
    if not ganador:
        return jsonify({'error': 'Ganador no encontrado'}), 404

    db.session.delete(ganador)
    db.session.commit()

    return jsonify({
        'status': 'ok',
        'message': 'Ganador eliminado exitosamente'
    })

