-- STAMPED schema for Neon (Permanent Vault)
-- Structural alias of SPVPET - must be enforced identically per Barton Doctrine

CREATE TABLE IF NOT EXISTS stamped_records (
    -- S: Source ID - Identifies where the record came from
    source_id VARCHAR(255) NOT NULL,
    
    -- T: Task/Process ID - Tied to the blueprint or workflow logic being executed  
    task_id VARCHAR(255) NOT NULL,
    
    -- A: Approved/Validated - Track whether the data passed validation
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- M: Migrated/Promoted To - Target storage reference
    migrated_to VARCHAR(255),
    
    -- P: Process Signature - Unique hash of agent, blueprint, and schema version
    process_signature VARCHAR(255) NOT NULL,
    
    -- E: Event Timestamp - Last update or mutation timestamp
    event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- D: Data Payload - The actual record data (JSON for flexibility)
    data_payload JSONB NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    PRIMARY KEY (source_id, task_id, process_signature),
    INDEX idx_stamped_timestamp (event_timestamp),
    INDEX idx_stamped_approved (approved),
    INDEX idx_stamped_source (source_id),
    INDEX idx_stamped_signature (process_signature)
);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_stamped_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.event_timestamp = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stamped_update_timestamp
    BEFORE UPDATE ON stamped_records
    FOR EACH ROW
    EXECUTE FUNCTION update_stamped_timestamp();

-- Comment explaining the Barton Doctrine compliance
COMMENT ON TABLE stamped_records IS 'STAMPED schema - structural alias of SPVPET/STACKED, enforced identically per Barton Doctrine';
COMMENT ON COLUMN stamped_records.source_id IS 'S: Source ID - where record originated';
COMMENT ON COLUMN stamped_records.task_id IS 'T: Task/Process ID - blueprint/workflow reference';
COMMENT ON COLUMN stamped_records.approved IS 'A: Approved/Validated - validation status';
COMMENT ON COLUMN stamped_records.migrated_to IS 'M: Migrated/Promoted To - target storage';
COMMENT ON COLUMN stamped_records.process_signature IS 'P: Process Signature - execution hash';
COMMENT ON COLUMN stamped_records.event_timestamp IS 'E: Event Timestamp - last touched';
COMMENT ON COLUMN stamped_records.data_payload IS 'D: Data Payload - actual record data';