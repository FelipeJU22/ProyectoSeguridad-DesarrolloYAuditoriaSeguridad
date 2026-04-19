from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.listas import PacienteLista, AnestesiologoLista, AsistenteLista
from app.services.listas import obtener_pacientes, obtener_anestesiologos, obtener_asistentes

router = APIRouter()

@router.get("/listas/pacientes", response_model=list[PacienteLista])
def get_pacientes(db: Session = Depends(get_db)):
    return obtener_pacientes(db)

@router.get("/listas/anestesiologos", response_model=list[AnestesiologoLista])
def get_anestesiologos(db: Session = Depends(get_db)):
    return obtener_anestesiologos(db)

@router.get("/listas/asistentes", response_model=list[AsistenteLista])
def get_asistentes(db: Session = Depends(get_db)):
    return obtener_asistentes(db)