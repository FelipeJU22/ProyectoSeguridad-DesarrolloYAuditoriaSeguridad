-- ============================================================
-- Surgery Types Catalog
-- Depends on: (no FK dependencies, standalone catalog)
-- ============================================================

CREATE TABLE surgery_types (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                        VARCHAR(150) NOT NULL UNIQUE,
    description                 TEXT,
    estimated_duration_minutes  INT,
    is_active                   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
