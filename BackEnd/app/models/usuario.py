from sqlalchemy import Column, String, Boolean, TIMESTAMP, Enum
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum
from app.core.database import Base

class RolUsuario(str, enum.Enum):
    administrador  = "administrador"
    paciente       = "paciente"
    cirujano       = "cirujano"
    anestesiologo  = "anestesiologo"
    asistente      = "asistente"
    
class Usuario(Base):
    __tablename__ = "usuarios"

    id              = Column(UUID(as_uuid=True), primary_key=True)
    correo          = Column(String(255), nullable=False)
    hash_contrasena = Column(String(255), nullable=False)
    rol             = Column(Enum(RolUsuario), nullable=False)
    nombre          = Column(String(100), nullable=False)
    apellido        = Column(String(100), nullable=False)
    telefono        = Column(String(20))
    activo          = Column(Boolean, nullable=False)
    creado_en       = Column(TIMESTAMP(timezone=True), nullable=False)
    actualizado_en  = Column(TIMESTAMP(timezone=True), nullable=False)