from pydantic import BaseModel
from uuid import UUID

class CookieEntrada(BaseModel):
    usuario_id:   UUID | None = None
    clave_sesion: str | None = None
    aceptado:     bool

class CookieRespuesta(BaseModel):
    aceptado:     bool
    hay_decision: bool  # False means no record found for this user/session