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
from app.models.anestesiologo import Anestesiologo
from app.models.asistente import Asistente
from app.services.auditoria import registrar_accion
from app.services.sesiones import validar_y_renovar_sesion


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

def cambiar_fecha_cirugia(token: str, cirugia_id: UUID, fecha_nueva: datetime, db: Session) -> CirugiaRespuesta:
    usuario_id = validar_y_renovar_sesion(token, db)
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

    fecha_anterior = str(cirugia.fecha_programada)
    cirugia.fecha_programada = fecha_nueva
    cirugia.actualizado_en = datetime.now()
    db.commit()
    db.refresh(cirugia)

    registrar_accion(
        db=db,
        accion="EDITAR_FECHA_CIRUGIA",
        usuario_id=usuario_id,
        nombre_tabla="cirugias",
        registro_id=cirugia_id,
        valores_anteriores={"fecha_programada": fecha_anterior},
        valores_nuevos={"fecha_programada": str(fecha_nueva)},
    )
    return construir_respuesta(cirugia)

def cancelar_cirugias(token: str, cirugia_ids: list[UUID], db: Session) -> dict:
    usuario_id = validar_y_renovar_sesion(token, db)
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

        estado_anterior = cirugia.estado.value
        cirugia.estado = EstadoCirugia.cancelada
        cirugia.actualizado_en = datetime.now()
        canceladas.append(str(cirugia_id))

        registrar_accion(
            db=db,
            accion="CANCELAR_CIRUGIA",
            usuario_id=usuario_id,
            nombre_tabla="cirugias",
            registro_id=cirugia_id,
            valores_anteriores={"estado": estado_anterior},
            valores_nuevos={"estado": "cancelada"},
        )

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

def crear_cirugia(token: str, datos: CirugiaCrearEntrada, db: Session) -> CirugiaRespuesta:
    usuario_id = validar_y_renovar_sesion(token, db)
    cirujano = obtener_cirujano_por_usuario(usuario_id, db)

    nueva = Cirugia(
        id=uuid.uuid4(),
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

    registrar_accion(
        db=db,
        accion="CREAR_CIRUGIA",
        usuario_id=usuario_id,
        nombre_tabla="cirugias",
        registro_id=nueva.id,
        valores_nuevos={
            "tipo_cirugia": nueva.tipo_cirugia,
            "fecha_programada": str(nueva.fecha_programada),
            "estado": nueva.estado.value,
        },
    )
    return construir_respuesta(nueva)

def editar_cirugia(token: str, cirugia_id: UUID, datos: CirugiaEditarEntrada, db: Session) -> CirugiaRespuesta:
    usuario_id = validar_y_renovar_sesion(token, db) 
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

    # Capture previous values before modifying
    anteriores = {
        "tipo_cirugia": cirugia.tipo_cirugia,
        "fecha_programada": str(cirugia.fecha_programada),
        "anestesiologo_id": str(cirugia.anestesiologo_id),
        "duracion_estimada_min": cirugia.duracion_estimada_min,
        "notas": cirugia.notas,
    }

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

    registrar_accion(
        db=db,
        accion="EDITAR_CIRUGIA",
        usuario_id=usuario_id,
        nombre_tabla="cirugias",
        registro_id=cirugia_id,
        valores_anteriores=anteriores,
        valores_nuevos={
            "tipo_cirugia": cirugia.tipo_cirugia,
            "fecha_programada": str(cirugia.fecha_programada),
            "anestesiologo_id": str(cirugia.anestesiologo_id),
            "duracion_estimada_min": cirugia.duracion_estimada_min,
            "notas": cirugia.notas,
        },
    )
    return construir_respuesta(cirugia)

def obtener_anestesiologo_por_usuario(usuario_id: UUID, db: Session) -> Anestesiologo:
    anestesiologo = db.query(Anestesiologo).filter(Anestesiologo.usuario_id == usuario_id).first()
    if not anestesiologo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de anestesiólogo no encontrado"
        )
    return anestesiologo

def obtener_cirugias_anestesiologo(usuario_id: UUID, db: Session) -> list[CirugiaRespuesta]:
    anestesiologo = obtener_anestesiologo_por_usuario(usuario_id, db)
    cirugias = db.query(Cirugia).filter(Cirugia.anestesiologo_id == anestesiologo.id).all()
    return [construir_respuesta(c) for c in cirugias]

def obtener_asistente_por_usuario(usuario_id: UUID, db: Session) -> Asistente:
    asistente = db.query(Asistente).filter(Asistente.usuario_id == usuario_id).first()
    if not asistente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de asistente no encontrado"
        )
    return asistente

def obtener_cirugias_asistente(usuario_id: UUID, db: Session) -> list[CirugiaRespuesta]:
    asistente = obtener_asistente_por_usuario(usuario_id, db)
    cirugias = (
        db.query(Cirugia)
        .join(CirugiaAsistente, CirugiaAsistente.cirugia_id == Cirugia.id)
        .filter(CirugiaAsistente.asistente_id == asistente.id)
        .all()
    )
    return [construir_respuesta(c) for c in cirugias]

def cambiar_estado_cirugia(token: str, cirugia_id: UUID, nuevo_estado: EstadoCirugia, db: Session) -> CirugiaRespuesta:
    usuario_id = validar_y_renovar_sesion(token, db)
    asistente = obtener_asistente_por_usuario(usuario_id, db)
    cirugia = (
        db.query(Cirugia)
        .join(CirugiaAsistente, CirugiaAsistente.cirugia_id == Cirugia.id)
        .filter(Cirugia.id == cirugia_id, CirugiaAsistente.asistente_id == asistente.id)
        .first()
    )

    if not cirugia:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cirugía no encontrada"
        )

    estado_anterior = cirugia.estado.value
    cirugia.estado = nuevo_estado
    cirugia.actualizado_en = datetime.now()
    db.commit()
    db.refresh(cirugia)

    registrar_accion(
        db=db,
        accion="CAMBIAR_ESTADO_CIRUGIA",
        usuario_id=usuario_id,
        nombre_tabla="cirugias",
        registro_id=cirugia_id,
        valores_anteriores={"estado": estado_anterior},
        valores_nuevos={"estado": nuevo_estado.value},
    )
    return construir_respuesta(cirugia)