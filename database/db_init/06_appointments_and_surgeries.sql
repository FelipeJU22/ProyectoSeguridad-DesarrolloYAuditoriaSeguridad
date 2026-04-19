-- ============================================================
-- Citas y cirugías
-- Depende de: 03_tablas_principales.sql, 04_tablas_personal_medico.sql, 05_catalogo_cirugias.sql
-- ============================================================

-- Un paciente solicita una cita que puede convertirse en una cirugía
CREATE TABLE citas (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id         UUID NOT NULL REFERENCES pacientes(id),
    tipo_cirugia        VARCHAR(100) NOT NULL, 
    fecha_solicitada    DATE NOT NULL,
    estado              estado_cita NOT NULL DEFAULT 'pendiente',
    notas               TEXT,
    revisado_por        UUID REFERENCES usuarios(id),   -- administrador que aprobó/rechazó
    revisado_en         TIMESTAMPTZ,
    creado_en           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Entidad central de cirugía
CREATE TABLE cirugias (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cita_id                     UUID UNIQUE REFERENCES citas(id),  -- puede ser NULL si se crea directamente por admin
    paciente_id                 UUID NOT NULL REFERENCES pacientes(id),
    tipo_cirugia                VARCHAR(100) NOT NULL, 
    cirujano_id                 UUID NOT NULL REFERENCES cirujanos(id),
    anestesiologo_id            UUID NOT NULL REFERENCES anestesiologos(id),
    fecha_programada            TIMESTAMPTZ NOT NULL,
    duracion_estimada_min       INT,
    sala_operaciones            VARCHAR(50),
    estado                      estado_cirugia NOT NULL DEFAULT 'programada',
    notas                       TEXT,
    creado_por                  UUID NOT NULL REFERENCES usuarios(id),
    creado_en                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Relación muchos-a-muchos: asistentes asignados a una cirugía
CREATE TABLE cirugia_asistentes (
    cirugia_id      UUID NOT NULL REFERENCES cirugias(id) ON DELETE CASCADE,
    asistente_id    UUID NOT NULL REFERENCES asistentes(id),
    asignado_en     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (cirugia_id, asistente_id)
);