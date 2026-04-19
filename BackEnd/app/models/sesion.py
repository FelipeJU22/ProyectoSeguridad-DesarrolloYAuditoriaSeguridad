from sqlalchemy import Column, String, Text, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, INET
import uuid
from app.core.database import Base

class Sesion(Base):
    __tablename__ = "sesiones"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id    = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    hash_token    = Column(String(255), nullable=False, unique=True)
    direccion_ip  = Column(INET, nullable=True)
    agente_usuario = Column(Text, nullable=True)
    expira_en     = Column(TIMESTAMP(timezone=True), nullable=False)
    creado_en     = Column(TIMESTAMP(timezone=True), nullable=False)