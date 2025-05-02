-- Add role to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role TEXT NOT NULL DEFAULT 'user';

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- Create invoices table (more comprehensive than purchases)
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  email TEXT,
  full_name TEXT,
  plan_type TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  snippet_limit_added INTEGER NOT NULL,
  payment_intent_id TEXT,
  payment_method TEXT,
  status TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON public.invoices(status);
CREATE INDEX IF NOT EXISTS invoices_created_at_idx ON public.invoices(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for invoices table
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Reset script (commented out by default - use carefully)
-- TRUNCATE public.invoices CASCADE;
-- TRUNCATE public.purchases CASCADE;
-- UPDATE public.profiles SET role = 'user';
