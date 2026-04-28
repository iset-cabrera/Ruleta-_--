from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Usuario, Evento, Ganador, Funcionario, Sucursal, normalizar_nombre
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


@admin_bp.route('/normalizar-nombres', methods=['POST'])
@jwt_required()
def normalizar_nombres_existentes():
    """Pasa a MAYÚSCULAS los nombres ya guardados en la BD.
    Fusiona sucursales que colisionan al normalizarse (p.ej. 'Casa Central' y 'casa central')."""
    usuario = verificar_admin()
    if not usuario:
        return jsonify({'error': 'No autorizado'}), 403

    contadores = {
        'funcionarios': 0,
        'ganadores': 0,
        'eventos': 0,
        'sucursales_actualizadas': 0,
        'sucursales_fusionadas': 0,
    }

    # 1) Sucursales: agrupar por nombre normalizado y fusionar duplicados
    sucursales = Sucursal.query.all()
    grupos = {}
    for s in sucursales:
        clave = normalizar_nombre(s.sucursal_nombre)
        grupos.setdefault(clave, []).append(s)

    for clave, lista in grupos.items():
        canonica = min(lista, key=lambda x: x.sucursal_codigo)
        if canonica.sucursal_nombre != clave:
            canonica.sucursal_nombre = clave
            contadores['sucursales_actualizadas'] += 1
        for s in lista:
            if s is canonica:
                continue
            Funcionario.query.filter_by(sucursal_codigo=s.sucursal_codigo).update(
                {'sucursal_codigo': canonica.sucursal_codigo}
            )
            Ganador.query.filter_by(sucursal_codigo=s.sucursal_codigo).update(
                {'sucursal_codigo': canonica.sucursal_codigo}
            )
            db.session.delete(s)
            contadores['sucursales_fusionadas'] += 1

    # 2) Funcionarios
    for f in Funcionario.query.all():
        cambio = False
        for campo in ('nombre_completo', 'cargo', 'nomina', 'plus'):
            actual = getattr(f, campo)
            nuevo = normalizar_nombre(actual)
            if nuevo != actual:
                setattr(f, campo, nuevo)
                cambio = True
        if cambio:
            contadores['funcionarios'] += 1

    # 3) Ganadores
    for g in Ganador.query.all():
        cambio = False
        for campo in ('nombre_completo', 'concepto'):
            actual = getattr(g, campo)
            nuevo = normalizar_nombre(actual)
            if nuevo != actual:
                setattr(g, campo, nuevo)
                cambio = True
        if cambio:
            contadores['ganadores'] += 1

    # 4) Eventos
    for e in Evento.query.all():
        nuevo = normalizar_nombre(e.nombre)
        if nuevo != e.nombre:
            e.nombre = nuevo
            contadores['eventos'] += 1

    db.session.commit()

    return jsonify({
        'status': 'ok',
        'message': 'Nombres normalizados a MAYÚSCULAS',
        'cambios': contadores
    })

