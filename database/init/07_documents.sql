-- ============================================================
-- Documentos
-- Depende de: 03_tablas_principales.sql, 04_tablas_personal_medico.sql, 06_citas_y_cirugias.sql
-- ============================================================

-- Archivos PDF asociados a una cirugía o a un paciente
CREATE TABLE documentos (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_archivo      VARCHAR(255) NOT NULL,
    ruta_almacenamiento VARCHAR(500) NOT NULL,      -- ruta o clave en almacenamiento (ej. S3 o volumen local)
    tipo_documento      tipo_documento NOT NULL DEFAULT 'otro',
    tipo_mime           VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
    tamano_bytes        BIGINT,
    cirugia_id          UUID REFERENCES cirugias(id) ON DELETE SET NULL,
    paciente_id         UUID REFERENCES pacientes(id) ON DELETE SET NULL,
    subido_por          UUID NOT NULL REFERENCES usuarios(id),
    creado_en           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- al menos uno de los dos debe existir (cirugia o paciente)
    CONSTRAINT chk_documento_propietario CHECK (
        cirugia_id IS NOT NULL OR paciente_id IS NOT NULL
    )
);