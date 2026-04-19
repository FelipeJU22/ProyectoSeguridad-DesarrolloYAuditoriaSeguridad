# Database Setup – Surgery Management System

This directory contains the scripts and tools required to initialize the PostgreSQL database for the Surgery Management System.

## Requirements

Before running the database setup script, ensure the following dependencies are installed:

### 1. Python

Python 3.9 or newer is recommended.

Check installation:

```bash
python --version
```

If Python is not installed, download it from:

https://www.python.org/downloads/

---

### 2. PostgreSQL

PostgreSQL must be installed and running locally.

Check installation:

```bash
psql --version
```

Download PostgreSQL:

https://www.postgresql.org/download/

During installation make sure you know:

* PostgreSQL username
* PostgreSQL password
* PostgreSQL port (default: 5432)

---

### 3. Python dependency

Install the required Python library:

```bash
pip install psycopg2-binary
```

This library allows Python to connect to PostgreSQL.

---

## Directory Structure

```
database/
│
├── database_init.py
│
└── schema/
    ├── 01_extensions.sql
    ├── 02_enums.sql
    ├── 03_core_tables.sql
    ├── 04_medical_staff_tables.sql
    ├── 05_surgery_catalog.sql
    ├── 06_appointments_and_surgeries.sql
    ├── 07_documents.sql
    ├── 08_security_tables.sql
    ├── 09_indexes.sql
    └── 10_triggers.sql
    └── 11_seed.sql
```

---

## Configuration

Open `database_init.py` and update the database connection configuration if needed:

```python
dbName = "surgery_db"
dbUser = "postgres"
dbPassword = "admin"
dbHost = "localhost"
dbPort = "5432"
```

---

## Running the Database Initialization

From the `database` directory execute:

```bash
python database_init.py
```

The script will:

1. Connect to PostgreSQL
2. Drop the existing database (if it exists)
3. Create a new database
4. Execute all SQL schema scripts in order

---

## Important Notes

* Running the script **will delete the existing database** if it already exists.
* Ensure PostgreSQL is running before executing the script.
* The SQL scripts inside the `schema` directory are executed **in alphabetical order**.

---

## Troubleshooting

### psycopg2 not found

Run:

```bash
pip install psycopg2-binary
```

### Connection refused

Verify that PostgreSQL is running and that the connection configuration in `database_init.py` is correct.

### Authentication error

Ensure the PostgreSQL username and password are correct.

---

## Author

CE-1115 – Seguridad de la Información
Instituto Tecnológico de Costa Rica
