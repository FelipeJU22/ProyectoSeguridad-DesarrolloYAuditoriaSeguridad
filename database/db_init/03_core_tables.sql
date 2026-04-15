-- ============================================================
-- Tablas principales
-- Depende de: 02_enums.sql
-- ============================================================

-- Todos los usuarios del sistema independientemente de su rol
CREATE TABLE usuarios (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    correo          VARCHAR(255) NOT NULL UNIQUE,
    hash_contrasena VARCHAR(255) NOT NULL,           -- almacenar hash bcrypt, nunca texto plano
    rol             rol_usuario NOT NULL,
    nombre          VARCHAR(100) NOT NULL,
    apellido        VARCHAR(100) NOT NULL,
    telefono        VARCHAR(20),
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);