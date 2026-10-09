-- Additive R1 migration. The runner checkpoints each DDL statement because
-- MySQL DDL implicitly commits; a failed migration is not atomically undone.
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
    CONSTRAINT chk_audit_event CHECK (event_type IN ('AUTH_LOGIN_SUCCESS', 'AUTH_LOGIN_FAILURE', 'AUTH_LOGOUT', 'GOODS_DONATION_CREATED', 'CASH_DONATION_CREATED', 'ADMIN_BOOTSTRAPPED')),
    CONSTRAINT chk_audit_outcome CHECK (outcome IN ('SUCCESS', 'FAILURE')),
    INDEX idx_audit_created (created_at, id),
    INDEX idx_audit_actor (actor_user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE goods_donations ADD COLUMN recorded_by BIGINT UNSIGNED NULL;
ALTER TABLE goods_donations ADD INDEX idx_goods_recorded_by (recorded_by);
ALTER TABLE goods_donations ADD CONSTRAINT fk_goods_recorded_by FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE cash_donations ADD COLUMN recorded_by BIGINT UNSIGNED NULL;
ALTER TABLE cash_donations ADD INDEX idx_cash_recorded_by (recorded_by);
ALTER TABLE cash_donations ADD CONSTRAINT fk_cash_recorded_by FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT;
