from sqlalchemy import Column, String, Integer, TIMESTAMP, ForeignKey, Enum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class EstadoCirugia(str, enum.Enum):
    programada   = "programada"
    en_progreso  = "en_progreso"
    completada   = "completada"
    cancelada    = "cancelada"
    pospuesta    = "pospuesta"

class Cirugia(Base):
    __tablename__ = "cirugias"

    id                    = Column(UUID(as_uuid=True), primary_key=True)
    paciente_id           = Column(UUID(as_uuid=True), ForeignKey("pacientes.id"), nullable=False)
    tipo_cirugia_id       = Column(UUID(as_uuid=True), ForeignKey("tipos_cirugia.id"), nullable=False)
    cirujano_id           = Column(UUID(as_uuid=True), ForeignKey("cirujanos.id"), nullable=False)
    anestesiologo_id      = Column(UUID(as_uuid=True), ForeignKey("anestesiologos.id"), nullable=False)
    fecha_programada      = Column(TIMESTAMP(timezone=True), nullable=False)
    duracion_estimada_min = Column(Integer)
    sala_operaciones      = Column(String(50))
    estado                = Column(Enum(EstadoCirugia), nullable=False)
    notas                 = Column(Text)
    creado_en             = Column(TIMESTAMP(timezone=True), nullable=False)
    actualizado_en        = Column(TIMESTAMP(timezone=True), nullable=False)

    tipo_cirugia  = relationship("TipoCirugia", foreign_keys=[tipo_cirugia_id])
    cirujano      = relationship("Cirujano", foreign_keys=[cirujano_id])
    anestesiologo = relationship("Anestesiologo", foreign_keys=[anestesiologo_id])
    asistentes    = relationship("CirugiaAsistente", back_populates="cirugia")

class CirugiaAsistente(Base):
    __tablename__ = "cirugia_asistentes"

    cirugia_id   = Column(UUID(as_uuid=True), ForeignKey("cirugias.id"), primary_key=True)
    asistente_id = Column(UUID(as_uuid=True), ForeignKey("asistentes.id"), primary_key=True)
    asignado_en  = Column(TIMESTAMP(timezone=True), nullable=False)

    cirugia   = relationship("Cirugia", back_populates="asistentes")
    asistente = relationship("Asistente", foreign_keys=[asistente_id])