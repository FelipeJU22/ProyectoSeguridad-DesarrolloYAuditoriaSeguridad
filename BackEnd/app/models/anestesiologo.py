from sqlalchemy import Column, String, Boolean, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class Anestesiologo(Base):
    __tablename__ = "anestesiologos"

    id              = Column(UUID(as_uuid=True), primary_key=True)
    usuario_id      = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    numero_licencia = Column(String(100), nullable=False)
    disponible      = Column(Boolean, nullable=False)
    creado_en       = Column(TIMESTAMP(timezone=True), nullable=False)
    actualizado_en  = Column(TIMESTAMP(timezone=True), nullable=False)

    usuario = relationship("Usuario", foreign_keys=[usuario_id])