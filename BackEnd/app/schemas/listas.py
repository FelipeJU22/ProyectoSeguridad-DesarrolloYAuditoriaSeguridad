from pydantic import BaseModel
from uuid import UUID

class PacienteLista(BaseModel):
    id:       UUID
    nombre:   str
    apellido: str

    class Config:
        from_attributes = True

class AnestesiologoLista(BaseModel):
    id:       UUID
    nombre:   str
    apellido: str

    class Config:
        from_attributes = True

class AsistenteLista(BaseModel):
    id:       UUID
    nombre:   str
    apellido: str

    class Config:
        from_attributes = True