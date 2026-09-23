-- SafeReplay Initial PostgreSQL Migration
-- Synthetic demo schema

CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(64) PRIMARY KEY,
  page VARCHAR(255) NOT NULL,
  browser VARCHAR(255),
  status VARCHAR(32) DEFAULT 'active',
  has_error BOOLEAN DEFAULT FALSE,
  db_status VARCHAR(32) DEFAULT 'none',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS replay_events (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(64) REFERENCES sessions(session_id) ON DELETE CASCADE,
  event_type VARCHAR(64) NOT NULL,
  page VARCHAR(255) NOT NULL,
  data JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS runtime_errors (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(64) REFERENCES sessions(session_id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  file VARCHAR(255) NOT NULL,
  line INT NOT NULL,
  column_no INT DEFAULT 0,
  function_name VARCHAR(255) DEFAULT 'anonymous',
  stack TEXT,
  page VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS network_events (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(64) REFERENCES sessions(session_id) ON DELETE CASCADE,
  method VARCHAR(16) NOT NULL,
  url TEXT NOT NULL,
  status INT NOT NULL,
  duration INT NOT NULL,
  page VARCHAR(255) NOT NULL,
  headers JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS database_results (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(64) REFERENCES sessions(session_id) ON DELETE CASCADE,
  operation VARCHAR(128) NOT NULL,
  status VARCHAR(32) NOT NULL,
  reason TEXT,
  record_id VARCHAR(64),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_analysis (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(64) REFERENCES sessions(session_id) ON DELETE CASCADE,
  error_title TEXT NOT NULL,
  severity VARCHAR(32) NOT NULL,
  file VARCHAR(255) NOT NULL,
  start_line INT NOT NULL,
  end_line INT NOT NULL,
  function_name VARCHAR(255) NOT NULL,
  root_cause TEXT NOT NULL,
  explanation TEXT NOT NULL,
  corrected_code TEXT NOT NULL,
  confidence NUMERIC(3,2) NOT NULL,
  provider VARCHAR(32) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_events (
  id SERIAL PRIMARY KEY,
  action VARCHAR(128) NOT NULL,
  target_id VARCHAR(64),
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(128) NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  rating NUMERIC(3,2) NOT NULL,
  image VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  in_stock BOOLEAN DEFAULT TRUE
);
