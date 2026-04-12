from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.schemas.cirugia import CirugiaRespuesta, CambioFechaEntrada, CancelarCirugiasEntrada
from app.services.cirugias import obtener_cirugias_paciente, cambiar_fecha_cirugia, cancelar_cirugias

router = APIRouter()

@router.get("/cirugias/paciente/{usuario_id}", response_model=list[CirugiaRespuesta])
def get_cirugias_paciente(usuario_id: UUID, db: Session = Depends(get_db)):
    return obtener_cirugias_paciente(usuario_id, db)

@router.put("/cirugias/{cirugia_id}/fecha", response_model=CirugiaRespuesta)
def put_fecha_cirugia(cirugia_id: UUID, datos: CambioFechaEntrada, usuario_id: UUID, db: Session = Depends(get_db)):
    return cambiar_fecha_cirugia(usuario_id, cirugia_id, datos.fecha_nueva, db)

@router.patch("/cirugias/cancelar", status_code=status.HTTP_200_OK)
def patch_cancelar_cirugias(datos: CancelarCirugiasEntrada, usuario_id: UUID, db: Session = Depends(get_db)):
    return cancelar_cirugias(usuario_id, datos.cirugia_ids, db)