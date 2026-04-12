from sqlalchemy.orm import Session
from app.models.paciente import Paciente
from app.models.anestesiologo import Anestesiologo
from app.models.asistente import Asistente
from app.models.usuario import Usuario
from app.schemas.listas import PacienteLista, AnestesiologoLista, AsistenteLista

def obtener_pacientes(db: Session) -> list[PacienteLista]:
    resultados = (
        db.query(Paciente, Usuario)
        .join(Usuario, Usuario.id == Paciente.usuario_id)
        .filter(Usuario.activo == True)
        .all()
    )
    return [
        PacienteLista(id=p.id, nombre=u.nombre, apellido=u.apellido)
        for p, u in resultados
    ]

def obtener_anestesiologos(db: Session) -> list[AnestesiologoLista]:
    resultados = (
        db.query(Anestesiologo, Usuario)
        .join(Usuario, Usuario.id == Anestesiologo.usuario_id)
        .filter(Anestesiologo.disponible == True, Usuario.activo == True)
        .all()
    )
    return [
        AnestesiologoLista(id=a.id, nombre=u.nombre, apellido=u.apellido)
        for a, u in resultados
    ]

def obtener_asistentes(db: Session) -> list[AsistenteLista]:
    resultados = (
        db.query(Asistente, Usuario)
        .join(Usuario, Usuario.id == Asistente.usuario_id)
        .filter(Asistente.disponible == True, Usuario.activo == True)
        .all()
    )
    return [
        AsistenteLista(id=a.id, nombre=u.nombre, apellido=u.apellido)
        for a, u in resultados
    ]