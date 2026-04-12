from sqlalchemy import Column, String, Date, Boolean, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class Paciente(Base):
    __tablename__ = "pacientes"

    id                    = Column(UUID(as_uuid=True), primary_key=True)
    usuario_id            = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    fecha_nacimiento      = Column(Date, nullable=False)
    numero_identificacion = Column(String(50), nullable=False)
    tipo_sangre           = Column(String(5))
    alergias              = Column(String)
    notas_medicas         = Column(String)
    creado_en             = Column(TIMESTAMP(timezone=True), nullable=False)
    actualizado_en        = Column(TIMESTAMP(timezone=True), nullable=False)