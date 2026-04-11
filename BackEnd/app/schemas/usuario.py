from pydantic import BaseModel, EmailStr
from typing import Optional

class UsuarioCrear(BaseModel):
    nombre: str
    email: EmailStr

class UsuarioRespuesta(BaseModel):
    id: int
    nombre: str
    email: str

class UsuarioActualizar(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None