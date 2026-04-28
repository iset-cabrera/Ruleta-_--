# Sistema de Sorteos - Backend

API RESTful para el sistema de sorteos de Reducto construida con Flask.

## 🚀 Características

- ✅ Autenticación JWT
- ✅ Sistema de eventos múltiples
- ✅ Gestión de ganadores
- ✅ Panel de administración
- ✅ PostgreSQL database

## 📋 Requisitos

- Python 3.9+
- PostgreSQL 12+

## 🔧 Instalación

1. **Crear entorno virtual:**
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

2. **Instalar dependencias:**
```bash
pip install -r requirements.txt
```

3. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Edita .env con tus configuraciones
```

4. **Ejecutar migraciones de base de datos:**
```bash
# Conectarse a PostgreSQL y ejecutar:
psql -U postgres -d sorteos -f migrations/001_create_usuarios_eventos.sql
```

5. **Ejecutar aplicación:**
```bash
python app.py
```

## 🔐 Usuario por Defecto

- **Usuario:** admin
- **Contraseña:** admin123
- ⚠️ **IMPORTANTE:** Cambia la contraseña después del primer login

## 📡 Endpoints

### Autenticación
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuario actual
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/register` - Crear usuario (requiere auth)
- `POST /api/auth/change-password` - Cambiar contraseña

### Eventos
- `GET /api/eventos` - Listar eventos
- `GET /api/eventos/:id` - Ver evento específico
- `GET /api/eventos/activo` - Obtener evento activo
- `POST /api/eventos` - Crear evento (requiere auth)
- `PUT /api/eventos/:id` - Actualizar evento (requiere auth)
- `DELETE /api/eventos/:id` - Eliminar evento (requiere auth)

### Ganadores
- `GET /api/ganadores` - Listar ganadores
- `POST /api/registrar_ganador` - Registrar ganador

### Funcionarios
- `GET /api/funcionarios` - Listar funcionarios
- `GET /api/sucursales` - Listar sucursales

### Admin
- `GET /api/admin/dashboard` - Dashboard con estadísticas
- `GET /api/admin/usuarios` - Listar usuarios

## 🏗️ Estructura del Proyecto

```
backend/
├── app.py                  # Punto de entrada
├── config.py              # Configuraciones
├── models/                # Modelos de base de datos
│   ├── funcionario.py
│   ├── ganador.py
│   ├── sucursal.py
│   ├── usuario.py
│   └── evento.py
├── routes/                # Blueprints/Rutas
│   ├── auth.py
│   ├── funcionarios.py
│   ├── ganadores.py
│   ├── eventos.py
│   └── admin.py
├── middleware/            # Middleware de autenticación
│   └── auth_middleware.py
├── migrations/            # Scripts SQL
│   └── 001_create_usuarios_eventos.sql
└── requirements.txt       # Dependencias
```

## 📝 Notas

- El puerto por defecto es 2000
- JWT tokens expiran en 8 horas
- Refresh tokens expiran en 30 días

