from sqlalchemy import Column, BigInteger, String, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID, INET, JSONB
from sqlalchemy.sql import func
from app.core.database import Base

class RegistroAuditoria(Base):
    __tablename__ = "registros_auditoria"

    id                 = Column(BigInteger, primary_key=True, autoincrement=True)
    usuario_id         = Column(UUID(as_uuid=True), nullable=True)
    accion             = Column(String(100), nullable=False)
    nombre_tabla       = Column(String(100), nullable=True)
    registro_id        = Column(UUID(as_uuid=True), nullable=True)
    valores_anteriores = Column(JSONB, nullable=True)
    valores_nuevos     = Column(JSONB, nullable=True)
    direccion_ip       = Column(INET, nullable=True)
    creado_en          = Column(TIMESTAMP(timezone=True), nullable=False, default=func.now())