from fastapi import APIRouter, Depends, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.models.documento import TipoDocumento
from app.schemas.documento import DocumentoRespuesta
from app.services.documentos import obtener_documentos_paciente, subir_documento, obtener_ruta_documento, eliminar_documento
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Security

bearer_scheme = HTTPBearer()

router = APIRouter()

@router.get("/documentos/paciente/{usuario_id}", response_model=list[DocumentoRespuesta])
def get_documentos_paciente(usuario_id: UUID, db: Session = Depends(get_db)):
    return obtener_documentos_paciente(usuario_id, db)

@router.post("/documentos/subir", response_model=DocumentoRespuesta)
def post_subir_documento(
    tipo_documento: TipoDocumento = Form(...),
    archivo: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme),
    db: Session = Depends(get_db)
):
    return subir_documento(credentials.credentials, tipo_documento, archivo, db)

@router.get("/documentos/{documento_id}/ver")
def get_ver_documento(documento_id: UUID, usuario_id: UUID, db: Session = Depends(get_db)):
    ruta = obtener_ruta_documento(documento_id, usuario_id, db)
    return FileResponse(
        path=ruta,
        media_type="application/pdf",
        headers={"Content-Disposition": "inline"}
    )

@router.delete("/documentos/{documento_id}")
def delete_documento(documento_id: UUID, credentials: HTTPAuthorizationCredentials = Security(bearer_scheme), db: Session = Depends(get_db)):
    return eliminar_documento(credentials.credentials, documento_id, db)