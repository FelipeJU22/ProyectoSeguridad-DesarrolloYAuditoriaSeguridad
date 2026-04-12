from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from app.models.cirugia import EstadoCirugia

class AsistenteEnCirugia(BaseModel):
    id:      UUID
    nombre:  str
    apellido: str

    class Config:
        from_attributes = True

class CirugiaRespuesta(BaseModel):
    id:                     UUID
    tipo_cirugia:           str
    fecha_programada:       datetime
    duracion_estimada_min:  int | None
    sala_operaciones:       str | None
    estado:                 EstadoCirugia
    notas:                  str | None
    paciente_nombre:        str
    paciente_apellido:      str
    anestesiologo_id:       UUID
    cirujano_nombre:        str
    cirujano_apellido:      str
    anestesiologo_nombre:   str
    anestesiologo_apellido: str
    asistentes:             list[AsistenteEnCirugia]

    class Config:
        from_attributes = True

class CambioFechaEntrada(BaseModel):
    fecha_nueva: datetime

class CancelarCirugiasEntrada(BaseModel):
    cirugia_ids: list[UUID]

class CirugiaCrearEntrada(BaseModel):
    paciente_id:           UUID
    tipo_cirugia:          str
    fecha_programada:      datetime
    anestesiologo_id:      UUID
    asistente_ids:         list[UUID] = []
    duracion_estimada_min: int | None = None
    notas:                 str | None = None

class CirugiaEditarEntrada(BaseModel):
    tipo_cirugia:          str
    fecha_programada:      datetime
    anestesiologo_id:      UUID
    asistente_ids:         list[UUID] = []
    duracion_estimada_min: int | None = None
    notas:                 str | None = None
