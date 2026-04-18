from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import usuarios, auth, cirugias, documentos, listas, cookie
from app.core.config import settings

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

app.include_router(
    listas.router,
    prefix="/api/v1",
    tags=["Listas"]
)

app.include_router(
    cookie.router,
    prefix="/api/v1",
    tags=["Cookies"]
)

@app.get("/", tags=["Root"])
def root():
    return {"mensaje": f"Bienvenido a {settings.APP_NAME}"}