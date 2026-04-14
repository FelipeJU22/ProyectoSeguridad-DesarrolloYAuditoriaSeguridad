-- ============================================================
-- Triggers
-- Depende de: todos los archivos de tablas
-- ============================================================

CREATE OR REPLACE FUNCTION fn_actualizar_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con columna actualizado_en
CREATE TRIGGER trg_usuarios_actualizado_en
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_actualizado_en();

CREATE TRIGGER trg_pacientes_actualizado_en
    BEFORE UPDATE ON pacientes
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_actualizado_en();

CREATE TRIGGER trg_cirujanos_actualizado_en
    BEFORE UPDATE ON cirujanos
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_actualizado_en();

CREATE TRIGGER trg_anestesiologos_actualizado_en
    BEFORE UPDATE ON anestesiologos
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_actualizado_en();

CREATE TRIGGER trg_asistentes_actualizado_en
    BEFORE UPDATE ON asistentes
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_actualizado_en();

CREATE TRIGGER trg_citas_actualizado_en
    BEFORE UPDATE ON citas
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_actualizado_en();

CREATE TRIGGER trg_cirugias_actualizado_en
    BEFORE UPDATE ON cirugias
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_actualizado_en();