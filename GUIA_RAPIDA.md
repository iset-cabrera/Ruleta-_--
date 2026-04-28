# 🚀 Guía Rápida - Sistema de Sorteos v2.0

## ⚡ Inicio Rápido

### 1️⃣ Instalar Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 2️⃣ Configurar Base de Datos
```bash
# En PostgreSQL:
psql -U postgres -d sorteos -f migrations/001_create_usuarios_eventos.sql
```

### 3️⃣ Ejecutar Backend
```bash
python app.py
# Corre en: http://localhost:2000
```

### 4️⃣ Instalar Frontend
```bash
cd ruleta-frontend
npm install
```

### 5️⃣ Ejecutar Frontend
```bash
npm run dev
# Corre en: http://localhost:5173
```

---

## 🔐 Login por Defecto
```
Usuario: admin
Contraseña: admin123
```

---

## 📱 Rutas del Sistema

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/` | Ruleta de sorteo | Público |
| `/login` | Inicio de sesión | Público |
| `/admin` | Panel administrativo | Requiere login |

---

## 🎯 Flujo de Trabajo

### 👨‍💼 Como Administrador:

1. **Ir a** `http://localhost:5173/login`
2. **Iniciar sesión** con `admin` / `admin123`
3. **Crear evento** en panel admin
   - Click en "Eventos"
   - Click en "➕ Crear Evento"
   - Llenar formulario
   - Guardar
4. **El evento queda activo** automáticamente

### 🎰 Como Operador de Ruleta:

1. **Ir a** `http://localhost:5173`
2. **Ver evento activo** en la parte superior
3. **Girar ruleta** haciendo click en el botón
4. **El ganador se registra** automáticamente
5. **Ver historial** en la misma página

---

## 📊 Características Nuevas

### ✅ Lo que ANTES no tenías:
- ❌ Solo un sorteo global
- ❌ Sin login
- ❌ Sin panel admin
- ❌ Ganadores sin organizar

### ✅ Lo que AHORA tienes:
- ✅ **Múltiples eventos/sorteos**
- ✅ **Sistema de login seguro**
- ✅ **Panel admin completo**
- ✅ **Ganadores por evento**
- ✅ **Estadísticas en dashboard**
- ✅ **Gestión de eventos**

---

## 🎨 Capturas de Pantalla (Descripción)

### 1. Página Principal (Ruleta)
- Header con nombre del evento activo
- Botón "Admin" para ir al login
- Ruleta interactiva
- Botón "¡Girar Ruleta!"
- Tabla de ganadores del evento actual

### 2. Página de Login
- Fondo gradiente morado
- Formulario centrado
- Campos: Usuario y Contraseña
- Botón de inicio de sesión
- Link para volver a la ruleta

### 3. Panel Admin - Dashboard
- Sidebar con navegación
- Estadísticas en cards:
  - Total eventos
  - Total ganadores
  - Total funcionarios
  - Total sucursales
- Ganadores por sucursal
- Últimos eventos creados

### 4. Panel Admin - Eventos
- Lista de eventos en cards
- Botón "➕ Crear Evento"
- Para cada evento:
  - Nombre y descripción
  - Fecha del evento
  - Estado (badge de color)
  - Total de ganadores
  - Botones de acción

### 5. Modal Crear Evento
- Formulario completo:
  - Nombre del evento *
  - Descripción
  - Fecha del evento *
  - Cantidad de ganadores esperados
  - Checkbox: Permitir reganar
- Botones: Cancelar / Crear

---

## 🔧 Configuración Importante

### Backend (`backend/config.py`)
```python
DATABASE_URL = 'postgresql://postgres:PASSWORD@localhost:5432/sorteos'
JWT_SECRET_KEY = 'cambiar-en-produccion'
PORT = 2000
```

### Frontend (`ruleta-frontend/src/config/api.js`)
```javascript
API_URL = "http://localhost:2000"
```

---

## 🆘 Problemas Comunes

### ❌ "No hay evento activo"
**Solución:** Crear un evento en el panel admin

### ❌ Frontend no conecta
**Solución:** Verificar que backend esté corriendo en puerto 2000

