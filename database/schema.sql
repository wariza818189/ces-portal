CREATE TABLE IF NOT EXISTS goods_donations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    category VARCHAR(50) NOT NULL,

    quantity DECIMAL(10,2) UNSIGNED NOT NULL,

    unit VARCHAR(20) NOT NULL DEFAULT 'pcs',

    expiry_date DATE NOT NULL,

    date_received DATE NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_goods_quantity
        CHECK (quantity > 0),

    INDEX idx_goods_expiry_date (expiry_date),
    INDEX idx_goods_category (category)
);

CREATE TABLE IF NOT EXISTS cash_donations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    amount DECIMAL(12,2) UNSIGNED NOT NULL,

    date_received DATE NOT NULL,

    notes VARCHAR(255) NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_cash_amount
        CHECK (amount > 0),

    INDEX idx_cash_date_received (date_received)
);

CREATE TABLE IF NOT EXISTS volunteers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    full_name VARCHAR(100) NOT NULL,

    course_year VARCHAR(100) NOT NULL,

    contact_number VARCHAR(30) NOT NULL,

    activity VARCHAR(150) NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_volunteers_created_at (created_at)
);
