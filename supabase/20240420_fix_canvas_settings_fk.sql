-- Add foreign key constraint to canvas_settings table
ALTER TABLE canvas_settings
ADD CONSTRAINT canvas_settings_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Make sure the same constraint exists for canvas_positions table
ALTER TABLE canvas_positions
DROP CONSTRAINT IF EXISTS canvas_positions_user_id_fkey;

ALTER TABLE canvas_positions
ADD CONSTRAINT canvas_positions_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
