-- Create a function to generate random positions for snippets
CREATE OR REPLACE FUNCTION generate_random_position(index integer, total integer)
RETURNS jsonb AS $$
DECLARE
  columns integer;
  row_num integer;
  col_num integer;
  base_x integer;
  base_y integer;
  random_x integer;
  random_y integer;
BEGIN
  columns := CEIL(SQRT(total::float));
  row_num := FLOOR(index::float / columns::float);
  col_num := index % columns;
  
  base_x := col_num * 400 + 100;
  base_y := row_num * 300 + 100;
  
  random_x := FLOOR(RANDOM() * 100) - 50;
  random_y := FLOOR(RANDOM() * 100) - 50;
  
  RETURN jsonb_build_object('x', base_x + random_x, 'y', base_y + random_y);
END;
$$ LANGUAGE plpgsql;

-- Create a function to ensure all snippets have positions
CREATE OR REPLACE FUNCTION ensure_snippet_positions()
RETURNS void AS $$
DECLARE
  user_record RECORD;
  snippet_record RECORD;
  position_exists BOOLEAN;
  snippet_count INTEGER;
  snippet_index INTEGER;
  position jsonb;
BEGIN
  -- Loop through all users
  FOR user_record IN SELECT DISTINCT user_id FROM snippets LOOP
    -- Count snippets for this user
    SELECT COUNT(*) INTO snippet_count FROM snippets WHERE user_id = user_record.user_id;
    
    -- Reset index for this user
    snippet_index := 0;
    
    -- Loop through all snippets for this user
    FOR snippet_record IN SELECT id FROM snippets WHERE user_id = user_record.user_id LOOP
      -- Check if position exists
      SELECT EXISTS(
        SELECT 1 FROM canvas_positions 
        WHERE user_id = user_record.user_id AND snippet_id = snippet_record.id
      ) INTO position_exists;
      
      -- If position doesn't exist, create one
      IF NOT position_exists THEN
        position := generate_random_position(snippet_index, snippet_count);
        
        INSERT INTO canvas_positions (
          user_id, 
          snippet_id, 
          position_x, 
          position_y, 
          created_at, 
          updated_at
        ) VALUES (
          user_record.user_id,
          snippet_record.id,
          (position->>'x')::float,
          (position->>'y')::float,
          NOW(),
          NOW()
        );
      END IF;
      
      -- Increment index
      snippet_index := snippet_index + 1;
    END LOOP;
    
    -- Ensure canvas settings exist for this user
    IF NOT EXISTS(SELECT 1 FROM canvas_settings WHERE user_id = user_record.user_id) THEN
      INSERT INTO canvas_settings (
        user_id,
        zoom,
        position_x,
        position_y,
        is_public,
        public_access_id,
        created_at,
        updated_at
      ) VALUES (
        user_record.user_id,
        1.0,
        0.0,
        0.0,
        FALSE,
        SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 10),
        NOW(),
        NOW()
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically create a position when a snippet is created
CREATE OR REPLACE FUNCTION create_snippet_position()
RETURNS TRIGGER AS $$
DECLARE
  snippet_count INTEGER;
  position jsonb;
BEGIN
  -- Count existing snippets for this user
  SELECT COUNT(*) INTO snippet_count FROM snippets WHERE user_id = NEW.user_id;
  
  -- Generate a position
  position := generate_random_position(snippet_count - 1, snippet_count);
  
  -- Create a position record
  INSERT INTO canvas_positions (
    user_id,
    snippet_id,
    position_x,
    position_y,
    created_at,
    updated_at
  ) VALUES (
    NEW.user_id,
    NEW.id,
    (position->>'x')::float,
    (position->>'y')::float,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS create_snippet_position_trigger ON snippets;
CREATE TRIGGER create_snippet_position_trigger
AFTER INSERT ON snippets
FOR EACH ROW
EXECUTE FUNCTION create_snippet_position();

-- Run the function to ensure all existing snippets have positions
SELECT ensure_snippet_positions();
