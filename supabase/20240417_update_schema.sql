-- Remove current_period_end from subscriptions table
ALTER TABLE subscriptions DROP COLUMN IF EXISTS current_period_end;

-- Add views column to snippets table
ALTER TABLE snippets ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Create index on views for faster querying of popular snippets
CREATE INDEX IF NOT EXISTS idx_snippets_views ON snippets(views);

-- Create index on is_public for faster querying of public snippets
CREATE INDEX IF NOT EXISTS idx_snippets_public ON snippets(is_public);
