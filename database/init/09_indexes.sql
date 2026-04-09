-- ============================================================
-- Indexes
-- Depends on: all table files
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
