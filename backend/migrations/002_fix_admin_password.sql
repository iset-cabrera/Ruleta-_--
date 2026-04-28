-- ====================================
-- MIGRACIÓN 002: Arreglar contraseña de admin
-- ====================================
-- Este script actualiza el hash de la contraseña del usuario admin
-- para que sea compatible con Werkzeug

-- Actualizar el hash de la contraseña del admin
UPDATE public.usuarios 
SET password_hash = 'scrypt:32768:8:1$PnCEPGTqCDEwN4gp$feb9879314ad4a2ddaf0ccbef8069eab6d04e0244c67e6a9482e832e5159f4358a596052db8a5f87662d6f0a064f986f97a87ed66d7f11401febb8bfa8cd2ff1'
WHERE username = 'admin';

