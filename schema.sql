-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create dedicated schema for NPS app
CREATE SCHEMA IF NOT EXISTS nps;

-- Create parks table in nps schema
CREATE TABLE IF NOT EXISTS nps.parks (
  id VARCHAR PRIMARY KEY,
  park_code VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR NOT NULL,
  description TEXT,
  url VARCHAR,
  states VARCHAR[],
  lat_long VARCHAR,
  relevance_score FLOAT,
  
  -- NPS API fields stored as JSONB
  addresses JSONB,
  activities JSONB,
  topics JSONB,
  amenities JSONB,
  
  -- Embedding vector (384 dimensions for all-MiniLM-L6-v2 model)
  embedding vector(384),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for vector similarity search (IVFFlat)
CREATE INDEX IF NOT EXISTS parks_embedding_idx ON nps.parks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for state filtering (GIN)
CREATE INDEX IF NOT EXISTS parks_states_idx ON nps.parks 
USING GIN (states);

-- Index for park code lookups
CREATE INDEX IF NOT EXISTS parks_park_code_idx ON nps.parks (park_code);

-- Index for relevance score
CREATE INDEX IF NOT EXISTS parks_relevance_score_idx ON nps.parks (relevance_score DESC);
