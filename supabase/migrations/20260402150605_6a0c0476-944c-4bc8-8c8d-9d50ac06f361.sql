CREATE TABLE public.email_subscribers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  name text,
  source text DEFAULT 'quiz_gate',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT email_subscribers_email_unique UNIQUE (email)
);

ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe" ON public.email_subscribers
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "No one can read subscribers" ON public.email_subscribers
  FOR SELECT TO anon, authenticated
  USING (false);