CREATE TABLE public.ai_access_blocks (model text PRIMARY KEY, message text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.ai_access_blocks TO service_role;
ALTER TABLE public.ai_access_blocks ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.ai_access_blocks IS 'Server-managed terminal AI access blocks; remove only after provider access has been restored.';