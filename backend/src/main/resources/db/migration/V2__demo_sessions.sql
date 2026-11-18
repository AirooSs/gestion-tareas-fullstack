CREATE TABLE demo_sessions (
    id uuid NOT NULL PRIMARY KEY,
    token_hash char(64) NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL
);
CREATE INDEX demo_sessions_expires_idx ON demo_sessions(expires_at);
