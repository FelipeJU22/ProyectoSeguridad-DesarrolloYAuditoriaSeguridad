from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import usuarios, auth, cirugias, documentos
from app.core.config import settings

from app.models import usuario, paciente, cirugia, tipo_cirugia, cirujano, anestesiologo, asistente, documento

app = FastAPI(
    title=settings.APP_NAME,
    description="Aprendiendo FastAPI paso a paso",
    version=settings.APP_VERSION
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    usuarios.router,
    prefix="/api/v1",
    tags=["Usuarios"]
)

app.include_router(
    auth.router,
    prefix="/api/v1",
    tags=["Autenticación"]
)

app.include_router(
    cirugias.router,
    prefix="/api/v1",
    tags=["Cirugías"]
)

app.include_router(
    documentos.router,
    prefix="/api/v1",
    tags=["Documentos"]
)

@app.get("/", tags=["Root"])
def root():
    return {"mensaje": f"Bienvenido a {settings.APP_NAME}"}