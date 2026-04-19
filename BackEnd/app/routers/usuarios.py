from fastapi import APIRouter, HTTPException, status
from app.schemas.usuario import UsuarioCrear, UsuarioRespuesta, UsuarioActualizar

router = APIRouter()

usuarios_db = [
    {"id": 1, "nombre": "Ana", "email": "ana@email.com"},
    {"id": 2, "nombre": "Carlos", "email": "carlos@email.com"},
]


def buscar_usuario(id: int):
    for usuario in usuarios_db:
        if usuario["id"] == id:
            return usuario
    return None


@router.get("/usuarios", response_model=list[UsuarioRespuesta])
def obtener_usuarios():
    return usuarios_db


@router.get("/usuarios/{id}", response_model=UsuarioRespuesta)
def obtener_usuario(id: int):
    usuario = buscar_usuario(id)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con id {id} no encontrado"
        )
    return usuario


@router.post("/usuarios", response_model=UsuarioRespuesta, status_code=status.HTTP_201_CREATED)
def crear_usuario(usuario: UsuarioCrear):
    for u in usuarios_db:
        if u["email"] == usuario.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe un usuario con ese email"
            )
    nuevo = {
        "id": len(usuarios_db) + 1,
        "nombre": usuario.nombre,
        "email": usuario.email
    }
    usuarios_db.append(nuevo)
    return nuevo


@router.put("/usuarios/{id}", response_model=UsuarioRespuesta)
def actualizar_usuario(id: int, datos: UsuarioActualizar):
    usuario = buscar_usuario(id)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con id {id} no encontrado"
        )
    if datos.nombre is not None:
        usuario["nombre"] = datos.nombre
    if datos.email is not None:
        usuario["email"] = datos.email
    return usuario


@router.delete("/usuarios/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_usuario(id: int):
    usuario = buscar_usuario(id)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con id {id} no encontrado"
        )
    usuarios_db.remove(usuario)