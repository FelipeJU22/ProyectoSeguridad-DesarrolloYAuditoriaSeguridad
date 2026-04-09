-- ============================================================
-- Security Tables
-- Depends on: 03_core_tables.sql
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
