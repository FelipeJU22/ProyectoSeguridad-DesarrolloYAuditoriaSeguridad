-- ============================================================
-- Seed Data (time 0)
-- Depends on: all table files
-- Passwords shown in comments, stored as bcrypt hashes
-- ============================================================

-- Surgery types catalog
INSERT INTO surgery_types (id, name, description, estimated_duration_minutes) VALUES
    ('a1000000-0000-0000-0000-000000000001', 'Appendectomy',     'Surgical removal of the appendix',           60),
    ('a1000000-0000-0000-0000-000000000002', 'Cholecystectomy',  'Gallbladder removal',                        90),
    ('a1000000-0000-0000-0000-000000000003', 'Knee Arthroscopy', 'Minimally invasive knee joint surgery',      75),
    ('a1000000-0000-0000-0000-000000000004', 'Hernia Repair',    'Inguinal or umbilical hernia correction',    80),
    ('a1000000-0000-0000-0000-000000000005', 'Cataract Surgery', 'Lens replacement for cataract patients',     45);

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

    -- assistant  password: Assistant1234!
    ('b0000000-0000-0000-0000-000000000006',
     'assistant.castro@hospital.cr',
     '$2b$12$3Rb7Ud9We1Xf4Yg8Zh2Ai5Bj0Ck6Dl9Em3Fn7Go1Hp5Iq8Jr2Ks6L',
     'assistant', 'Pedro', 'Castro', '+50688880006'),

    ('b0000000-0000-0000-0000-000000000007',
     'assistant.rodriguez@hospital.cr',
     '$2b$12$3Rb7Ud9We1Xf4Yg8Zh2Ai5Bj0Ck6Dl9Em3Fn7Go1Hp5Iq8Jr2Ks6L',
     'assistant', 'Laura', 'Rodríguez', '+50688880007'),

    -- patient  password: Patient1234!
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

-- Surgery assistant assignments
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
    ('b0000000-0000-0000-0000-000000000001', 'LOGIN',           NULL,        NULL,                                        '192.168.1.10'),
    ('b0000000-0000-0000-0000-000000000001', 'CREATE_SURGERY',  'surgeries', 'e0000000-0000-0000-0000-000000000001',      '192.168.1.10'),
    ('b0000000-0000-0000-0000-000000000001', 'CREATE_SURGERY',  'surgeries', 'e0000000-0000-0000-0000-000000000002',      '192.168.1.10'),
    ('b0000000-0000-0000-0000-000000000008', 'LOGIN',           NULL,        NULL,                                        '192.168.1.20'),
    ('b0000000-0000-0000-0000-000000000008', 'UPLOAD_DOCUMENT', 'documents', 'f0000000-0000-0000-0000-000000000001',      '192.168.1.20');
