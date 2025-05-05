-- This migration ensures that all snippets have positions in the canvas_positions table

-- Create a function to generate positions for snippets that don't have them
CREATE OR REPLACE FUNCTION ensure_snippet_positions() RETURNS void AS $$
DECLARE
    snippet_record RECORD;
    position_count INTEGER;
    snippet_count INTEGER := 0;
    row_index INTEGER := 0;
    col_index INTEGER := 0;
BEGIN
    -- Get total number of snippets
    SELECT COUNT(*) INTO snippet_count FROM snippets;
    
    -- Process each snippet
    FOR snippet_record IN SELECT s.id, s.user_id FROM snippets s
    LOOP
        -- Check if position exists
        SELECT COUNT(*) INTO position_count 
        FROM canvas_positions 
        WHERE snippet_id = snippet_record.id AND user_id = snippet_record.user_id;
        
        -- If no position exists, create one
        IF position_count = 0 THEN
            INSERT INTO canvas_positions (
                user_id, 
                snippet_id, 
                position_x, 
                position_y
            ) VALUES (
                snippet_record.user_id,
                snippet_record.id,
                100 + (col_index * 350),  -- Grid layout: x position
                100 + (row_index * 300)   -- Grid layout: y position
            );
            
            -- Update grid position for next snippet
            col_index := col_index + 1;
            IF col_index >= 3 THEN  -- 3 columns per row
                col_index := 0;
                row_index := row_index + 1;
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the function to ensure all snippets have positions
SELECT ensure_snippet_positions();

-- Create a trigger to automatically create a position when a new snippet is created
CREATE OR REPLACE FUNCTION create_snippet_position() RETURNS TRIGGER AS $$
DECLARE
    position_count INTEGER;
    row_index INTEGER := 0;
    col_index INTEGER := 0;
    snippet_count INTEGER;
BEGIN
    -- Get the current number of snippets for this user to determine position
    SELECT COUNT(*) INTO snippet_count 
    FROM snippets 
    WHERE user_id = NEW.user_id;
    
    -- Calculate grid position based on snippet count
    row_index := FLOOR((snippet_count - 1) / 3);
    col_index := (snippet_count - 1) % 3;
    
    -- Insert position
    INSERT INTO canvas_positions (
        user_id, 
        snippet_id, 
        position_x, 
        position_y
    ) VALUES (
        NEW.user_id,
        NEW.id,
        100 + (col_index * 350),  -- Grid layout: x position
        100 + (row_index * 300)   -- Grid layout: y position
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it already exists
DROP TRIGGER IF EXISTS snippet_position_trigger ON snippets;

-- Create the trigger
CREATE TRIGGER snippet_position_trigger
AFTER INSERT ON snippets
FOR EACH ROW
EXECUTE FUNCTION create_snippet_position();

-- Create default canvas settings for users who don't have them
INSERT INTO canvas_settings (user_id, zoom, position_x, position_y, is_public, public_access_id)
SELECT 
    p.id as user_id, 
    1.0 as zoom, 
    0.0 as position_x, 
    0.0 as position_y, 
    false as is_public,
    encode(gen_random_bytes(5), 'hex') as public_access_id
FROM 
    auth.users u
JOIN 
    profiles p ON u.id = p.id
LEFT JOIN 
    canvas_settings cs ON p.id = cs.user_id
WHERE 
    cs.id IS NULL;
