from sqlalchemy import Column, BigInteger, String, Boolean, TIMESTAMP
from sqlalchemy.sql import func
from app.core.database import Base


class TwoFactorChallenge(Base):
    __tablename__ = "two_factor_challenges"

    id            = Column(BigInteger, primary_key=True, autoincrement=True)
    correo        = Column(String(255), nullable=False) 
    challenge_id  = Column(String(128), nullable=False)
    token_hash    = Column(String(128), nullable=False)
    created_at    = Column(TIMESTAMP(timezone=True),nullable=False,server_default=func.now())
    expires_at    = Column(TIMESTAMP(timezone=True), nullable=False)
    used          = Column(Boolean, nullable=False, default=False)