from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.auth import LoginEntrada, LoginRespuesta, TokenEntrada, TokenRespuesta
from app.services.auth import login_usuario, login_2fa_function

router = APIRouter()

@router.post("/login", response_model=TokenRespuesta)
def login(credenciales: LoginEntrada, db: Session = Depends(get_db)):
    return login_usuario(credenciales.correo, credenciales.contrasena, db)


@router.post("/login_2FA", response_model=LoginRespuesta)
def login_2FA(credenciales: TokenEntrada, db: Session = Depends(get_db)):
    return login_2fa_function(credenciales.correo, credenciales.token_2fa, db)