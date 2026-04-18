import bcrypt
import resend
import os
import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, Request, status
from app.models.tokens import TwoFactorChallenge
from app.models.usuario import Usuario
from app.models.intento_login import IntentoLogin
from app.schemas.auth import LoginRespuesta, TokenRespuesta, ROL_A_NUMERO
from app.services.auditoria import registrar_accion
from app.services.sesiones import crear_sesion

MAX_INTENTOS   = 5
VENTANA_TIEMPO = timedelta(minutes=15)

def verificar_contrasena(contrasena_plana: str, hash_guardado: str) -> bool:
    hash_corregido = hash_guardado.replace("$2a$", "$2b$", 1)
    return bcrypt.checkpw(
        contrasena_plana.encode("utf-8"),
        hash_corregido.encode("utf-8")
    )

def generar_token() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"

def generar_challenge_id() -> str:
    return secrets.token_urlsafe(32)

def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

def registrar_token(correo: str, challenge_id: str, token_hash: str, db: Session):
    challenge = TwoFactorChallenge(
        correo=correo,
        challenge_id=challenge_id,
        token_hash=token_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
        used=False
    )
    db.add(challenge)
    db.commit()

def registrar_intento(correo: str, ip: str | None, exito: bool, db: Session):
    intento = IntentoLogin(correo=correo, direccion_ip=ip, exito=exito)
    db.add(intento)
    db.commit()

def verificar_bloqueo(correo: str, db: Session):
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
    registrar_accion(
        db=db,
        accion="LOGIN",
        usuario_id=usuario.id,
        nombre_tabla="usuarios",
        registro_id=usuario.id,
        direccion_ip=ip,
    )

    token_2fa    = generar_token()
    challenge_id = generar_challenge_id()

    registrar_token(
        correo=correo,
        challenge_id=challenge_id,
        token_hash=hash_token(token_2fa),
        db=db
    )

    # El codigo original se enviaba al correo del usuario,
    # pero para pruebas se envia a un correo fijo configurado en variables de entorno
    # Ya que los correos de la base de datos son fictios y no se pueden usar para enviar emails reales

    resend.api_key   = os.getenv("RESEND_API_KEY")
    resend_correo    = os.getenv("RESEND_API_EMAIL")

    r = resend.Emails.send({
        "from": "onboarding@resend.dev",
        "to": resend_correo,
        "subject": "Codigo de verificacion Hospital TEC",
        "html": f"""
            <div style="font-family: Arial, sans-serif;">
                <h2>Verificación de acceso</h2>
                <p>Tu código de verificación es:</p>
                <h1 style="letter-spacing: 4px;">{token_2fa}</h1>
                <p>Este código expira en 10 minutos.</p>
            </div>
            """
    })

    return TokenRespuesta(requires2FA=True, challengeId=challenge_id)

# ── paso 2: verificar código 2FA y crear sesión ───────────────────────────

def login_2fa_function(challenge_id: str, token_2fa: str, ip: str | None, agente: str | None, db: Session) -> LoginRespuesta:
    db_challenge = (
        db.query(TwoFactorChallenge)
        .filter(TwoFactorChallenge.challenge_id == challenge_id)
        .first()
    )

    if not db_challenge:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Challenge no existe")

    if db_challenge.used:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token ya usado")

    if db_challenge.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expirado")

    if db_challenge.token_hash != hash_token(token_2fa):
        usuario = db.query(Usuario).filter(Usuario.correo == db_challenge.correo).first()
        if usuario:
            registrar_accion(
                db=db,
                accion="LOGIN_FALLIDO_2FA",
                usuario_id=usuario.id,
                nombre_tabla="usuarios",
                registro_id=usuario.id,
                direccion_ip=ip,
            )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token incorrecto")

    db_challenge.used = True
    db.commit()

    usuario = db.query(Usuario).filter(Usuario.correo == db_challenge.correo).first()

    token = crear_sesion(
        usuario_id=usuario.id,
        ip=ip,
        agente=agente,
        db=db,
    )

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