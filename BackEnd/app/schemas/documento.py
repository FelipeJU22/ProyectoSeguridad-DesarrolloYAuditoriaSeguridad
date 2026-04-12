from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from app.models.documento import TipoDocumento

class DocumentoRespuesta(BaseModel):
    id:                 UUID
    nombre_archivo:     str
    tipo_documento:     TipoDocumento
    tamano_bytes:       int | None
    creado_en:          datetime

    class Config:
        from_attributes = True