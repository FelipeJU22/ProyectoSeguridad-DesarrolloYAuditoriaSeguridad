from sqlalchemy import Column, String, BigInteger, TIMESTAMP, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import enum

class TipoDocumento(str, enum.Enum):
    poliza_seguro             = "poliza_seguro"
    nota_medica               = "nota_medica"
    consentimiento_informado  = "consentimiento_informado"
    resultado_laboratorio     = "resultado_laboratorio"
    otro                      = "otro"

class Documento(Base):
    __tablename__ = "documentos"

    id                  = Column(UUID(as_uuid=True), primary_key=True)
    nombre_archivo      = Column(String(255), nullable=False)
    ruta_almacenamiento = Column(String(500), nullable=False)
    tipo_documento      = Column(Enum(TipoDocumento), nullable=False)
    tamano_bytes        = Column(BigInteger)
    paciente_id         = Column(UUID(as_uuid=True), ForeignKey("pacientes.id"), nullable=True)
    subido_por          = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    creado_en           = Column(TIMESTAMP(timezone=True), nullable=False)