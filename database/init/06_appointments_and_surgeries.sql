-- ============================================================
-- Appointments and Surgeries
-- Depends on: 03_core_tables.sql, 04_medical_staff_tables.sql, 05_surgery_catalog.sql
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
