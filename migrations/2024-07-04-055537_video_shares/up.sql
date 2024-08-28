CREATE TABLE video_shares (
    id SERIAL PRIMARY KEY,
    video_id INTEGER NOT NULL REFERENCES videos(video_id),
    shared_by INTEGER NOT NULL REFERENCES users(id),
    shared_with TEXT NOT NULL,
    share_token UUID NOT NULL UNIQUE,
    starts TIMESTAMP WITH TIME ZONE,
    expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);