# Sistema de Sorteos - Frontend

Aplicación React para el sistema de sorteos de Reducto con panel de administración.

## 🚀 Características

- ✅ Ruleta interactiva con animaciones
- ✅ Sistema de autenticación JWT
- ✅ Panel de administración completo
- ✅ Gestión de eventos múltiples
- ✅ Historial de ganadores por evento
- ✅ Diseño responsive y moderno

## 📋 Requisitos

- Node.js 16+
- npm o yarn

## 🔧 Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
Crear archivo `.env` en la raíz:
```
VITE_API_URL=http://192.168.10.10:2000
```

3. **Ejecutar en modo desarrollo:**
```bash
npm run dev
```

4. **Compilar para producción:**
```bash
npm run build
```

## 📱 Rutas

- `/` - Página principal con la ruleta (pública)
- `/login` - Página de inicio de sesión
- `/admin` - Panel de administración (protegida)

## 🎨 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Login.jsx
│   ├── Login.css
│   └── ProtectedRoute.jsx
├── pages/              # Páginas principales
│   ├── HomePage.jsx
│   ├── AdminPage.jsx
│   └── AdminPage.css
├── context/            # Context API
│   └── AuthContext.jsx
├── config/             # Configuraciones
│   └── api.js
├── assets/             # Recursos estáticos
│   ├── tick.mp3
│   ├── WIN.mp3
│   └── react.svg
├── App.jsx             # Componente principal con rutas
├── App.css             # Estilos globales
└── main.jsx           # Punto de entrada

public/
└── assets/
    ├── centro.png      # Logo central de la ruleta
    └── centro2.png
```

## 🔐 Autenticación

El sistema usa JWT (JSON Web Tokens) para la autenticación:
- Los tokens se almacenan en `localStorage`
- Se incluyen en todas las peticiones a rutas protegidas
- Expiran en 8 horas

## 🎯 Funcionalidades del Admin

### Dashboard
- Estadísticas generales del sistema
- Ganadores por sucursal
- Eventos recientes

### Gestión de Eventos
- Crear nuevos eventos/sorteos
- Ver todos los eventos (activos, finalizados, cancelados)
- Cambiar estado de eventos
- Ver ganadores por evento

## 🎨 Personalización

### Cambiar colores de la ruleta
En `HomePage.jsx` líneas 16-21:
```jsx
backgroundColors={["#f2d7d5", "#82e0aa", "#f8f9f9", "#82e0aa"]}
textColors={["#1f2937"]}
```

### Cambiar logo central
Reemplazar el archivo `public/assets/centro.png`

### Cambiar sonidos
Reemplazar archivos en `src/assets/`:
- `tick.mp3` - Sonido de giro
- `WIN.mp3` - Sonido de victoria

## 📦 Dependencias Principales

- **React 18** - Framework UI
- **React Router DOM 6** - Enrutamiento
- **React Custom Roulette** - Componente de ruleta
- **Axios** - Cliente HTTP
- **Vite** - Build tool

## 🚀 Deployment

Para producción, compilar y servir los archivos estáticos:

```bash
npm run build
# Los archivos estarán en la carpeta 'dist'
```

Servir con un servidor web (nginx, apache, etc) o plataforma de hosting.

## 🔧 Variables de Entorno

- `VITE_API_URL` - URL del backend API (default: http://192.168.10.10:2000)

## 📝 Notas

- El puerto de desarrollo por defecto es 5173
- Para cambiar la URL de la API, editar `src/config/api.js`
- Los archivos de audio deben estar en formato MP3
- El logo central debe ser PNG con fondo transparente
