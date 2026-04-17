import bcrypt
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, Request, status
from app.models.usuario import Usuario
from app.models.intento_login import IntentoLogin
from app.schemas.auth import LoginRespuesta, TokenRespuesta, ROL_A_NUMERO
from app.services.auditoria import registrar_accion
from fastapi import Request
from app.services.sesiones import crear_sesion

MAX_INTENTOS   = 5
VENTANA_TIEMPO = timedelta(minutes=15)

def verificar_contrasena(contrasena_plana: str, hash_guardado: str) -> bool:
    hash_corregido = hash_guardado.replace("$2a$", "$2b$", 1)
    return bcrypt.checkpw(
        contrasena_plana.encode("utf-8"),
        hash_corregido.encode("utf-8")
    )

def verificar_token_2fa(token_2fa: str) -> bool:
    return token_2fa == "token12345"

def registrar_intento(correo: str, ip: str | None, exito: bool, db: Session):
    """Save a login attempt to the DB."""
    intento = IntentoLogin(correo=correo, direccion_ip=ip, exito=exito)
    db.add(intento)
    db.commit()

def verificar_bloqueo(correo: str, db: Session):
    """Raise 429 if the user has too many recent failed attempts."""
    desde = datetime.now(timezone.utc) - VENTANA_TIEMPO
    fallos = (
        db.query(IntentoLogin)
        .filter(
            IntentoLogin.correo == correo,
            IntentoLogin.exito == False,
            IntentoLogin.intentado_en >= desde,
        )
        .count()
    )
    if fallos >= MAX_INTENTOS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Demasiados intentos fallidos. Espere {int(VENTANA_TIEMPO.total_seconds() // 60)} minutos."
        )

def login_usuario(correo: str, contrasena: str, ip: str | None, db: Session) -> TokenRespuesta:
    verificar_bloqueo(correo, db)

    usuario = db.query(Usuario).filter(Usuario.correo == correo).first()

    if not usuario:
        registrar_intento(correo, ip, exito=False, db=db)
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
        registrar_intento(correo, ip, exito=False, db=db)
        # Audit failed login
        registrar_accion(
            db=db,
            accion="LOGIN_FALLIDO",
            usuario_id=usuario.id,
            nombre_tabla="usuarios",
            registro_id=usuario.id,
            direccion_ip=ip,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos"
        )

    registrar_intento(correo, ip, exito=True, db=db)
    # Audit successful login
    registrar_accion(
        db=db,
        accion="LOGIN",
        usuario_id=usuario.id,
        nombre_tabla="usuarios",
        registro_id=usuario.id,
        direccion_ip=ip,
    )
    return TokenRespuesta(requires2FA=True, challengeId="challenge12345")

def login_2fa_function(correo: str, token_2fa: str, ip: str | None, agente: str | None, db: Session) -> LoginRespuesta:
    """
    Verifica el código 2FA. Si es correcto, crea una sesión en BD y devuelve
    los datos del usuario junto con el JWT.
    ip y agente vienen del Request en el router.
    """
    if not verificar_token_2fa(token_2fa):
        # Auditar intento 2FA fallido
        usuario = db.query(Usuario).filter(Usuario.correo == correo).first()
        if usuario:
            registrar_accion(
                db=db,
                accion="LOGIN_FALLIDO_2FA",
                usuario_id=usuario.id,
                nombre_tabla="usuarios",
                registro_id=usuario.id,
                direccion_ip=ip,
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Código de autenticación incorrecto"
        )

    usuario = db.query(Usuario).filter(Usuario.correo == correo).first()

    # Crear sesión y obtener JWT
    token = crear_sesion(
        usuario_id=usuario.id,
        ip=ip,
        agente=agente,
        db=db,
    )

    # Auditar login exitoso completo
    registrar_accion(
        db=db,
        accion="LOGIN_EXITOSO",
        usuario_id=usuario.id,
        nombre_tabla="usuarios",
        registro_id=usuario.id,
        direccion_ip=ip,
    )

    return LoginRespuesta(
        id=usuario.id,
        nombre=usuario.nombre,
        apellido=usuario.apellido,
        correo=usuario.correo,
        telefono=usuario.telefono,
        rol=ROL_A_NUMERO[usuario.rol],
        access_token=token,
    )