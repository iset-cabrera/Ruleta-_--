# 📋 Instrucciones de Instalación y Configuración

## 🔧 Backend (Flask)

### 1. Navegar a la carpeta backend
```bash
cd backend
```

### 2. Crear entorno virtual
```bash
python -m venv venv
```

### 3. Activar el entorno virtual
**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 4. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 5. Configurar base de datos PostgreSQL

Asegúrate de tener PostgreSQL instalado y ejecutándose.

**Crear la base de datos:**
```sql
CREATE DATABASE sorteos;
```

**Ejecutar las migraciones:**
```bash
psql -U postgres -d sorteos -f migrations/001_create_usuarios_eventos.sql
```

### 6. Configurar variables de entorno (opcional)

Crear archivo `.env` en la carpeta `backend` (opcional, ya hay valores por defecto):
```
DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/sorteos
JWT_SECRET_KEY=tu-super-secreto-cambialo-en-produccion-2025
FLASK_DEBUG=True
```

### 7. Ejecutar el servidor
```bash
python app.py
```

El backend estará corriendo en: `http://localhost:2000`

---

## 🎨 Frontend (React + Vite)

### 1. Navegar a la carpeta frontend
```bash
cd ruleta-frontend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar API URL

Editar el archivo `src/config/api.js` y cambiar la URL si es necesario:
```javascript
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:2000";
```

O crear archivo `.env` en `ruleta-frontend`:
```
VITE_API_URL=http://localhost:2000
```

### 4. Ejecutar en modo desarrollo
```bash
npm run dev
```

El frontend estará corriendo en: `http://localhost:5173`

### 5. Compilar para producción (opcional)
```bash
npm run build
```

---

## 🔐 Credenciales de Administrador por Defecto

- **Usuario:** `admin`
- **Contraseña:** `admin123`

⚠️ **IMPORTANTE:** Cambia la contraseña después del primer login.

---

## 📊 Cargar Datos de Funcionarios

Si tienes un archivo Excel con funcionarios, puedes usar el script `Alzarfuncionario.py`:

1. Editar la ruta del archivo Excel en `Alzarfuncionario.py`
2. Ejecutar:
```bash
python Alzarfuncionario.py
```

---

## ✅ Verificación

1. **Backend:** Abrir `http://localhost:2000` - Debería mostrar mensaje de API running
2. **Frontend:** Abrir `http://localhost:5173` - Debería mostrar la ruleta
3. **Login:** Ir a `http://localhost:5173/login` e iniciar sesión con las credenciales por defecto

---

## 🚀 Uso del Sistema

### Crear un Evento

1. Ir al panel admin: `/login` → Iniciar sesión → `/admin`
2. Click en "Eventos" en el menú lateral
3. Click en "➕ Crear Evento"
4. Llenar el formulario:
   - Nombre del evento
   - Descripción (opcional)
   - Fecha del evento
   - Cantidad de ganadores esperados
   - Permitir reganar (opcional)
5. Click en "Crear Evento"

### Realizar un Sorteo

1. Ir a la página principal: `/`
2. Debería mostrar el evento activo
3. Click en "¡Girar Ruleta!"
4. El ganador se registrará automáticamente

### Ver Ganadores

- En la página principal se muestra el historial del evento activo
- En el panel admin → Eventos → Ver Ganadores

---

## 🔧 Solución de Problemas

### Backend no inicia
- Verificar que PostgreSQL está corriendo
- Verificar credenciales de base de datos
- Verificar que el puerto 2000 no esté en uso

### Frontend no conecta con backend
- Verificar que backend está corriendo
- Verificar URL en `src/config/api.js`
- Verificar CORS en backend

### No puedo iniciar sesión
- Verificar que las migraciones se ejecutaron correctamente
- Verificar que el usuario admin existe en la base de datos

---

## 📝 Notas Adicionales

- El backend usa el puerto **2000** por defecto
- El frontend usa el puerto **5173** por defecto (Vite)
- Los tokens JWT expiran en **8 horas**
- Solo puede haber **un evento activo** a la vez
- Un funcionario no puede ganar dos veces en el mismo evento (a menos que el evento permita reganar)

---

## 🆘 Soporte

Para más información, revisa los archivos:
- `backend/README.md`
- `ruleta-frontend/README.md`

