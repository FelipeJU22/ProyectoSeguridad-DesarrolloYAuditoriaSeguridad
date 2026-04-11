-- ============================================================
-- Tablas de seguridad
-- Depende de: 03_tablas_principales.sql
-- ============================================================

-- Seguimiento de sesiones activas (permite revocación del lado del servidor)
CREATE TABLE sesiones (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id      UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    hash_token      VARCHAR(255) NOT NULL UNIQUE,     -- hash del token de sesión/JWT
    direccion_ip    INET,
    agente_usuario  TEXT,
    expira_en       TIMESTAMPTZ NOT NULL,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Registro de auditoría para acciones sensibles (principio de seguridad por capas)
CREATE TABLE registros_auditoria (
    id              BIGSERIAL PRIMARY KEY,
    usuario_id      UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    accion          VARCHAR(100) NOT NULL,            -- ej. 'LOGIN', 'CREAR_CIRUGIA', 'ELIMINAR_DOCUMENTO'
    nombre_tabla    VARCHAR(100),
    registro_id     UUID,
    valores_anteriores JSONB,
    valores_nuevos  JSONB,
    direccion_ip    INET,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Registro de consentimiento de cookies (requerido por la política del proyecto)
CREATE TABLE consentimientos_cookies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id      UUID REFERENCES usuarios(id) ON DELETE SET NULL,  -- NULL si es anónimo
    clave_sesion    VARCHAR(255),                 -- identificador anónimo antes del login
    aceptado        BOOLEAN NOT NULL,
    direccion_ip    INET,
    agente_usuario  TEXT,
    consentido_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Intentos de inicio de sesión fallidos (protección contra fuerza bruta)
CREATE TABLE intentos_login (
    id              BIGSERIAL PRIMARY KEY,
    correo          VARCHAR(255) NOT NULL,
    direccion_ip    INET,
    exito           BOOLEAN NOT NULL DEFAULT FALSE,
    intentado_en    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);