from pydantic import BaseModel, EmailStr
from uuid import UUID

ROL_A_NUMERO = {
    "administrador": 0,
    "paciente":      1,
    "cirujano":      2,
    "asistente":     3,
    "anestesiologo": 4,
}

class LoginEntrada(BaseModel):
    correo:     EmailStr
    contrasena: str

class LoginRespuesta(BaseModel):
    id:       UUID
    nombre:   str
    apellido: str
    correo:   str
    telefono: str | None
    rol:      int
    access_token: str 
    token_type: str = "bearer"

    class Config:
        from_attributes = True

class TokenEntrada(BaseModel):
    challenge:  str
    token_2fa:  str

class TokenRespuesta(BaseModel):
    requires2FA: bool
    challengeId: str | None
