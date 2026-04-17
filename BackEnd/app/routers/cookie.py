from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.schemas.cookie import CookieEntrada, CookieRespuesta
from app.services.cookie import obtener_consentimiento, guardar_consentimiento

router = APIRouter()

@router.get("/cookies/consentimiento", response_model=CookieRespuesta)
def get_consentimiento(
    usuario_id: UUID | None = None,
    clave_sesion: str | None = None,
    db: Session = Depends(get_db)
):
    return obtener_consentimiento(usuario_id, clave_sesion, db)


@router.post("/cookies/consentimiento", response_model=CookieRespuesta)
def post_consentimiento(
    datos: CookieEntrada,
    request: Request,
    db: Session = Depends(get_db)
):
    return guardar_consentimiento(
        aceptado=datos.aceptado,
        request=request,
        db=db,
        usuario_id=datos.usuario_id,
        clave_sesion=datos.clave_sesion,
    )