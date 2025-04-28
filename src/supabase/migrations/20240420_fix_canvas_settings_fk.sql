-- Check if the constraint already exists before trying to add it
DO $$
BEGIN
    -- Check if the constraint exists for canvas_settings
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'canvas_settings_user_id_fkey' 
        AND table_name = 'canvas_settings'
    ) THEN
        -- Add foreign key constraint to canvas_settings table only if it doesn't exist
        ALTER TABLE canvas_settings
        ADD CONSTRAINT canvas_settings_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Check if the constraint exists for canvas_positions
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'canvas_positions_user_id_fkey' 
        AND table_name = 'canvas_positions'
    ) THEN
        -- Add foreign key constraint to canvas_positions table only if it doesn't exist
        ALTER TABLE canvas_positions
        ADD CONSTRAINT canvas_positions_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END
$$;
