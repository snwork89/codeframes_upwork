-- Create canvas_positions table to store node positions and canvas state
CREATE TABLE IF NOT EXISTS canvas_positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  snippet_id UUID REFERENCES snippets(id) ON DELETE CASCADE NOT NULL,
  position_x FLOAT NOT NULL,
  position_y FLOAT NOT NULL,
  UNIQUE(user_id, snippet_id)
);

-- Create canvas_settings table to store canvas view settings
CREATE TABLE IF NOT EXISTS canvas_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  zoom FLOAT DEFAULT 1.0,
  position_x FLOAT DEFAULT 0.0,
  position_y FLOAT DEFAULT 0.0,
  public_access_id TEXT UNIQUE,
  is_public BOOLEAN DEFAULT FALSE
);

-- Add RLS policies for canvas_positions
ALTER TABLE canvas_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own canvas positions" 
  ON canvas_positions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own canvas positions" 
  ON canvas_positions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own canvas positions" 
  ON canvas_positions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own canvas positions" 
  ON canvas_positions FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for canvas_settings
ALTER TABLE canvas_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own canvas settings" 
  ON canvas_settings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public canvas settings" 
  ON canvas_settings FOR SELECT 
  USING (is_public = TRUE);

CREATE POLICY "Users can insert their own canvas settings" 
  ON canvas_settings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own canvas settings" 
  ON canvas_settings FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_canvas_positions_user_id ON canvas_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_positions_snippet_id ON canvas_positions(snippet_id);
CREATE INDEX IF NOT EXISTS idx_canvas_settings_user_id ON canvas_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_settings_public_access_id ON canvas_settings(public_access_id);
