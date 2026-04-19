import hashlib
from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import HTTPException, status
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.sesion import Sesion


# ── helpers ────────────────────────────────────────────────────────────────

def _hash(token: str) -> str:
    """SHA-256 del token en hex. Nunca guardamos el JWT crudo."""
    return hashlib.sha256(token.encode()).hexdigest()


def _ahora() -> datetime:
    return datetime.now(timezone.utc)


def _nueva_expiracion() -> datetime:
    return _ahora() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)


# ── crear sesión (se llama al completar 2FA) ───────────────────────────────

def crear_sesion(
    usuario_id: UUID,
    ip: str | None,
    agente: str | None,
    db: Session,
) -> str:
    """
    Genera un JWT, lo registra en la tabla sesiones y devuelve el JWT.
    Si el usuario ya tenía sesiones anteriores las elimina (1 sesión activa por usuario).
    """
    ahora = _ahora()
    expira = _nueva_expiracion()

    # Generar JWT
    payload = {
        "sub": str(usuario_id),
        "iat": ahora,
        "exp": expira,
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    # Eliminar sesiones anteriores del mismo usuario (sesión única)
    db.query(Sesion).filter(Sesion.usuario_id == usuario_id).delete()

    # Registrar nueva sesión
    sesion = Sesion(
        usuario_id=usuario_id,
        hash_token=_hash(token),
        direccion_ip=ip,
        agente_usuario=agente,
        expira_en=expira,
        creado_en=ahora,
    )
    db.add(sesion)
    db.commit()

    return token


# ── validar + renovar sesión (se llama en cada acción protegida) ───────────

def validar_y_renovar_sesion(token: str, db: Session) -> UUID:
    """
    1. Decodifica el JWT (verifica firma y expiración criptográfica).
    2. Busca el hash en la tabla sesiones (verifica que no fue revocada).
    3. Comprueba la expiración del lado del servidor (la que controlamos nosotros).
    4. Renueva expira_en por otro minuto.
    Devuelve el usuario_id.
    """
    credenciales_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Sesión inválida o expirada",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # 1. Verificar firma JWT
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        usuario_id_str: str = payload.get("sub")
        if usuario_id_str is None:
            raise credenciales_error
    except JWTError:
        raise credenciales_error

    # 2. Buscar en BD por hash
    sesion = db.query(Sesion).filter(Sesion.hash_token == _hash(token)).first()
    if sesion is None:
        raise credenciales_error

    # 3. Verificar expiración del lado del servidor
    if _ahora() > sesion.expira_en:
        db.delete(sesion)
        db.commit()
        raise credenciales_error

    # 4. Renovar por otro minuto
    sesion.expira_en = _nueva_expiracion()
    db.commit()

    return UUID(usuario_id_str)


# ── revocar sesión (logout o fallo de seguridad) ───────────────────────────

def revocar_sesion(token: str, db: Session) -> None:
    """Elimina la fila de sesiones. El JWT queda huérfano (no sirve aunque no haya expirado)."""
    db.query(Sesion).filter(Sesion.hash_token == _hash(token)).delete()
    db.commit()