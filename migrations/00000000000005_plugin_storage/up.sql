CREATE TABLE attachments(
  id SERIAL PRIMARY KEY,

  user_id INTEGER REFERENCES users(id) NOT NULL,
  name TEXT NOT NULL,
  record_type TEXT NOT NULL,
  record_id SERIAL NOT NULL,
  blob_id SERIAL NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attachment_blobs(
  id SERIAL PRIMARY KEY,

  key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  content_type TEXT,
  byte_size BIGINT NOT NULL,
  checksum TEXT NOT NULL,
  service_name TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
SELECT manage_updated_at('attachments');
