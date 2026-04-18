from sqlalchemy import Column, BigInteger, String, Boolean, TIMESTAMP
from sqlalchemy.dialects.postgresql import INET
from sqlalchemy.sql import func
from app.core.database import Base

class IntentoLogin(Base):
    __tablename__ = "intentos_login"

    id           = Column(BigInteger, primary_key=True, autoincrement=True)
    correo       = Column(String(255), nullable=False)
    direccion_ip = Column(INET, nullable=True)
    exito        = Column(Boolean, nullable=False, default=False)
    intentado_en = Column(TIMESTAMP(timezone=True), nullable=False, default=func.now())