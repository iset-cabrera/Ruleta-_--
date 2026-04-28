from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Funcionario, Sucursal, Ganador
from sqlalchemy import select, join, func

funcionarios_bp = Blueprint('funcionarios', __name__)


@funcionarios_bp.route('/funcionarios', methods=['GET'])
def obtener_funcionarios():
    """Obtener funcionarios con filtros opcionales"""
    # Parámetros de query
    filtro = request.args.get('filtro', 'todos')  # todos, activos, inactivos
    tipo = request.args.get('tipo')  # funcionario, directivo, socio
    sucursal = request.args.get('sucursal', type=int)
    
    # Construir query
    j = join(Funcionario, Sucursal, Funcionario.sucursal_codigo == Sucursal.sucursal_codigo)
    
    stmt = select(
        Funcionario.cedula,
        Funcionario.nombre_completo,
        Funcionario.sucursal_codigo,
        Sucursal.sucursal_nombre,
        Funcionario.socio_numero,
        Funcionario.activo,
        Funcionario.tipo,
        Funcionario.fecha_creacion
    ).select_from(j)
    
    # Aplicar filtros
    if filtro == 'activos':
        stmt = stmt.where(Funcionario.activo == True)
    elif filtro == 'inactivos':
        stmt = stmt.where(Funcionario.activo == False)
    
    if tipo:
        stmt = stmt.where(Funcionario.tipo == tipo)
    
    if sucursal:
        stmt = stmt.where(Funcionario.sucursal_codigo == sucursal)
    
    # Ordenar por nombre
    stmt = stmt.order_by(Funcionario.nombre_completo)
    
    result = db.session.execute(stmt).fetchall()
    
    return jsonify([
        {
            "ci": r.cedula,
            "nombre_completo": r.nombre_completo,
            "sucursal_codigo": r.sucursal_codigo,
            "sucursal_nombre": r.sucursal_nombre,
            "socio_numero": r.socio_numero,
            "activo": r.activo,
            "tipo": r.tipo,
            "fecha_creacion": r.fecha_creacion.strftime("%Y-%m-%d %H:%M:%S") if r.fecha_creacion else None
        } for r in result
    ])


@funcionarios_bp.route('/funcionarios/<string:ci>', methods=['GET'])
def obtener_funcionario(ci):
    """Obtener un funcionario específico"""
    funcionario = Funcionario.query.get(ci)
    
    if not funcionario:
        return jsonify({'error': 'Funcionario no encontrado'}), 404
    
    return jsonify(funcionario.to_dict())


@funcionarios_bp.route('/funcionarios', methods=['POST'])
@jwt_required()
def crear_funcionario():
    """Crear un nuevo funcionario (requiere autenticación)"""
    data = request.get_json()
    
    # Validar campos requeridos
    required_fields = ['cedula', 'nombre_completo', 'sucursal_codigo', 'socio_numero']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Faltan campos requeridos'}), 400
    
    # Verificar si ya existe
    if Funcionario.query.get(data['cedula']):
        return jsonify({'error': 'Ya existe un funcionario con esa cédula'}), 400
    
    # Crear funcionario
    nuevo_funcionario = Funcionario(
        cedula=data['cedula'],
        nombre_completo=data['nombre_completo'],
        sucursal_codigo=data['sucursal_codigo'],
        socio_numero=data['socio_numero'],
        activo=data.get('activo', True),
        tipo=data.get('tipo', 'funcionario')
    )
    
    db.session.add(nuevo_funcionario)
    db.session.commit()
    
    return jsonify({
        'message': 'Funcionario creado exitosamente',
        'funcionario': nuevo_funcionario.to_dict()
    }), 201


@funcionarios_bp.route('/funcionarios/<string:ci>', methods=['PUT'])
@jwt_required()
def actualizar_funcionario(ci):
    """Actualizar un funcionario existente"""
    funcionario = Funcionario.query.get(ci)
    
    if not funcionario:
        return jsonify({'error': 'Funcionario no encontrado'}), 404
    
    data = request.get_json()
    
    # Actualizar campos permitidos
    if 'nombre_completo' in data:
        funcionario.nombre_completo = data['nombre_completo']
    
    if 'sucursal_codigo' in data:
        funcionario.sucursal_codigo = data['sucursal_codigo']
    
    if 'socio_numero' in data:
        funcionario.socio_numero = data['socio_numero']
    
    if 'activo' in data:
        funcionario.activo = data['activo']
    
    if 'tipo' in data:
        funcionario.tipo = data['tipo']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Funcionario actualizado exitosamente',
        'funcionario': funcionario.to_dict()
    })


@funcionarios_bp.route('/funcionarios/<string:ci>/toggle', methods=['PATCH'])
@jwt_required()
def toggle_funcionario(ci):
    """Activar/Desactivar un funcionario (soft delete)"""
    funcionario = Funcionario.query.get(ci)
    
    if not funcionario:
        return jsonify({'error': 'Funcionario no encontrado'}), 404
    
    # Cambiar estado
    funcionario.activo = not funcionario.activo
    db.session.commit()
    
    estado = 'activado' if funcionario.activo else 'desactivado'
    
    return jsonify({
        'message': f'Funcionario {estado} exitosamente',
        'funcionario': funcionario.to_dict()
    })


@funcionarios_bp.route('/funcionarios/<string:ci>', methods=['DELETE'])
@jwt_required()
def eliminar_funcionario(ci):
    """Eliminar permanentemente un funcionario (solo si no tiene sorteos)"""
    funcionario = Funcionario.query.get(ci)
    
    if not funcionario:
        return jsonify({'error': 'Funcionario no encontrado'}), 404
    
    # Verificar si tiene sorteos ganados
    ganador_registro = Ganador.query.filter_by(ci=ci).first()
    
    if ganador_registro:
        return jsonify({
            'error': 'No se puede eliminar. El funcionario tiene sorteos registrados. Use desactivar en su lugar.'
        }), 400
    
    db.session.delete(funcionario)
    db.session.commit()
    
    return jsonify({'message': 'Funcionario eliminado exitosamente'})


@funcionarios_bp.route('/sucursales', methods=['GET'])
def obtener_sucursales():
    """Obtener todas las sucursales"""
    sucursales = Sucursal.query.all()
    return jsonify([s.to_dict() for s in sucursales])


@funcionarios_bp.route('/funcionarios/stats', methods=['GET'])
@jwt_required()
def obtener_estadisticas():
    """Obtener estadísticas de funcionarios"""
    total = Funcionario.query.count()
    activos = Funcionario.query.filter_by(activo=True).count()
    inactivos = Funcionario.query.filter_by(activo=False).count()
    
    # Por tipo
    por_tipo = db.session.query(
        Funcionario.tipo,
        func.count(Funcionario.cedula)
    ).group_by(Funcionario.tipo).all()
    
    return jsonify({
        'total': total,
        'activos': activos,
        'inactivos': inactivos,
        'por_tipo': {tipo: count for tipo, count in por_tipo}
    })
