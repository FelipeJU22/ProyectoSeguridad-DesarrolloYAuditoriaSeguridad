from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
import uuid
from datetime import datetime
from app.models.cirugia import Cirugia, EstadoCirugia, CirugiaAsistente
from app.models.usuario import Usuario
from app.models.paciente import Paciente
from app.schemas.cirugia import CirugiaRespuesta, AsistenteEnCirugia, CirugiaCrearEntrada, CirugiaEditarEntrada
from app.models.cirujano import Cirujano

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
        tipo_cirugia=cirugia.tipo_cirugia,
        fecha_programada=cirugia.fecha_programada,
        duracion_estimada_min=cirugia.duracion_estimada_min,
        sala_operaciones=cirugia.sala_operaciones,
        estado=cirugia.estado,
        notas=cirugia.notas,
        paciente_nombre=cirugia.paciente.usuario.nombre,
        paciente_apellido=cirugia.paciente.usuario.apellido,
        anestesiologo_id=cirugia.anestesiologo_id,
        anestesiologo_nombre=cirugia.anestesiologo.usuario.nombre,
        anestesiologo_apellido=cirugia.anestesiologo.usuario.apellido,
        cirujano_nombre=cirugia.cirujano.usuario.nombre,
        cirujano_apellido=cirugia.cirujano.usuario.apellido,
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

def obtener_cirujano_por_usuario(usuario_id: UUID, db: Session) -> Cirujano:
    cirujano = db.query(Cirujano).filter(Cirujano.usuario_id == usuario_id).first()
    if not cirujano:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de cirujano no encontrado"
        )
    return cirujano

def obtener_cirugias_cirujano(usuario_id: UUID, db: Session) -> list[CirugiaRespuesta]:
    cirujano = obtener_cirujano_por_usuario(usuario_id, db)
    cirugias = db.query(Cirugia).filter(Cirugia.cirujano_id == cirujano.id).all()
    return [construir_respuesta(c) for c in cirugias]

def crear_cirugia(usuario_id: UUID, datos: CirugiaCrearEntrada, db: Session) -> CirugiaRespuesta:
    cirujano = obtener_cirujano_por_usuario(usuario_id, db)

    nueva = Cirugia(
        id=uuid.uuid4(),                          # ← genera el UUID en Python
        paciente_id=datos.paciente_id,
        tipo_cirugia=datos.tipo_cirugia,
        cirujano_id=cirujano.id,
        anestesiologo_id=datos.anestesiologo_id,
        fecha_programada=datos.fecha_programada,
        duracion_estimada_min=datos.duracion_estimada_min,
        notas=datos.notas,
        estado=EstadoCirugia.programada,
        creado_por=usuario_id,
        creado_en=datetime.now(),
        actualizado_en=datetime.now()
    )
    db.add(nueva)
    db.flush()

    for asistente_id in datos.asistente_ids:
        db.add(CirugiaAsistente(
            cirugia_id=nueva.id,
            asistente_id=asistente_id,
            asignado_en=datetime.now()
        ))

    db.commit()
    db.refresh(nueva)
    return construir_respuesta(nueva)

def editar_cirugia(usuario_id: UUID, cirugia_id: UUID, datos: CirugiaEditarEntrada, db: Session) -> CirugiaRespuesta:
    cirujano = obtener_cirujano_por_usuario(usuario_id, db)

    cirugia = db.query(Cirugia).filter(
        Cirugia.id == cirugia_id,
        Cirugia.cirujano_id == cirujano.id
    ).first()

    if not cirugia:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cirugía no encontrada"
        )

    cirugia.tipo_cirugia          = datos.tipo_cirugia
    cirugia.fecha_programada      = datos.fecha_programada
    cirugia.anestesiologo_id      = datos.anestesiologo_id
    cirugia.duracion_estimada_min = datos.duracion_estimada_min
    cirugia.notas                 = datos.notas

    db.query(CirugiaAsistente).filter(CirugiaAsistente.cirugia_id == cirugia_id).delete()
    for asistente_id in datos.asistente_ids:
        db.add(CirugiaAsistente(
            cirugia_id=cirugia_id,
            asistente_id=asistente_id,
            asignado_en=datetime.now()
        ))

    db.commit()
    db.refresh(cirugia)
    return construir_respuesta(cirugia)