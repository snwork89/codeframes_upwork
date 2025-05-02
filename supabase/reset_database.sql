-- WARNING: This script will delete all data in the database
-- Only use this in development environments

-- Reset invoices table
TRUNCATE public.invoices CASCADE;

-- Reset purchases table
TRUNCATE public.purchases CASCADE;

-- Reset subscriptions to free plan
UPDATE public.subscriptions 
SET plan_type = 'free', 
    status = 'active', 
    snippet_limit = 10, 
    stripe_customer_id = NULL, 
    stripe_subscription_id = NULL, 
    stripe_price_id = NULL;

-- Reset user roles (except for specified admin emails)
UPDATE public.profiles 
SET role = 'user' 
WHERE email NOT IN ('admin@example.com'); -- Replace with your admin email

-- Set specific users as admins (if needed)
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com'; -- Replace with your admin email
