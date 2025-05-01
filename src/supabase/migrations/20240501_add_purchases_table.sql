-- Create a purchases table to track payment history
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  plan_type TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  snippet_limit_added INTEGER NOT NULL,
  payment_intent_id TEXT,
  status TEXT NOT NULL
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS purchases_user_id_idx ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS purchases_payment_intent_id_idx ON public.purchases(payment_intent_id);

-- Add this to your database.types.ts file
-- purchases: {
--   Row: {
--     id: string
--     created_at: string
--     user_id: string
--     plan_type: string
--     amount: number
--     snippet_limit_added: number
--     payment_intent_id: string | null
--     status: string
--   }
--   Insert: {
--     id?: string
--     created_at?: string
--     user_id: string
--     plan_type: string
--     amount: number
--     snippet_limit_added: number
--     payment_intent_id?: string | null
--     status: string
--   }
--   Update: {
--     id?: string
--     created_at?: string
--     user_id?: string
--     plan_type?: string
--     amount?: number
--     snippet_limit_added?: number
--     payment_intent_id?: string | null
--     status?: string
--   }
-- }
