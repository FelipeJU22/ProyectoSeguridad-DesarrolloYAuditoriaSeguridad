-- ============================================================
-- Enums
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
