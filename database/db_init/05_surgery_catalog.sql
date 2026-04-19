-- ============================================================
-- Catálogo de tipos de cirugía
-- (catálogo independiente, sin dependencias FK)
-- ============================================================

CREATE TABLE tipos_cirugia (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre                      VARCHAR(150) NOT NULL UNIQUE,
    descripcion                 TEXT,
    duracion_estimada_minutos   INT,
    activo                      BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en                   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
