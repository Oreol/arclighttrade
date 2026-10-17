CREATE TABLE public.daily_market_outlooks (day date PRIMARY KEY, status text NOT NULL DEFAULT 'generating', sentences jsonb, message text, created_at timestamptz NOT NULL DEFAULT now(), lease_until timestamptz NOT NULL DEFAULT now() + interval '5 minutes');
GRANT SELECT ON public.daily_market_outlooks TO anon, authenticated;
GRANT ALL ON public.daily_market_outlooks TO service_role;
ALTER TABLE public.daily_market_outlooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read completed educational outlooks" ON public.daily_market_outlooks FOR SELECT TO anon, authenticated USING (status = 'ready');
COMMENT ON TABLE public.daily_market_outlooks IS 'One global UTC daily briefing, day primary key is the single-flight generation lock. Failed days do not retry automatically.';