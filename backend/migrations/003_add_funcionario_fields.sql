-- ====================================
-- MIGRACIÓN 003: Campos para gestión de funcionarios
-- ====================================

-- 1. Agregar campo activo (soft delete)
ALTER TABLE public.funcionarios 
ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;

-- 2. Agregar campo tipo (para categorización futura)
ALTER TABLE public.funcionarios 
ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'funcionario';
-- Valores posibles: 'funcionario', 'directivo', 'socio', 'administrativo'

-- 3. Agregar campos de auditoría
ALTER TABLE public.funcionarios 
ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE public.funcionarios 
ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 4. Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_funcionarios_activo ON funcionarios(activo);
CREATE INDEX IF NOT EXISTS idx_funcionarios_tipo ON funcionarios(tipo);

-- 5. Actualizar funcionarios existentes como activos
UPDATE public.funcionarios 
SET activo = true 
WHERE activo IS NULL;

-- 6. Comentarios para documentación
COMMENT ON COLUMN funcionarios.activo IS 'Indica si el funcionario está activo en el sistema';
COMMENT ON COLUMN funcionarios.tipo IS 'Categoría del funcionario: funcionario, directivo, socio, etc.';

