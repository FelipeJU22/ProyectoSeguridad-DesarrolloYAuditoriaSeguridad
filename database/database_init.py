import psycopg2
import os
from pathlib import Path

# Database configuration
dbName = "surgery_db"
dbUser = "root"
dbPassword = "root"
dbHost = "db"
dbPort = "5432"

BASE_DIR = Path(__file__).resolve().parent
schemaDir = BASE_DIR / "init"

def runSqlFile(cursor, filePath):
    print(f"Executing {filePath.name}...")
    
    with open(filePath, "r", encoding="utf-8") as file:
        sql = file.read()
        cursor.execute(sql)

def main():

    print("Connecting to PostgreSQL server...")

    conn = psycopg2.connect(
        dbname="postgres",
        user=dbUser,
        password=dbPassword,
        host=dbHost,
        port=dbPort
    )

    conn.autocommit = True
    cursor = conn.cursor()

    print("Recreating database...")

     # Terminate active connections
    cursor.execute(f"""
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = '{dbName}'
        AND pid <> pg_backend_pid();
    """)

    # Drop database
    cursor.execute(f"DROP DATABASE IF EXISTS {dbName};")
    cursor.execute(f"CREATE DATABASE {dbName};")

    cursor.close()
    conn.close()

    print("Connecting to new database...")

    conn = psycopg2.connect(
        dbname=dbName,
        user=dbUser,
        password=dbPassword,
        host=dbHost,
        port=dbPort
    )

    conn.autocommit = True
    cursor = conn.cursor()

    print("Running schema scripts...")

    sqlFiles = sorted(schemaDir.glob("*.sql"))

    for file in sqlFiles:
        runSqlFile(cursor, file)

    cursor.close()
    conn.close()

    print("Database setup completed!")

if __name__ == "__main__":
    main()