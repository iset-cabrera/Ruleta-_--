-- ====================================
-- MIGRACIÓN 001: Sistema de Eventos y Usuarios
-- ====================================

-- 1. Crear tabla de usuarios (administradores)
CREATE TABLE IF NOT EXISTS public.usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    rol VARCHAR(20) DEFAULT 'admin',
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Crear tabla de eventos/sorteos
CREATE TABLE IF NOT EXISTS public.eventos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_evento DATE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'activo', -- activo, finalizado, cancelado
    creado_por INTEGER REFERENCES usuarios(id),
    cantidad_ganadores INTEGER DEFAULT 1,
    permite_reganar BOOLEAN DEFAULT false
);

-- 3. Agregar columna evento_id a la tabla ganadores
ALTER TABLE public.ganadores 
ADD COLUMN IF NOT EXISTS evento_id INTEGER REFERENCES eventos(id);

-- 4. Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_ganadores_evento ON ganadores(evento_id);
CREATE INDEX IF NOT EXISTS idx_ganadores_ci ON ganadores(ci);
CREATE INDEX IF NOT EXISTS idx_eventos_estado ON eventos(estado);

-- 5. Crear usuario administrador por defecto
-- Contraseña: admin123 (deberás cambiarla después del primer login)
-- Hash generado con Werkzeug
INSERT INTO public.usuarios (username, password_hash, nombre_completo, email, rol)
VALUES ('admin', 'scrypt:32768:8:1$PnCEPGTqCDEwN4gp$feb9879314ad4a2ddaf0ccbef8069eab6d04e0244c67e6a9482e832e5159f4358a596052db8a5f87662d6f0a064f986f97a87ed66d7f11401febb8bfa8cd2ff1', 'Administrador', 'admin@reducto.com', 'admin')
ON CONFLICT (username) DO NOTHING;

-- 6. Crear evento inicial para los ganadores existentes (si los hay)
INSERT INTO public.eventos (nombre, descripcion, fecha_evento, estado)
VALUES ('Sorteo Inicial', 'Evento creado automáticamente para ganadores existentes', CURRENT_DATE, 'finalizado')
ON CONFLICT DO NOTHING;

-- 7. Actualizar ganadores existentes con el evento inicial
UPDATE public.ganadores 
SET evento_id = (SELECT id FROM eventos WHERE nombre = 'Sorteo Inicial')
WHERE evento_id IS NULL;

