import uuid
import os
from datetime import datetime
from fastapi import HTTPException, status, UploadFile
from sqlalchemy.orm import Session
from app.models.documento import Documento, TipoDocumento
from app.models.paciente import Paciente
from app.schemas.documento import DocumentoRespuesta
from app.services.cirugias import obtener_paciente_por_usuario

CARPETA_BASE = "/app/documentos"

def obtener_documentos_paciente(usuario_id: uuid.UUID, db: Session) -> list[DocumentoRespuesta]:
    paciente = obtener_paciente_por_usuario(usuario_id, db)
    documentos = db.query(Documento).filter(Documento.paciente_id == paciente.id).all()
    return documentos

def subir_documento(
    usuario_id: uuid.UUID,
    tipo_documento: TipoDocumento,
    archivo: UploadFile,
    db: Session
) -> DocumentoRespuesta:

    # Validar que sea PDF
    if archivo.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se permiten archivos PDF"
        )

    paciente = obtener_paciente_por_usuario(usuario_id, db)

    # Crear carpeta del paciente si no existe
    carpeta_paciente = os.path.join(CARPETA_BASE, str(paciente.id))
    os.makedirs(carpeta_paciente, exist_ok=True)

    # Nombre único para evitar colisiones
    nombre_unico = f"{uuid.uuid4()}_{archivo.filename}"
    ruta_completa = os.path.join(carpeta_paciente, nombre_unico)

    # Leer y guardar el archivo
    contenido = archivo.file.read()
    tamano_bytes = len(contenido)

    with open(ruta_completa, "wb") as f:
        f.write(contenido)

    ruta_relativa = ruta_completa.replace("/app/", "")

    # Guardar en base de datos
    nuevo_documento = Documento(
        id=uuid.uuid4(),
        nombre_archivo=archivo.filename,
        ruta_almacenamiento=ruta_completa,
        tipo_documento=tipo_documento,
        tamano_bytes=tamano_bytes,
        paciente_id=paciente.id,
        subido_por=usuario_id,
        creado_en=datetime.now()
    )
    db.add(nuevo_documento)
    db.commit()
    db.refresh(nuevo_documento)
    return nuevo_documento

def obtener_ruta_documento(documento_id: uuid.UUID, usuario_id: uuid.UUID, db: Session) -> str:
    paciente = obtener_paciente_por_usuario(usuario_id, db)

    documento = db.query(Documento).filter(
        Documento.id == documento_id,
        Documento.paciente_id == paciente.id
    ).first()

    if not documento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento no encontrado"
        )
    ruta_real = os.path.join("/app", documento.ruta_almacenamiento)

    if not os.path.exists(ruta_real):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El archivo no existe en el servidor"
        )

    return documento.ruta_almacenamiento

def eliminar_documento(documento_id: uuid.UUID, usuario_id: uuid.UUID, db: Session) -> dict:
    paciente = obtener_paciente_por_usuario(usuario_id, db)

    documento = db.query(Documento).filter(
        Documento.id == documento_id,
        Documento.paciente_id == paciente.id
    ).first()

    if not documento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento no encontrado"
        )
    ruta_real = os.path.join("/app", documento.ruta_almacenamiento)

    # Eliminar el archivo físico
    if os.path.exists(ruta_real):
        os.remove(ruta_real)

    db.delete(documento)
    db.commit()
    return {"mensaje": "Documento eliminado"}