from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.auth import LoginEntrada, LoginRespuesta
from app.services.auth import login_usuario

router = APIRouter()

@router.post("/login", response_model=LoginRespuesta)
def login(credenciales: LoginEntrada, db: Session = Depends(get_db)):
    return login_usuario(credenciales.correo, credenciales.contrasena, db)