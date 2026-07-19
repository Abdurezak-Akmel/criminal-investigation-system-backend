-- -- Criminal Investigation Portal Database Setup

-- -- 1. EXTENSIONS & ENUMS
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CREATE TYPE user_role AS ENUM ('submitter', 'referee');

-- CREATE TYPE case_status AS ENUM ('open', 'under_review', 'deferred', 'closed_resolved', 'closed_unresolved');

-- CREATE TYPE evidence_status AS ENUM ('submitted', 'accepted_in_evidence', 'rejected', 'sent_to_forensics', 'disposed');

-- CREATE TYPE sensitivity_rating AS ENUM ('public', 'restricted', 'confidential', 'highly_classified');

-- -- 2. PERSONNEL & AUTHENTICATION
-- CREATE TABLE users (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
--     email VARCHAR(255) UNIQUE NOT NULL,
--     password_hash VARCHAR(255) NOT NULL,
--     role user_role NOT NULL DEFAULT 'submitter',
--     full_name VARCHAR(255) NOT NULL,

--     badge_number VARCHAR(50) UNIQUE, -- Critical for law enforcement/justice accountability (Officer Work-Place ID)

--     agency_department VARCHAR(150), -- e.g., "District 4 Narcotics", "State Prosecutor Office"

--     contact_phone VARCHAR(100),
--     is_active BOOLEAN DEFAULT TRUE,
--     is_verified BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP
--     WITH
--         TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE otp_codes (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
--     user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
--     code VARCHAR(6) NOT NULL,
--     expires_at TIMESTAMP
--     WITH
--         TIME ZONE NOT NULL,
--         created_at TIMESTAMP
--     WITH
--         TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- -- 3. CRIMINAL CASES
-- CREATE TABLE cases (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
--     case_number VARCHAR(100) UNIQUE NOT NULL, -- e.g., "CRIM-2026-8941"
--     title VARCHAR(255) NOT NULL,
--     description TEXT NOT NULL,
--     statute_offense VARCHAR(255), -- Legal code violated (e.g., Penal Code 211 - Robbery)
--     incident_date TIMESTAMP
--     WITH
--         TIME ZONE NOT NULL,
--         status case_status DEFAULT 'open',
--         sensitivity sensitivity_rating DEFAULT 'restricted',
--         submitted_by UUID REFERENCES users (id) ON DELETE RESTRICT, -- Prevent deleting personnel tied to a live case
--         assigned_investigator UUID REFERENCES users (id) ON DELETE SET NULL,
--         created_at TIMESTAMP
--     WITH
--         TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--         updated_at TIMESTAMP
--     WITH
--         TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- -- 4. EVIDENCE (Photos, PDFs, Docs)
-- CREATE TABLE evidence_attachments (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     case_id UUID NOT NULL REFERENCES cases(id) ON DELETE RESTRICT, -- Cannot delete a case if evidence exists
--     uploaded_by UUID REFERENCES users(id) ON DELETE RESTRICT,

-- -- Legal Metadata
-- evidence_tag_number VARCHAR(100) UNIQUE, -- Physical/Digital evidence tracking ID
-- description TEXT, -- What does this file show? Context is vital for justice

-- -- File Data
-- original_filename VARCHAR(255) NOT NULL,
-- file_type VARCHAR(100) NOT NULL, -- Strict MIME validation (image/jpeg, application/pdf)
-- file_size BIGINT NOT NULL, -- In bytes

-- -- Storage & Crypto-Integrity
-- file_path VARCHAR(500) NOT NULL, -- Secure S3/Cloud storage path
-- file_key_encrypted TEXT NOT NULL, -- Envelope encryption key
-- iv TEXT NOT NULL, -- Initialization Vector
-- file_sha256 VARCHAR(64) NOT NULL, -- SHA-256 Hash. If this changes, evidence is legally void/tampered.

-- -- Investigation Review State


-- status evidence_status DEFAULT 'submitted',
--     reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
--     review_notes TEXT,
--     reviewed_at TIMESTAMP WITH TIME ZONE,
    
--     uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     retention_expiration_date TIMESTAMP WITH TIME ZONE -- Legal purge date
-- );

-- -- 5. LEGAL CHAIN OF CUSTODY (Immutable Log)
-- -- Note: This table should ideally only allow INSERTs, never UPDATEs or DELETEs via DB permissions.
-- CREATE TABLE chain_of_custody (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
--     evidence_id UUID NOT NULL REFERENCES evidence_attachments (id) ON DELETE RESTRICT,
--     action_by UUID REFERENCES users (id) ON DELETE RESTRICT,
--     action_type VARCHAR(50) NOT NULL, -- 'SUBMITTED', 'VIEWED', 'DOWNLOADED', 'DECRYPTED', 'STATUS_CHANGE'
--     previous_status evidence_status,
--     new_status evidence_status,
--     reason_for_action TEXT NOT NULL, -- Investigators must document *why* they accessed the evidence
--     ip_address VARCHAR(45) NOT NULL,
--     user_agent TEXT,
--     action_timestamp TIMESTAMP
--     WITH
--         TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- -- 6. INDEXES FOR SPEED AND AUDITING
-- CREATE INDEX idx_cases_number ON cases (case_number);

-- CREATE INDEX idx_cases_investigator ON cases (assigned_investigator);

-- CREATE INDEX idx_evidence_case ON evidence_attachments (case_id);

-- CREATE INDEX idx_evidence_hash ON evidence_attachments (file_sha256);

-- CREATE INDEX idx_chain_evidence ON chain_of_custody (evidence_id);