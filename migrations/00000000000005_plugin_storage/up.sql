CREATE TABLE videos(
  video_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  file_name TEXT NOT NULL,
  course_name TEXT,
  stream_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);