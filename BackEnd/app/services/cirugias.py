from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from datetime import datetime
from app.models.cirugia import Cirugia, EstadoCirugia
from app.models.paciente import Paciente
from app.schemas.cirugia import CirugiaRespuesta, AsistenteEnCirugia

def obtener_paciente_por_usuario(usuario_id: UUID, db: Session) -> Paciente:
    paciente = db.query(Paciente).filter(Paciente.usuario_id == usuario_id).first()
    if not paciente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de paciente no encontrado"
        )
    return paciente

def construir_respuesta(cirugia: Cirugia) -> CirugiaRespuesta:
    return CirugiaRespuesta(
        id=cirugia.id,
        tipo_cirugia=cirugia.tipo_cirugia.nombre,
        fecha_programada=cirugia.fecha_programada,
        duracion_estimada_min=cirugia.duracion_estimada_min,
        sala_operaciones=cirugia.sala_operaciones,
        estado=cirugia.estado,
        notas=cirugia.notas,
        cirujano_nombre=cirugia.cirujano.usuario.nombre,
        cirujano_apellido=cirugia.cirujano.usuario.apellido,
        anestesiologo_nombre=cirugia.anestesiologo.usuario.nombre,
        anestesiologo_apellido=cirugia.anestesiologo.usuario.apellido,
        asistentes=[
            AsistenteEnCirugia(
                id=a.asistente.id,
                nombre=a.asistente.usuario.nombre,
                apellido=a.asistente.usuario.apellido,
            )
            for a in cirugia.asistentes
        ]
    )

def obtener_cirugias_paciente(usuario_id: UUID, db: Session) -> list[CirugiaRespuesta]:
    paciente = obtener_paciente_por_usuario(usuario_id, db)
    cirugias = db.query(Cirugia).filter(Cirugia.paciente_id == paciente.id).all()
    return [construir_respuesta(c) for c in cirugias]

def cambiar_fecha_cirugia(usuario_id: UUID, cirugia_id: UUID, fecha_nueva: datetime, db: Session) -> CirugiaRespuesta:
    paciente = obtener_paciente_por_usuario(usuario_id, db)
    cirugia = db.query(Cirugia).filter(
        Cirugia.id == cirugia_id,
        Cirugia.paciente_id == paciente.id
    ).first()

    if not cirugia:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cirugía no encontrada"
        )
    if cirugia.estado not in [EstadoCirugia.programada, EstadoCirugia.pospuesta]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede cambiar la fecha de una cirugía en estado {cirugia.estado}"
        )

    cirugia.fecha_programada = fecha_nueva
    cirugia.actualizado_en = datetime.now()
    db.commit()
    db.refresh(cirugia)
    return construir_respuesta(cirugia)

def cancelar_cirugias(usuario_id: UUID, cirugia_ids: list[UUID], db: Session) -> dict:
    paciente = obtener_paciente_por_usuario(usuario_id, db)
    canceladas = []

    for cirugia_id in cirugia_ids:
        cirugia = db.query(Cirugia).filter(
            Cirugia.id == cirugia_id,
            Cirugia.paciente_id == paciente.id
        ).first()

        if not cirugia:
            continue
        if cirugia.estado not in [EstadoCirugia.programada, EstadoCirugia.pospuesta]:
            continue

        cirugia.estado = EstadoCirugia.cancelada
        cirugia.actualizado_en = datetime.now()
        canceladas.append(str(cirugia_id))

    db.commit()
    return {"canceladas": canceladas, "total": len(canceladas)}