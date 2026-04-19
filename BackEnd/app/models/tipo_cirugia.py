from sqlalchemy import Column, String, Boolean, Integer, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class TipoCirugia(Base):
    __tablename__ = "tipos_cirugia"

    id                        = Column(UUID(as_uuid=True), primary_key=True)
    nombre                    = Column(String(150), nullable=False)
    descripcion               = Column(String)
    duracion_estimada_minutos = Column(Integer)
    activo                    = Column(Boolean, nullable=False)
    creado_en                 = Column(TIMESTAMP(timezone=True), nullable=False)