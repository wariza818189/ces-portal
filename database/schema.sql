-- Fresh-install R2 schema. Existing installations use the numbered migration.
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    password_hash VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    role VARCHAR(10) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'STAFF',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(3) NOT NULL DEFAULT (UTC_TIMESTAMP(3)),
    updated_at DATETIME(3) NOT NULL DEFAULT (UTC_TIMESTAMP(3)),
    CONSTRAINT chk_users_role CHECK (role IN ('ADMIN', 'STAFF')),
    CONSTRAINT chk_users_active CHECK (is_active IN (0, 1)),
    CONSTRAINT chk_users_username CHECK (REGEXP_LIKE(username, '^[a-z0-9][a-z0-9._-]{0,63}$', 'c')),
    UNIQUE INDEX idx_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS staff_sessions (
    token_hash BINARY(32) PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    created_at DATETIME(3) NOT NULL,
    expires_at DATETIME(3) NOT NULL,
    CONSTRAINT fk_staff_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT chk_staff_session_expiry CHECK (expires_at > created_at),
    INDEX idx_staff_sessions_user (user_id),
    INDEX idx_staff_sessions_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS auth_rate_limits (
    identifier_hash BINARY(32) PRIMARY KEY,
    failures TINYINT UNSIGNED NOT NULL DEFAULT 0,
    window_started_at DATETIME(3) NOT NULL,
    CONSTRAINT chk_auth_failures CHECK (failures <= 5),
    INDEX idx_auth_rate_window (window_started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    actor_user_id BIGINT UNSIGNED NULL,
    event_type VARCHAR(40) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    entity_type VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    entity_id BIGINT UNSIGNED NULL,
    outcome VARCHAR(10) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    reason_code VARCHAR(40) CHARACTER SET ascii COLLATE ascii_bin NULL,
    metadata JSON NULL,
    created_at DATETIME(3) NOT NULL DEFAULT (UTC_TIMESTAMP(3)),
    CONSTRAINT fk_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT chk_audit_event CHECK (event_type IN ('AUTH_LOGIN_SUCCESS', 'AUTH_LOGIN_FAILURE', 'AUTH_LOGOUT', 'GOODS_DONATION_CREATED', 'CASH_DONATION_CREATED', 'ADMIN_BOOTSTRAPPED', 'ACTIVITY_CREATED', 'ACTIVITY_UPDATED', 'ACTIVITY_STATUS_CHANGED')),
    CONSTRAINT chk_audit_outcome CHECK (outcome IN ('SUCCESS', 'FAILURE')),
    INDEX idx_audit_created (created_at, id),
    INDEX idx_audit_actor (actor_user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS goods_donations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    category VARCHAR(50) NOT NULL,

    quantity DECIMAL(10,2) UNSIGNED NOT NULL,

    unit VARCHAR(20) NOT NULL DEFAULT 'pcs',

    expiry_date DATE NOT NULL,

    date_received DATE NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    recorded_by BIGINT UNSIGNED NULL,

    CONSTRAINT fk_goods_recorded_by FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    INDEX idx_goods_recorded_by (recorded_by),

    CONSTRAINT chk_goods_quantity
        CHECK (quantity > 0),

    INDEX idx_goods_expiry_date (expiry_date),
    INDEX idx_goods_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cash_donations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    amount DECIMAL(12,2) UNSIGNED NOT NULL,

    date_received DATE NOT NULL,

    notes VARCHAR(255) NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    recorded_by BIGINT UNSIGNED NULL,

    CONSTRAINT fk_cash_recorded_by FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    INDEX idx_cash_recorded_by (recorded_by),

    CONSTRAINT chk_cash_amount
        CHECK (amount > 0),

    INDEX idx_cash_date_received (date_received)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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

CREATE TABLE IF NOT EXISTS volunteers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    full_name VARCHAR(100) NOT NULL,

    course_year VARCHAR(100) NOT NULL,

    contact_number VARCHAR(30) NOT NULL,

    activity VARCHAR(150) NOT NULL,

    activity_id BIGINT UNSIGNED NULL,
    INDEX idx_volunteers_activity_id (activity_id),
    CONSTRAINT fk_volunteers_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE RESTRICT ON UPDATE RESTRICT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_volunteers_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
