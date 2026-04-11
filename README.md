# Proyecto Seguridad: Desarrollo y Auditoria de Seguridad
Proyecto Semestral del curso de Seguridad de la Información

#  Guía y Convenciones

Este archivo contiene las convenciones y estructura de trabajo que debe seguir el equipo de desarrollo. Asegúrate de leer y aplicar estas reglas en cada contribución.

---

## Estructura del Proyecto

"
 src/                # Código fuente principal  
 tests/              # Pruebas unitarias y de integración  
 docs/               # Documentación técnica  
 build/              # Archivos relacionados al sistema de construcción  
 README.md           # Guía principal del proyecto
"

---

##  Convención de Commits

Usamos Conventional Commits (https://www.conventionalcommits.org/) para estandarizar nuestros mensajes:

| Tipo       | Propósito                            | Ejemplo de commit                                    |
|------------|---------------------------------------|------------------------------------------------------|
| "feat"     | Nueva característica                  | "feat: add artist recommendation engine"            |
| "fix"      | Corrección de errores                 | "fix: resolve user login timeout issue"             |
| "perf"     | Mejora de rendimiento                 | "perf: optimize database queries"                   |
| "build"    | Cambios en el sistema de build        | "build: update webpack configuration"               |
| "ci"       | Cambios en integración continua       | "ci: add automated UI testing"                      |
| "docs"     | Cambios en documentación              | "docs: update API documentation"                    |
| "refactor" | Refactorización de código (sin bugfix)| "refactor: rename user variables for clarity"       |
| "style"    | Cambios de formato (sin lógica)       | "style: fix indentation in controllers"             |
| "test"     | Adición o refactorización de tests    | "test: add unit tests for playlist service"         |

 **Formato del mensaje**:  
"git commit -m \"tipo: descripción breve del cambio\""

---

##  Ejemplo de Pull Request

**Título del PR:**  
"feat: Implement artist subscription notifications"

**Descripción del PR:**  
"Este PR implementa las notificaciones en tiempo real para los usuarios cuando sus artistas favoritos publican nuevo contenido o anuncian eventos."

**Checklist:**
- [x] El código compila y pasa las pruebas  
- [x] Se sigue la convención de commits  
- [x] Documentación actualizada si aplica  
- [x] Pruebas incluidas o actualizadas

---

##  Reglas de Aprobación

-  Todo PR requiere aprobación de al menos **2 integrantes** del equipo (excepto hotfixes).  
-  No se debe hacer merge sin revisión, a menos que se trate de una emergencia validada por el equipo.  
-  Se recomienda usar "Squash and Merge" para mantener un historial limpio.

---
