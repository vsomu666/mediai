
CREATE TABLE public.analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT,
  age INTEGER,
  gender TEXT,
  symptoms TEXT,
  disease_name TEXT,
  description TEXT,
  risk_level TEXT,
  precautions JSONB,
  things_to_avoid JSONB,
  recommendations JSONB,
  chart_data JSONB
);

ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read analyses" ON public.analyses FOR SELECT USING (true);
CREATE POLICY "Anyone can insert analyses" ON public.analyses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete analyses" ON public.analyses FOR DELETE USING (true);
