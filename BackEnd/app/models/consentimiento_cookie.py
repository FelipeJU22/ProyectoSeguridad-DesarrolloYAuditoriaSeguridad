from sqlalchemy import Column, String, Boolean, TIMESTAMP, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, INET
from sqlalchemy.sql import func
import uuid
from app.core.database import Base

class ConsentimientoCookie(Base):
    __tablename__ = "consentimientos_cookies"

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id     = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True)
    clave_sesion   = Column(String(255), nullable=True)
    aceptado       = Column(Boolean, nullable=False)
    direccion_ip   = Column(INET, nullable=True)
    agente_usuario = Column(Text, nullable=True)
    consentido_en  = Column(TIMESTAMP(timezone=True), nullable=False, default=func.now())