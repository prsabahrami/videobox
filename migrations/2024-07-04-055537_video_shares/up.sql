CREATE TABLE video_shares (
    id SERIAL PRIMARY KEY,
    video_id INTEGER NOT NULL REFERENCES attachments(id),
    shared_by INTEGER NOT NULL REFERENCES users(id),
    shared_with INTEGER NOT NULL REFERENCES users(id),
    share_token UUID NOT NULL UNIQUE,
    start_time INTERVAL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);