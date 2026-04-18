from sqlalchemy.orm import Session
from uuid import UUID
from app.models.registro_auditoria import RegistroAuditoria

def registrar_accion(
    db: Session,
    accion: str,
    usuario_id: UUID | None = None,
    nombre_tabla: str | None = None,
    registro_id: UUID | None = None,
    valores_anteriores: dict | None = None,
    valores_nuevos: dict | None = None,
    direccion_ip: str | None = None,
):
    """Central audit logger. Call this from any service after a sensitive action."""
    entrada = RegistroAuditoria(
        usuario_id=usuario_id,
        accion=accion,
        nombre_tabla=nombre_tabla,
        registro_id=registro_id,
        valores_anteriores=valores_anteriores,
        valores_nuevos=valores_nuevos,
        direccion_ip=direccion_ip,
    )
    db.add(entrada)
    db.commit()