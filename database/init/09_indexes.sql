-- ============================================================
-- Índices
-- Depende de: todos los archivos de tablas
-- ============================================================

-- Usuarios
CREATE INDEX idx_usuarios_correo   ON usuarios(correo);
CREATE INDEX idx_usuarios_rol      ON usuarios(rol);

-- Cirugías - tabla más consultada
CREATE INDEX idx_cirugias_fecha_programada     ON cirugias(fecha_programada);
CREATE INDEX idx_cirugias_paciente             ON cirugias(paciente_id);
CREATE INDEX idx_cirugias_cirujano             ON cirugias(cirujano_id);
CREATE INDEX idx_cirugias_anestesiologo        ON cirugias(anestesiologo_id);
CREATE INDEX idx_cirugias_estado               ON cirugias(estado);

-- Citas
CREATE INDEX idx_citas_paciente   ON citas(paciente_id);
CREATE INDEX idx_citas_estado     ON citas(estado);

-- Documentos
CREATE INDEX idx_documentos_cirugia  ON documentos(cirugia_id);
CREATE INDEX idx_documentos_paciente ON documentos(paciente_id);

-- Registros de auditoría
CREATE INDEX idx_registros_auditoria_usuario   ON registros_auditoria(usuario_id);
CREATE INDEX idx_registros_auditoria_accion    ON registros_auditoria(accion);
CREATE INDEX idx_registros_auditoria_creado    ON registros_auditoria(creado_en);

-- Sesiones
CREATE INDEX idx_sesiones_usuario   ON sesiones(usuario_id);
CREATE INDEX idx_sesiones_expira    ON sesiones(expira_en);

-- Intentos de login (para consultas de rate limiting)
CREATE INDEX idx_intentos_login_correo ON intentos_login(correo, intentado_en);
CREATE INDEX idx_intentos_login_ip     ON intentos_login(direccion_ip, intentado_en);