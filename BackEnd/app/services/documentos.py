import uuid
import os
from datetime import datetime
from fastapi import HTTPException, status, UploadFile
from sqlalchemy.orm import Session
from app.models.documento import Documento, TipoDocumento
from app.models.paciente import Paciente
from app.schemas.documento import DocumentoRespuesta
from app.services.cirugias import obtener_paciente_por_usuario
from app.services.auditoria import registrar_accion
from app.services.sesiones import validar_y_renovar_sesion

CARPETA_BASE = "/app/documentos"

def obtener_documentos_paciente(usuario_id: uuid.UUID, db: Session) -> list[DocumentoRespuesta]:
    paciente = obtener_paciente_por_usuario(usuario_id, db)
    documentos = db.query(Documento).filter(Documento.paciente_id == paciente.id).all()
    return documentos

def subir_documento(token: str, tipo_documento: TipoDocumento, archivo: UploadFile, db: Session) -> DocumentoRespuesta:
    usuario_id = validar_y_renovar_sesion(token, db)
    if archivo.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se permiten archivos PDF"
        )

    paciente = obtener_paciente_por_usuario(usuario_id, db)

    carpeta_paciente = os.path.join(CARPETA_BASE, str(paciente.id))
    os.makedirs(carpeta_paciente, exist_ok=True)

    nombre_unico = f"{uuid.uuid4()}_{archivo.filename}"
    ruta_completa = os.path.join(carpeta_paciente, nombre_unico)

    contenido = archivo.file.read()
    tamano_bytes = len(contenido)

    with open(ruta_completa, "wb") as f:
        f.write(contenido)

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

    registrar_accion(
        db=db,
        accion="SUBIR_DOCUMENTO",
        usuario_id=usuario_id,
        nombre_tabla="documentos",
        registro_id=nuevo_documento.id,
        valores_nuevos={
            "nombre_archivo": nuevo_documento.nombre_archivo,
            "tipo_documento": nuevo_documento.tipo_documento.value,
            "tamano_bytes": nuevo_documento.tamano_bytes,
        },
    )
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

def eliminar_documento(token: str, documento_id: uuid.UUID, db: Session) -> dict:
    usuario_id = validar_y_renovar_sesion(token, db)
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

    # Capture info before deleting
    anteriores = {
        "nombre_archivo": documento.nombre_archivo,
        "tipo_documento": documento.tipo_documento.value,
    }

    ruta_real = os.path.join("/app", documento.ruta_almacenamiento)
    if os.path.exists(ruta_real):
        os.remove(ruta_real)

    db.delete(documento)
    db.commit()

    registrar_accion(
        db=db,
        accion="ELIMINAR_DOCUMENTO",
        usuario_id=usuario_id,
        nombre_tabla="documentos",
        registro_id=documento_id,
        valores_anteriores=anteriores,
    )
    return {"mensaje": "Documento eliminado"}