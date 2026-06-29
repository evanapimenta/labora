CREATE TABLE IF NOT EXISTS user_tokens (
    user_id VARCHAR(36) PRIMARY KEY,
    access_token TEXT,
    refresh_token TEXT,
    id_token TEXT,
    expires_at TIMESTAMP NOT NULL,
    provider VARCHAR(50)
)