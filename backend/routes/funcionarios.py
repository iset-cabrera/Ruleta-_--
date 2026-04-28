from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Funcionario, Sucursal, Ganador, normalizar_nombre
from sqlalchemy import select, join, func
import pandas as pd
import io

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
        Funcionario.cumpleanos,
        Funcionario.fecha_ingreso,
        Funcionario.cargo,
        Funcionario.nomina,
        Funcionario.plus,
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
            "cumpleanos": r.cumpleanos,
            "fecha_ingreso": r.fecha_ingreso,
            "cargo": r.cargo,
            "nomina": r.nomina,
            "plus": r.plus,
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


@funcionarios_bp.route('/funcionarios/upload', methods=['POST'])
@jwt_required()
def upload_excel():
    if 'file' not in request.files:
        return jsonify({'error': 'No se proporcionó ningún archivo'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No se seleccionó ningún archivo'}), 400
    
    try:
        content = file.read()
        xl = pd.ExcelFile(io.BytesIO(content))
        
        sucursales_db = {normalizar_nombre(s.sucursal_nombre): s for s in Sucursal.query.all()}
        next_sucursal_codigo = max([s.sucursal_codigo for s in sucursales_db.values()] + [0]) + 1
        
        added = 0
        updated = 0
        
        for sheet in xl.sheet_names:
            df = xl.parse(sheet, header=None)
            
            header_row_idx = -1
            for i, row in df.iterrows():
                if 'CI' in row.values:
                    header_row_idx = i
                    break
                    
            if header_row_idx == -1:
                continue
                
            headers = df.iloc[header_row_idx].tolist()
            ci_idx = headers.index('CI')
            socio_idx = headers.index('Nº DE SOCIO') if 'Nº DE SOCIO' in headers else -1
            
            # Find indices for extra columns
            def find_col(name):
                for idx, h in enumerate(headers):
                    if isinstance(h, str) and name in h.upper():
                        return idx
                return -1
                
            nombre_idx = find_col('NOMBRE Y APELLIDO')
            cumpleanos_idx = find_col('CUMPLEAÑOS')
            ingreso_idx = find_col('INGRESO')
            cargo_idx = find_col('CARGO')
            nomina_idx = find_col('NOMINA')
            plus_idx = find_col('PLUS')
            
            if ci_idx == -1 or nombre_idx == -1:
                continue
                
            sucursal_nombre = normalizar_nombre(sheet)
            if not sucursal_nombre:
                continue
            if sucursal_nombre not in sucursales_db:
                nueva_sucursal = Sucursal(sucursal_codigo=next_sucursal_codigo, sucursal_nombre=sucursal_nombre)
                db.session.add(nueva_sucursal)
                sucursales_db[sucursal_nombre] = nueva_sucursal
                next_sucursal_codigo += 1

            sucursal = sucursales_db[sucursal_nombre]
            
            for i in range(header_row_idx + 1, len(df)):
                row = df.iloc[i]
                ci_val = row.iloc[ci_idx]
                if pd.isna(ci_val):
                    continue
                    
                ci_str = str(ci_val).replace('.', '').strip()
                try:
                    ci_str = str(int(float(ci_str))) # handle 12345.0
                except:
                    pass
                if not ci_str or ci_str == 'nan':
                    continue
                    
                nombre = str(row.iloc[nombre_idx]).strip()
                if pd.isna(row.iloc[nombre_idx]) or nombre == 'nan':
                    continue

                socio = 0
                if socio_idx != -1 and not pd.isna(row.iloc[socio_idx]):
                    try:
                        socio = int(float(str(row.iloc[socio_idx]).replace('.', '')))
                    except:
                        pass
                        
                def get_val(idx):
                    if idx != -1 and not pd.isna(row.iloc[idx]):
                        val = row.iloc[idx]
                        if isinstance(val, pd.Timestamp):
                            return val.strftime('%d/%m/%Y')
                        return str(val).strip()
                    return None

                cumpleanos = get_val(cumpleanos_idx)
                ingreso = get_val(ingreso_idx)
                cargo = get_val(cargo_idx)
                nomina = get_val(nomina_idx)
                plus = get_val(plus_idx)
                
                func_obj = Funcionario.query.get(ci_str)
                if func_obj:
                    func_obj.nombre_completo = nombre
                    func_obj.sucursal_codigo = sucursal.sucursal_codigo
                    func_obj.socio_numero = socio
                    func_obj.cumpleanos = cumpleanos
                    func_obj.fecha_ingreso = ingreso
                    func_obj.cargo = cargo
                    func_obj.nomina = nomina
                    func_obj.plus = plus
                    func_obj.activo = True
                    updated += 1
                else:
                    nuevo = Funcionario(
                        cedula=ci_str,
                        nombre_completo=nombre,
                        sucursal_codigo=sucursal.sucursal_codigo,
                        socio_numero=socio,
                        cumpleanos=cumpleanos,
                        fecha_ingreso=ingreso,
                        cargo=cargo,
                        nomina=nomina,
                        plus=plus,
                        activo=True,
                        tipo='funcionario'
                    )
                    db.session.add(nuevo)
                    added += 1
                    
        db.session.commit()
        return jsonify({'message': f'Carga exitosa. Agregados: {added}, Actualizados: {updated}'})
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': f'Error procesando excel: {str(e)}'}), 500


@funcionarios_bp.route('/funcionarios/upload_directivos', methods=['POST'])
@jwt_required()
def upload_directivos():
    if 'file' not in request.files:
        return jsonify({'error': 'No se proporcionó ningún archivo'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No se seleccionó ningún archivo'}), 400
    
    try:
        content = file.read()
        # Read without header to process custom structure
        df = pd.read_excel(io.BytesIO(content), header=None)
        
        # Ensure 'DIRECTIVOS' sucursal exists
        sucursal = Sucursal.query.filter_by(sucursal_nombre='DIRECTIVOS').first()
        if not sucursal:
            # Find next code
            max_code = db.session.query(func.max(Sucursal.sucursal_codigo)).scalar() or 0
            sucursal = Sucursal(sucursal_codigo=max_code + 1, sucursal_nombre='DIRECTIVOS')
            db.session.add(sucursal)
            db.session.commit()
            
        added = 0
        updated = 0
        current_group = "DIRECTIVO"
        
        for i, row in df.iterrows():
            val_a = str(row[0]).strip().upper() if not pd.isna(row[0]) else ""
            val_b = str(row[1]).strip().upper() if not pd.isna(row[1]) else ""
            
            # Detect group headers (usually green background in screenshot, but we see the text)
            # Headers like "CONSEJO ADMINISTRATIVO", "JUNTA DE VIGILANCIA", etc.
            # They usually don't have a number in column A or have 'TOTALES'
            
            if "TOTALES" in val_a or "TOTALES" in val_b:
                continue
                
            # If Column B has text but Column A is empty or contains non-numeric header text
            if val_b and not val_a.replace('.', '').isdigit():
                # Potential header
                if val_b not in ["NOMBRE Y APELLIDO", "DIETA FEBRERO 2026"]:
                    current_group = val_b
                continue
                
            # Data row: Column A is numeric (Socio No)
            socio_raw = val_a.replace('.', '')
            if socio_raw.isdigit() and val_b:
                socio_no = int(socio_raw)
                nombre = val_b
                
                # For directivos, we'll use Socio No as CI (prefixed) if CI is unknown
                # But to keep it consistent with the system, we'll use the Socio No as CI directly
                # assuming they won't collide or just use "DIR_" prefix
                ci_str = f"D_{socio_no}"
                
                func_obj = Funcionario.query.get(ci_str)
                if func_obj:
                    func_obj.nombre_completo = nombre
                    func_obj.socio_numero = socio_no
                    func_obj.cargo = current_group
                    func_obj.tipo = 'directivo'
                    func_obj.activo = True
                    updated += 1
                else:
                    nuevo = Funcionario(
                        cedula=ci_str,
                        nombre_completo=nombre,
                        sucursal_codigo=sucursal.sucursal_codigo,
                        socio_numero=socio_no,
                        cargo=current_group,
                        tipo='directivo',
                        activo=True
                    )
                    db.session.add(nuevo)
                    added += 1
                    
        db.session.commit()
        return jsonify({'message': f'Carga de directivos exitosa. Agregados: {added}, Actualizados: {updated}'})
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': f'Error procesando excel de directivos: {str(e)}'}), 500


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
