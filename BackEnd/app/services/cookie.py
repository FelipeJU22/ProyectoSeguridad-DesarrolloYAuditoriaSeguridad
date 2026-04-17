from sqlalchemy.orm import Session
from fastapi import Request
from uuid import UUID
from app.models.consentimiento_cookie import ConsentimientoCookie
from app.schemas.cookie import CookieRespuesta

def obtener_consentimiento(
    usuario_id: UUID | None,
    clave_sesion: str | None,
    db: Session
) -> CookieRespuesta:
    """Get the latest cookie decision for a user or anonymous session."""
    registro = None

    if usuario_id:
        registro = (
            db.query(ConsentimientoCookie)
            .filter(ConsentimientoCookie.usuario_id == usuario_id)
            .order_by(ConsentimientoCookie.consentido_en.desc())
            .first()
        )
    elif clave_sesion:
        registro = (
            db.query(ConsentimientoCookie)
            .filter(ConsentimientoCookie.clave_sesion == clave_sesion)
            .order_by(ConsentimientoCookie.consentido_en.desc())
            .first()
        )

    if not registro:
        return CookieRespuesta(aceptado=False, hay_decision=False)

    return CookieRespuesta(aceptado=registro.aceptado, hay_decision=True)


def guardar_consentimiento(
    aceptado: bool,
    request: Request,
    db: Session,
    usuario_id: UUID | None = None,
    clave_sesion: str | None = None,
) -> CookieRespuesta:
    """Save a new cookie consent record."""
    ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    registro = ConsentimientoCookie(
        usuario_id=usuario_id,
        clave_sesion=clave_sesion,
        aceptado=aceptado,
        direccion_ip=ip,
        agente_usuario=user_agent,
    )
    db.add(registro)
    db.commit()

    return CookieRespuesta(aceptado=aceptado, hay_decision=True)