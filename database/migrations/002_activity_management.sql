-- R2 preserves all historical Volunteer text. No seeds or backfill.
CREATE TABLE IF NOT EXISTS activities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    activity_date DATE NOT NULL,
    status VARCHAR(10) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'DRAFT',
    venue_name VARCHAR(250) NULL,
    latitude DECIMAL(8,6) NULL,
    longitude DECIMAL(9,6) NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT (UTC_TIMESTAMP(3)),
    updated_at DATETIME(3) NOT NULL DEFAULT (UTC_TIMESTAMP(3)),
    revision INT UNSIGNED NOT NULL DEFAULT 1,
    CONSTRAINT fk_activities_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT chk_activities_name CHECK (CHAR_LENGTH(TRIM(name)) > 0),
    CONSTRAINT chk_activities_date CHECK (activity_date >= '1000-01-01'),
    CONSTRAINT chk_activities_status CHECK (status IN ('DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED')),
    CONSTRAINT chk_activities_venue CHECK (venue_name IS NULL OR CHAR_LENGTH(TRIM(venue_name)) > 0),
    CONSTRAINT chk_activities_coordinate_pair CHECK ((latitude IS NULL AND longitude IS NULL) OR (latitude IS NOT NULL AND longitude IS NOT NULL)),
    CONSTRAINT chk_activities_latitude CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
    CONSTRAINT chk_activities_longitude CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
    CONSTRAINT chk_activities_coordinate_venue CHECK (latitude IS NULL OR venue_name IS NOT NULL),
    CONSTRAINT chk_activities_revision CHECK (revision > 0),
    INDEX idx_activities_status_date (status, activity_date, id),
    INDEX idx_activities_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE volunteers ADD COLUMN activity_id BIGINT UNSIGNED NULL;
ALTER TABLE volunteers ADD INDEX idx_volunteers_activity_id (activity_id);
ALTER TABLE volunteers ADD CONSTRAINT fk_volunteers_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE audit_logs DROP CHECK chk_audit_event, ADD CONSTRAINT chk_audit_event CHECK (event_type IN ('AUTH_LOGIN_SUCCESS', 'AUTH_LOGIN_FAILURE', 'AUTH_LOGOUT', 'GOODS_DONATION_CREATED', 'CASH_DONATION_CREATED', 'ADMIN_BOOTSTRAPPED', 'ACTIVITY_CREATED', 'ACTIVITY_UPDATED', 'ACTIVITY_STATUS_CHANGED'));
