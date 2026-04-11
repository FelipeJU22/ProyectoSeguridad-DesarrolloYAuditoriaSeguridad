# Crear entorno virtual
python -m venv venv

# Activarlo
.\venv\Scripts\Activate.ps1

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar el entorno
uvicorn app.main:app --reload