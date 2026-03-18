-- Paperwork Genius Premium - Database Schema
-- Run this in Supabase SQL Editor after enabling PostGIS extension

-- Enable PostGIS (do this in Dashboard > Database > Extensions first)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Permits table (unified schema for all data sources)
CREATE TABLE IF NOT EXISTS permits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL CHECK (source IN ('shovels', 'miami_dade_arcgis', 'manual')),
  source_id TEXT,                          -- Original ID from source system
  address TEXT NOT NULL,
  city TEXT,
  county TEXT NOT NULL,
  state TEXT DEFAULT 'FL',
  zip_code TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location GEOMETRY(Point, 4326),          -- PostGIS point for spatial queries
  permit_type TEXT NOT NULL CHECK (permit_type IN (
    'new_construction',
    'demolition',
    'commercial_buildout',
    'major_renovation',
    'multifamily',
    'other'
  )),
  permit_number TEXT,
  description TEXT,
  project_value NUMERIC,                   -- Estimated construction value in dollars
  filing_date DATE,
  issue_date DATE,
  completion_date DATE,
  status TEXT,
  contractor_name TEXT,
  contractor_license TEXT,
  raw_data JSONB,                          -- Store full original record for reference
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate imports
  UNIQUE(source, source_id)
);

-- Spatial index for geographic queries (critical for map performance)
CREATE INDEX IF NOT EXISTS idx_permits_location ON permits USING GIST (location);

-- Index for filtering
CREATE INDEX IF NOT EXISTS idx_permits_type ON permits (permit_type);
CREATE INDEX IF NOT EXISTS idx_permits_county ON permits (county);
CREATE INDEX IF NOT EXISTS idx_permits_filing_date ON permits (filing_date);
CREATE INDEX IF NOT EXISTS idx_permits_value ON permits (project_value);

-- Auto-populate the PostGIS location column from lat/lng
CREATE OR REPLACE FUNCTION set_permit_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists, then create
DROP TRIGGER IF EXISTS trigger_set_permit_location ON permits;
CREATE TRIGGER trigger_set_permit_location
  BEFORE INSERT OR UPDATE OF latitude, longitude ON permits
  FOR EACH ROW
  EXECUTE FUNCTION set_permit_location();

-- Row Level Security
ALTER TABLE permits ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all permits
DROP POLICY IF EXISTS "Authenticated users can view permits" ON permits;
CREATE POLICY "Authenticated users can view permits"
  ON permits FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can insert/update (for data pipeline)
DROP POLICY IF EXISTS "Service role can manage permits" ON permits;
CREATE POLICY "Service role can manage permits"
  ON permits FOR ALL
  TO service_role
  USING (true);

-- Function to query permits within a bounding box (called from frontend)
CREATE OR REPLACE FUNCTION get_permits_in_bounds(
  min_lng DOUBLE PRECISION,
  min_lat DOUBLE PRECISION,
  max_lng DOUBLE PRECISION,
  max_lat DOUBLE PRECISION,
  permit_types TEXT[] DEFAULT NULL,
  min_value NUMERIC DEFAULT NULL
)
RETURNS SETOF permits AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM permits
  WHERE ST_Intersects(
    location,
    ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
  )
  AND (permit_types IS NULL OR permit_type = ANY(permit_types))
  AND (min_value IS NULL OR project_value >= min_value)
  ORDER BY filing_date DESC NULLS LAST
  LIMIT 5000;
END;
$$ LANGUAGE plpgsql;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_permits_in_bounds TO authenticated;
GRANT EXECUTE ON FUNCTION get_permits_in_bounds TO service_role;
