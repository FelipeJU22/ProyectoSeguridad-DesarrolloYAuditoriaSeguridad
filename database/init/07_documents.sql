-- ============================================================
-- Documents
-- Depends on: 03_core_tables.sql, 04_medical_staff_tables.sql, 06_appointments_and_surgeries.sql
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
