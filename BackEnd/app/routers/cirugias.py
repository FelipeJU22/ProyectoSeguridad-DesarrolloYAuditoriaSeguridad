from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.schemas.cirugia import CirugiaRespuesta, CambioFechaEntrada, CancelarCirugiasEntrada, CirugiaCrearEntrada, CirugiaEditarEntrada, CambioEstadoEntrada
from app.services.cirugias import obtener_cirugias_paciente, cambiar_fecha_cirugia, cancelar_cirugias,obtener_cirugias_cirujano, crear_cirugia, editar_cirugia, obtener_cirugias_anestesiologo, obtener_cirugias_asistente, cambiar_estado_cirugia

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

@router.get("/cirugias/cirujano/{usuario_id}", response_model=list[CirugiaRespuesta])
def get_cirugias_cirujano(usuario_id: UUID, db: Session = Depends(get_db)):
    return obtener_cirugias_cirujano(usuario_id, db)

@router.post("/cirugias", response_model=CirugiaRespuesta, status_code=status.HTTP_201_CREATED)
def post_crear_cirugia(datos: CirugiaCrearEntrada, usuario_id: UUID, db: Session = Depends(get_db)):
    return crear_cirugia(usuario_id, datos, db)

@router.put("/cirugias/{cirugia_id}", response_model=CirugiaRespuesta)
def put_editar_cirugia(cirugia_id: UUID, datos: CirugiaEditarEntrada, usuario_id: UUID, db: Session = Depends(get_db)):
    return editar_cirugia(usuario_id, cirugia_id, datos, db)

@router.get("/cirugias/anestesiologo/{usuario_id}", response_model=list[CirugiaRespuesta])
def get_cirugias_anestesiologo(usuario_id: UUID, db: Session = Depends(get_db)):
    return obtener_cirugias_anestesiologo(usuario_id, db)

@router.get("/cirugias/asistente/{usuario_id}", response_model=list[CirugiaRespuesta])
def get_cirugias_asistente(usuario_id: UUID, db: Session = Depends(get_db)):
    return obtener_cirugias_asistente(usuario_id, db)

@router.patch("/cirugias/{cirugia_id}/estado", response_model=CirugiaRespuesta)
def patch_estado_cirugia(cirugia_id: UUID, datos: CambioEstadoEntrada, usuario_id: UUID, db: Session = Depends(get_db)):
    return cambiar_estado_cirugia(usuario_id, cirugia_id, datos.estado, db)