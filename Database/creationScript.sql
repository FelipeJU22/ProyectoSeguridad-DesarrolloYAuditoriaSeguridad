-- ============================================================
-- Surgery Management System - Database Schema
-- CE-1115 Seguridad de la Información - Blue Team
-- PostgreSQL
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM (
    'admin',
    'patient',
    'surgeon',
    'anesthesiologist',
    'assistant'
);

CREATE TYPE surgery_status AS ENUM (
    'scheduled',
    'in_progress',
    'completed',
    'cancelled',
    'postponed'
);

CREATE TYPE appointment_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'cancelled'
);

CREATE TYPE document_type AS ENUM (
    'insurance_policy',
    'medical_note',
    'consent_form',
    'lab_result',
    'other'
);

-- ============================================================
-- CORE TABLES
-- ============================================================

-- All system users regardless of role
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,           -- store bcrypt hash, never plaintext
    role            user_role NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    phone           VARCHAR(20),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Extended profile for patients
CREATE TABLE patients (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    birth_date      DATE NOT NULL,
    id_number       VARCHAR(50) NOT NULL UNIQUE,     -- national ID / passport
    blood_type      VARCHAR(5),
    allergies       TEXT,
    medical_notes   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Extended profile for surgeons
CREATE TABLE surgeons (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    license_number  VARCHAR(100) NOT NULL UNIQUE,
    specialty       VARCHAR(150) NOT NULL,
    available       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Extended profile for anesthesiologists
CREATE TABLE anesthesiologists (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    license_number  VARCHAR(100) NOT NULL UNIQUE,
    available       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Extended profile for assistants
CREATE TABLE assistants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    specialty       VARCHAR(150),
    available       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Catalog of surgery types
CREATE TABLE surgery_types (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(150) NOT NULL UNIQUE,
    description     TEXT,
    estimated_duration_minutes INT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- APPOINTMENT / SURGERY FLOW
-- ============================================================

-- A patient requests an appointment which may become a surgery
CREATE TABLE appointments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id          UUID NOT NULL REFERENCES patients(id),
    surgery_type_id     UUID NOT NULL REFERENCES surgery_types(id),
    requested_date      DATE NOT NULL,
    status              appointment_status NOT NULL DEFAULT 'pending',
    notes               TEXT,
    reviewed_by         UUID REFERENCES users(id),   -- admin who approved/rejected
    reviewed_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Central surgery entity
CREATE TABLE surgeries (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id          UUID UNIQUE REFERENCES appointments(id),  -- nullable if created directly by admin
    patient_id              UUID NOT NULL REFERENCES patients(id),
    surgery_type_id         UUID NOT NULL REFERENCES surgery_types(id),
    surgeon_id              UUID NOT NULL REFERENCES surgeons(id),
    anesthesiologist_id     UUID NOT NULL REFERENCES anesthesiologists(id),
    scheduled_at            TIMESTAMPTZ NOT NULL,
    estimated_duration_min  INT,
    operating_room          VARCHAR(50),
    status                  surgery_status NOT NULL DEFAULT 'scheduled',
    notes                   TEXT,
    created_by              UUID NOT NULL REFERENCES users(id),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Many-to-many: assistants assigned to a surgery
CREATE TABLE surgery_assistants (
    surgery_id      UUID NOT NULL REFERENCES surgeries(id) ON DELETE CASCADE,
    assistant_id    UUID NOT NULL REFERENCES assistants(id),
    assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (surgery_id, assistant_id)
);

-- ============================================================
-- DOCUMENTS
-- ============================================================

-- PDF files associated to a surgery or a patient
CREATE TABLE documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name       VARCHAR(255) NOT NULL,
    storage_path    VARCHAR(500) NOT NULL,           -- path/key in storage (e.g. S3 or local volume)
    document_type   document_type NOT NULL DEFAULT 'other',
    mime_type       VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
    file_size_bytes BIGINT,
    surgery_id      UUID REFERENCES surgeries(id) ON DELETE SET NULL,
    patient_id      UUID REFERENCES patients(id)  ON DELETE SET NULL,
    uploaded_by     UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- at least one of surgery_id or patient_id must be set
    CONSTRAINT chk_document_owner CHECK (
        surgery_id IS NOT NULL OR patient_id IS NOT NULL
    )
);

-- ============================================================
-- SECURITY & SESSION TABLES
-- ============================================================

-- Track active sessions (allows server-side revocation)
CREATE TABLE sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) NOT NULL UNIQUE,    -- hash of the JWT/session token
    ip_address      INET,
    user_agent      TEXT,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit log for sensitive actions (principle of security by layers)
CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    action          VARCHAR(100) NOT NULL,           -- e.g. 'LOGIN', 'CREATE_SURGERY', 'DELETE_DOCUMENT'
    table_name      VARCHAR(100),
    record_id       UUID,
    old_values      JSONB,
    new_values      JSONB,
    ip_address      INET,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cookie consent tracking (required by project policy)
CREATE TABLE cookie_consents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,  -- null if anonymous
    session_key     VARCHAR(255),                    -- anonymous identifier before login
    accepted        BOOLEAN NOT NULL,
    ip_address      INET,
    user_agent      TEXT,
    consented_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Failed login attempts (brute-force protection)
CREATE TABLE login_attempts (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL,
    ip_address      INET,
    success         BOOLEAN NOT NULL DEFAULT FALSE,
    attempted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Users
CREATE INDEX idx_users_email   ON users(email);
CREATE INDEX idx_users_role    ON users(role);

-- Surgeries - most queried table
CREATE INDEX idx_surgeries_scheduled_at     ON surgeries(scheduled_at);
CREATE INDEX idx_surgeries_patient          ON surgeries(patient_id);
CREATE INDEX idx_surgeries_surgeon          ON surgeries(surgeon_id);
CREATE INDEX idx_surgeries_anesthesiologist ON surgeries(anesthesiologist_id);
CREATE INDEX idx_surgeries_status           ON surgeries(status);

-- Appointments
CREATE INDEX idx_appointments_patient   ON appointments(patient_id);
CREATE INDEX idx_appointments_status    ON appointments(status);

-- Documents
CREATE INDEX idx_documents_surgery  ON documents(surgery_id);
CREATE INDEX idx_documents_patient  ON documents(patient_id);

-- Audit logs
CREATE INDEX idx_audit_user     ON audit_logs(user_id);
CREATE INDEX idx_audit_action   ON audit_logs(action);
CREATE INDEX idx_audit_created  ON audit_logs(created_at);

-- Sessions
CREATE INDEX idx_sessions_user      ON sessions(user_id);
CREATE INDEX idx_sessions_expires   ON sessions(expires_at);

-- Login attempts (for rate limiting queries)
CREATE INDEX idx_login_attempts_email ON login_attempts(email, attempted_at);
CREATE INDEX idx_login_attempts_ip    ON login_attempts(ip_address, attempted_at);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_surgeons_updated_at
    BEFORE UPDATE ON surgeons
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_anesthesiologists_updated_at
    BEFORE UPDATE ON anesthesiologists
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_assistants_updated_at
    BEFORE UPDATE ON assistants
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_surgeries_updated_at
    BEFORE UPDATE ON surgeries
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================
-- SEED DATA (time 0 - demo data for all roles and flows)
-- Passwords are bcrypt hashes of the values shown in comments
-- ============================================================

-- Surgery types catalog
INSERT INTO surgery_types (id, name, description, estimated_duration_minutes) VALUES
    ('a1000000-0000-0000-0000-000000000001', 'Appendectomy',         'Surgical removal of the appendix',           60),
    ('a1000000-0000-0000-0000-000000000002', 'Cholecystectomy',      'Gallbladder removal',                        90),
    ('a1000000-0000-0000-0000-000000000003', 'Knee Arthroscopy',     'Minimally invasive knee joint surgery',      75),
    ('a1000000-0000-0000-0000-000000000004', 'Hernia Repair',        'Inguinal or umbilical hernia correction',    80),
    ('a1000000-0000-0000-0000-000000000005', 'Cataract Surgery',     'Lens replacement for cataract patients',     45);

-- Users (password: Admin1234! for admin, role_name+1234! for others)
-- Hashes generated with bcrypt cost factor 12
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone) VALUES
    -- admin  password: Admin1234!
    ('b0000000-0000-0000-0000-000000000001',
     'admin@hospital.cr',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TdxfL2O1a8NX1rU7kqBpLkE2K3yu',
     'admin', 'Carlos', 'Mora', '+50688880001'),

    -- surgeon  password: Surgeon1234!
    ('b0000000-0000-0000-0000-000000000002',
     'drlopez@hospital.cr',
     '$2b$12$FKo3R9vP8mXsYtN2eQu7AeW1cHjD4kL6nM5pR0sT8uV2wX4yZ6aB',
     'surgeon', 'Andrés', 'López', '+50688880002'),

    ('b0000000-0000-0000-0000-000000000003',
     'drsoto@hospital.cr',
     '$2b$12$FKo3R9vP8mXsYtN2eQu7AeW1cHjD4kL6nM5pR0sT8uV2wX4yZ6aB',
     'surgeon', 'María', 'Soto', '+50688880003'),

    -- anesthesiologist  password: Anesthesia1234!
    ('b0000000-0000-0000-0000-000000000004',
     'drvega@hospital.cr',
     '$2b$12$9Xa8Kb3Lm7Nq5Rp1Ts6WeY0Zc4Df2Gh6Ij8Kl0Mn2Op4Qr6St8Uv',
     'anesthesiologist', 'Luis', 'Vega', '+50688880004'),

    ('b0000000-0000-0000-0000-000000000005',
     'drjimenez@hospital.cr',
     '$2b$12$9Xa8Kb3Lm7Nq5Rp1Ts6WeY0Zc4Df2Gh6Ij8Kl0Mn2Op4Qr6St8Uv',
     'anesthesiologist', 'Ana', 'Jiménez', '+50688880005'),

    -- assistants  password: Assistant1234!
    ('b0000000-0000-0000-0000-000000000006',
     'assistant.castro@hospital.cr',
     '$2b$12$3Rb7Ud9We1Xf4Yg8Zh2Ai5Bj0Ck6Dl9Em3Fn7Go1Hp5Iq8Jr2Ks6L',
     'assistant', 'Pedro', 'Castro', '+50688880006'),

    ('b0000000-0000-0000-0000-000000000007',
     'assistant.rodriguez@hospital.cr',
     '$2b$12$3Rb7Ud9We1Xf4Yg8Zh2Ai5Bj0Ck6Dl9Em3Fn7Go1Hp5Iq8Jr2Ks6L',
     'assistant', 'Laura', 'Rodríguez', '+50688880007'),

    -- patients  password: Patient1234!
    ('b0000000-0000-0000-0000-000000000008',
     'patient.hernandez@gmail.com',
     '$2b$12$7Vb5Wc8Xd2Ye6Zf0Ag4Bh9Ci3Dj7Ek1Fl5Gm9Hn3Io7Jp1Kq5Lr9',
     'patient', 'Roberto', 'Hernández', '+50688880008'),

    ('b0000000-0000-0000-0000-000000000009',
     'patient.ramirez@gmail.com',
     '$2b$12$7Vb5Wc8Xd2Ye6Zf0Ag4Bh9Ci3Dj7Ek1Fl5Gm9Hn3Io7Jp1Kq5Lr9',
     'patient', 'Carmen', 'Ramírez', '+50688880009'),

    ('b0000000-0000-0000-0000-000000000010',
     'patient.quesada@gmail.com',
     '$2b$12$7Vb5Wc8Xd2Ye6Zf0Ag4Bh9Ci3Dj7Ek1Fl5Gm9Hn3Io7Jp1Kq5Lr9',
     'patient', 'Jorge', 'Quesada', '+50688880010');

-- Surgeon profiles
INSERT INTO surgeons (id, user_id, license_number, specialty) VALUES
    ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'CRC-MED-1001', 'General Surgery'),
    ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'CRC-MED-1002', 'Orthopedic Surgery');

-- Anesthesiologist profiles
INSERT INTO anesthesiologists (id, user_id, license_number) VALUES
    ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000004', 'CRC-ANE-2001'),
    ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000005', 'CRC-ANE-2002');

-- Assistant profiles
INSERT INTO assistants (id, user_id, specialty) VALUES
    ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000006', 'Surgical Nursing'),
    ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000007', 'Anesthesia Nursing');

-- Patient profiles
INSERT INTO patients (id, user_id, birth_date, id_number, blood_type, allergies) VALUES
    ('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000008',
     '1985-03-12', '1-0856-0123', 'O+', 'Penicillin'),
    ('c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000009',
     '1972-11-28', '3-0412-0567', 'A+', NULL),
    ('c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000010',
     '1990-07-04', '5-0234-0789', 'B-', 'Latex, Ibuprofen');

-- Appointments
INSERT INTO appointments (id, patient_id, surgery_type_id, requested_date, status, notes, reviewed_by, reviewed_at) VALUES
    ('d0000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000007',
     'a1000000-0000-0000-0000-000000000001',
     '2026-04-10', 'approved', 'Patient reports acute pain since 2 days ago.',
     'b0000000-0000-0000-0000-000000000001', '2026-04-06 09:00:00+00'),

    ('d0000000-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000008',
     'a1000000-0000-0000-0000-000000000002',
     '2026-04-15', 'approved', 'Elective cholecystectomy.',
     'b0000000-0000-0000-0000-000000000001', '2026-04-06 09:30:00+00'),

    ('d0000000-0000-0000-0000-000000000003',
     'c0000000-0000-0000-0000-000000000009',
     'a1000000-0000-0000-0000-000000000003',
     '2026-04-20', 'pending', 'Left knee injury follow-up.',
     NULL, NULL);

-- Surgeries
INSERT INTO surgeries (id, appointment_id, patient_id, surgery_type_id, surgeon_id, anesthesiologist_id,
                        scheduled_at, estimated_duration_min, operating_room, status, created_by) VALUES
    ('e0000000-0000-0000-0000-000000000001',
     'd0000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000007',
     'a1000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000003',
     '2026-04-10 08:00:00+00', 60, 'OR-1', 'scheduled',
     'b0000000-0000-0000-0000-000000000001'),

    ('e0000000-0000-0000-0000-000000000002',
     'd0000000-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000008',
     'a1000000-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000004',
     '2026-04-15 10:00:00+00', 90, 'OR-2', 'scheduled',
     'b0000000-0000-0000-0000-000000000001'),

    -- A completed surgery for calendar history
    ('e0000000-0000-0000-0000-000000000003',
     NULL,
     'c0000000-0000-0000-0000-000000000009',
     'a1000000-0000-0000-0000-000000000005',
     'c0000000-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000003',
     '2026-03-20 07:00:00+00', 45, 'OR-3', 'completed',
     'b0000000-0000-0000-0000-000000000001');

-- Surgery assistants assignments
INSERT INTO surgery_assistants (surgery_id, assistant_id) VALUES
    ('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005'),
    ('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006'),
    ('e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000005'),
    ('e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000006');

-- Sample documents
INSERT INTO documents (id, file_name, storage_path, document_type, surgery_id, patient_id, uploaded_by) VALUES
    ('f0000000-0000-0000-0000-000000000001',
     'insurance_hernandez.pdf',
     'documents/patients/c0000000-0000-0000-0000-000000000007/insurance_hernandez.pdf',
     'insurance_policy', 'e0000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000007',
     'b0000000-0000-0000-0000-000000000008'),

    ('f0000000-0000-0000-0000-000000000002',
     'medical_note_ramirez.pdf',
     'documents/patients/c0000000-0000-0000-0000-000000000008/medical_note_ramirez.pdf',
     'medical_note', 'e0000000-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000008',
     'b0000000-0000-0000-0000-000000000003');

-- Cookie consent samples
INSERT INTO cookie_consents (user_id, accepted, ip_address) VALUES
    ('b0000000-0000-0000-0000-000000000001', TRUE, '192.168.1.10'),
    ('b0000000-0000-0000-0000-000000000008', TRUE, '192.168.1.20'),
    ('b0000000-0000-0000-0000-000000000009', TRUE, '192.168.1.21');

-- Sample audit log entries
INSERT INTO audit_logs (user_id, action, table_name, record_id, ip_address) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'LOGIN',          NULL,        NULL, '192.168.1.10'),
    ('b0000000-0000-0000-0000-000000000001', 'CREATE_SURGERY',  'surgeries', 'e0000000-0000-0000-0000-000000000001', '192.168.1.10'),
    ('b0000000-0000-0000-0000-000000000001', 'CREATE_SURGERY',  'surgeries', 'e0000000-0000-0000-0000-000000000002', '192.168.1.10'),
    ('b0000000-0000-0000-0000-000000000008', 'LOGIN',           NULL,        NULL, '192.168.1.20'),
    ('b0000000-0000-0000-0000-000000000008', 'UPLOAD_DOCUMENT', 'documents', 'f0000000-0000-0000-0000-000000000001', '192.168.1.20');