### ❌ Error de login
**Solución:** Verificar que las migraciones SQL se ejecutaron

### ❌ No aparecen funcionarios
**Solución:** Cargar datos con `Alzarfuncionario.py`

---

## 📦 Estructura de Archivos Clave

```
Ruleta/
├── backend/
│   ├── app.py              ← Ejecutar esto
│   ├── config.py           ← Configuraciones
│   ├── requirements.txt    ← Dependencias
│   ├── models/             ← Base de datos
│   ├── routes/             ← Endpoints API
│   └── migrations/         ← Scripts SQL
│
├── ruleta-frontend/
│   ├── src/
│   │   ├── App.jsx         ← Router principal
│   │   ├── pages/          ← Páginas
│   │   ├── components/     ← Componentes
│   │   └── context/        ← AuthContext
│   ├── package.json        ← Dependencias
│   └── vite.config.js
│
└── DOCUMENTACION/
    ├── RESUMEN_IMPLEMENTACION.md
    ├── INSTRUCCIONES_INSTALACION.md
    └── GUIA_RAPIDA.md       ← Este archivo
```

---

## 🎯 Comandos Útiles

### Backend:
```bash
# Activar entorno virtual
venv\Scripts\activate

# Instalar nueva dependencia
pip install nombre-paquete
pip freeze > requirements.txt

# Ejecutar servidor
python app.py
```

### Frontend:
```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa producción
npm run preview
```

### Base de Datos:
```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE sorteos;

# Ejecutar migración
\i migrations/001_create_usuarios_eventos.sql

# Ver tablas
\dt
```

---

## 📞 Endpoints API Principales

### Públicos:
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/funcionarios` - Lista de funcionarios
- `GET /api/eventos/activo` - Evento activo

### Protegidos (requieren JWT):
- `POST /api/eventos` - Crear evento
- `PUT /api/eventos/:id` - Actualizar evento
- `GET /api/admin/dashboard` - Estadísticas
- `POST /api/auth/register` - Crear usuario

---

## ✨ Tips y Trucos

### 🎨 Personalizar Colores de la Ruleta
Editar `HomePage.jsx` línea 16:
```jsx
backgroundColors={["#f2d7d5", "#82e0aa", "#f8f9f9", "#82e0aa"]}
```

### 🔊 Cambiar Sonidos
Reemplazar archivos en `ruleta-frontend/src/assets/`:
- `tick.mp3` - Sonido de giro
- `WIN.mp3` - Sonido de victoria

### 🖼️ Cambiar Logo Central
Reemplazar `ruleta-frontend/public/assets/centro.png`

### 🔐 Cambiar Contraseña Admin
1. Login como admin
2. En el panel, hay opción de cambiar contraseña
3. O usar endpoint: `POST /api/auth/change-password`

### 📊 Ver Base de Datos
```sql
-- Ver todos los eventos
SELECT * FROM eventos;

-- Ver ganadores con evento
SELECT g.*, e.nombre as evento 
FROM ganadores g 
JOIN eventos e ON g.evento_id = e.id;

-- Contar ganadores por evento
SELECT e.nombre, COUNT(g.id) as total
FROM eventos e
LEFT JOIN ganadores g ON e.id = g.evento_id
GROUP BY e.nombre;
```

---

## 🚀 Listo para Producción

### Checklist:
- [ ] Cambiar `JWT_SECRET_KEY`
- [ ] Cambiar `SECRET_KEY` de Flask
- [ ] Cambiar contraseña de admin
- [ ] Configurar CORS apropiadamente
- [ ] Desactivar DEBUG en Flask
- [ ] Usar HTTPS
- [ ] Configurar backup de BD
- [ ] Compilar frontend (`npm run build`)
- [ ] Configurar servidor web (nginx/apache)

---

## 📚 Más Documentación

- **Instalación Completa:** `INSTRUCCIONES_INSTALACION.md`
- **Resumen Técnico:** `RESUMEN_IMPLEMENTACION.md`
- **Backend:** `backend/README.md`
- **Frontend:** `ruleta-frontend/README.md`

---

¡Tu sistema está listo para usar! 🎉

