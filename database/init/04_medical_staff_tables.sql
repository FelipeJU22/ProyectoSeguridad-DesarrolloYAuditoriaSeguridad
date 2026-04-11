-- ============================================================
-- Tablas de perfiles médicos
-- Depende de: 03_tablas_principales.sql
-- ============================================================

-- Perfil extendido para pacientes
CREATE TABLE pacientes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id          UUID NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_nacimiento    DATE NOT NULL,
    numero_identificacion VARCHAR(50) NOT NULL UNIQUE,   -- cédula / pasaporte
    tipo_sangre         VARCHAR(5),
    alergias            TEXT,
    notas_medicas       TEXT,
    creado_en           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Perfil extendido para cirujanos
CREATE TABLE cirujanos (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id          UUID NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    numero_licencia     VARCHAR(100) NOT NULL UNIQUE,
    especialidad        VARCHAR(150) NOT NULL,
    disponible          BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Perfil extendido para anestesiólogos
CREATE TABLE anestesiologos (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id          UUID NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    numero_licencia     VARCHAR(100) NOT NULL UNIQUE,
    disponible          BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Perfil extendido para asistentes
CREATE TABLE asistentes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id          UUID NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    especialidad        VARCHAR(150),
    disponible          BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);