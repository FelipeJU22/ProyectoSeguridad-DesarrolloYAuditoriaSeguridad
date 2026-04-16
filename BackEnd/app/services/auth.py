import bcrypt
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.usuario import Usuario
from app.schemas.auth import LoginRespuesta, TokenRespuesta, ROL_A_NUMERO

def verificar_contrasena(contrasena_plana: str, hash_guardado: str) -> bool:
    hash_corregido = hash_guardado.replace("$2a$", "$2b$", 1)
    return bcrypt.checkpw(
        contrasena_plana.encode("utf-8"),
        hash_corregido.encode("utf-8")
    )

def verificar_token_2fa(token_2fa: str) -> bool:
    return token_2fa == "token12345"

def login_usuario(correo: str, contrasena: str, db: Session) -> TokenRespuesta:
    
    usuario = db.query(Usuario).filter(Usuario.correo == correo).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos"
        )

    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo, contacte al administrador"
        )

    if not verificar_contrasena(contrasena, usuario.hash_contrasena):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos"
        )

    return TokenRespuesta(
        requires2FA = True,
        challengeId= "challenge12345"
    )

def login_2fa_function(correo: str, token_2fa: str, db: Session) -> LoginRespuesta:
    if not verificar_token_2fa(token_2fa):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Código de autenticación incorrecto"
        )
    usuario = db.query(Usuario).filter(Usuario.correo == correo).first()
    return LoginRespuesta(
        id=usuario.id,
        nombre=usuario.nombre,
        apellido=usuario.apellido,
        correo=usuario.correo,
        telefono=usuario.telefono,
        rol=ROL_A_NUMERO[usuario.rol]
    )
