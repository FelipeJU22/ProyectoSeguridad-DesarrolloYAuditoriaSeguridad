-- ============================================================
-- Enumeraciones
-- ============================================================

CREATE TYPE rol_usuario AS ENUM (
    'administrador',
    'paciente',
    'cirujano',
    'anestesiologo',
    'asistente'
);

CREATE TYPE estado_cirugia AS ENUM (
    'programada',
    'en_progreso',
    'completada',
    'cancelada',
    'pospuesta'
);

CREATE TYPE estado_cita AS ENUM (
    'pendiente',
    'aprobada',
    'rechazada',
    'cancelada'
);

CREATE TYPE tipo_documento AS ENUM (
    'poliza_seguro',
    'nota_medica',
    'consentimiento_informado',
    'resultado_laboratorio',
    'otro'
);
