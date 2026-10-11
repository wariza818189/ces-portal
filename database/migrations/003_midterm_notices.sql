-- Branch-only midterm foundation. No seeds or business-record changes.
CREATE TABLE IF NOT EXISTS notices (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    message VARCHAR(2000) NOT NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT (UTC_TIMESTAMP(3)),
    updated_at DATETIME(3) NOT NULL DEFAULT (UTC_TIMESTAMP(3)),
    revision INT UNSIGNED NOT NULL DEFAULT 1,
    CONSTRAINT fk_notices_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT chk_notices_title CHECK (CHAR_LENGTH(TRIM(title)) > 0),
    CONSTRAINT chk_notices_message CHECK (CHAR_LENGTH(TRIM(message)) > 0),
    CONSTRAINT chk_notices_revision CHECK (revision > 0),
    INDEX idx_notices_created_by (created_by),
    INDEX idx_notices_updated (updated_at, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE audit_logs DROP CHECK chk_audit_event, ADD CONSTRAINT chk_audit_event CHECK (event_type IN ('AUTH_LOGIN_SUCCESS', 'AUTH_LOGIN_FAILURE', 'AUTH_LOGOUT', 'GOODS_DONATION_CREATED', 'CASH_DONATION_CREATED', 'ADMIN_BOOTSTRAPPED', 'ACTIVITY_CREATED', 'ACTIVITY_UPDATED', 'ACTIVITY_STATUS_CHANGED', 'NOTICE_CREATED', 'NOTICE_UPDATED', 'NOTICE_DELETED'));
