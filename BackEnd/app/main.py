from fastapi import FastAPI
from app.routers import usuarios, auth
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    description="Aprendiendo FastAPI paso a paso",
    version=settings.APP_VERSION
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

@app.get("/", tags=["Root"])
def root():
    return {"mensaje": f"Bienvenido a {settings.APP_NAME}"}