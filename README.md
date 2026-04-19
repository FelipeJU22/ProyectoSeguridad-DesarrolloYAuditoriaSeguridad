# 🏥 HospiTEC — Sistema de Gestión de Cirugías

Aplicación web desarrollada para el curso **CE-1115 Seguridad de la Información** en el Instituto Tecnológico de Costa Rica.

El sistema permite la gestión de cirugías en un entorno hospitalario, incluyendo agendamiento, manejo de pacientes, documentos médicos y control de acceso por roles.

---

## 🚀 Tecnologías utilizadas

- **Frontend:** React (Node.js)
- **Backend:** FastAPI (Python)
- **Base de datos:** PostgreSQL
- **Infraestructura:** Docker + Docker Compose

---

## ⚙️ Funcionalidades principales

- Gestión de usuarios con roles:
  - Paciente
  - Cirujano
  - Anestesiólogo
  - Asistente

- Autenticación segura:
  - Login con contraseña
  - Autenticación en dos factores (2FA por correo)

- Gestión de cirugías:
  - Crear, visualizar y administrar citas quirúrgicas

- Manejo de documentos:
  - Subida de PDFs
  - Aislamiento por paciente

- Auditoría:
  - Registro de acciones (login, documentos, cirugías, etc.)

---

## 🔐 Seguridad implementada

El sistema fue diseñado siguiendo principios de seguridad y OWASP Top 10:

- 🔑 Hash de contraseñas con **bcrypt**
- 🔒 Autenticación con **JWT + 2FA**
- 🔁 Sesión única por usuario
- 🧾 Auditoría completa de acciones
- 🛡 Protección contra:
  - XSS → Content Security Policy (CSP)
  - Clickjacking → `X-Frame-Options`
  - CORS mal configurado → restricción de orígenes
- 📂 Validación de archivos (solo PDF)
- 🧠 Validación de datos en backend (Pydantic)

---

## 🐳 Ejecución del proyecto

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd <repo>
```

### 2. Configurar variables de entorno

Crear archivo `.env` en la raíz:

```env
POSTGRES_DB=surgery_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

DATABASE_URL=postgresql://postgres:postgres@db:5432/surgery_db

SECRET_KEY=una_clave_secreta

ALLOWED_ORIGINS=["http://localhost:3000"]

RESEND_API_KEY=your_key
RESEND_API_EMAIL=your_email
ENABLE_2FA_EMAIL=false
```

### 3. Ejecutar con Docker

```bash
docker compose up --build
```

### 4. Acceso

| Servicio   | URL                          |
|------------|------------------------------|
| Frontend   | http://localhost:3000        |
| Backend    | http://localhost:8000        |
| Docs API   | http://localhost:8000/docs   |

---

## 🧪 Seguridad y pruebas

Se realizaron pruebas de seguridad utilizando:

- **OWASP ZAP**

Se identificaron y mitigaron vulnerabilidades como:

- Falta de CSP
- Configuración insegura de CORS
- Falta de protección contra clickjacking

> **Nota:** Algunas alertas pueden persistir en `localhost:3000` debido al uso del servidor de desarrollo de React.

---

## ⚠️ Limitaciones conocidas

- El frontend en modo desarrollo no aplica headers de seguridad.
- CSP incluye directivas permisivas (`unsafe-eval`) en desarrollo.
- No se utiliza HTTPS en entorno local.
- Tokens JWT se almacenan en `sessionStorage`.

---

## 📁 Estructura del proyecto

```
.
├── BackEnd/
│   ├── app/
│   ├── routers/
│   ├── middleware/
│   └── ...
├── Frontend/
├── database/
│   └── db_init/
├── docker-compose.yml
└── .env
```

---

## 👥 Autores

- Ricardo Borbón Mena
- Jorge Guillén Campos
- Felipe Jiménez Ulate
- Carlos Rodríguez Segura
- José María Vindas Ortiz

---

## 📚 Curso

**CE-1115 Seguridad de la Información**  
Instituto Tecnológico de Costa Rica  
I Semestre 2026

---

## 📌 Licencia

Proyecto académico — uso educativo.
