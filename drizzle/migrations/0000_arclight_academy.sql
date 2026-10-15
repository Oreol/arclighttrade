CREATE TYPE public.app_role AS ENUM ('admin','subscriber','student');
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, role public.app_role NOT NULL, UNIQUE(user_id,role));
GRANT SELECT ON public.user_roles TO authenticated; GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_roles ON public.user_roles FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE FUNCTION public.has_role(_user_id uuid,_role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;
CREATE TABLE public.signals (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), asset text NOT NULL, bias text NOT NULL CHECK(bias IN ('LONG','SHORT')), entry_low numeric NOT NULL, entry_high numeric NOT NULL, stop numeric NOT NULL, tp1 numeric NOT NULL, tp2 numeric NOT NULL, tp3 numeric NOT NULL, premium boolean NOT NULL DEFAULT false, thesis text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.signals TO anon,authenticated; GRANT INSERT,UPDATE,DELETE ON public.signals TO authenticated; GRANT ALL ON public.signals TO service_role;
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY readable_signals ON public.signals FOR SELECT TO anon,authenticated USING(NOT premium OR public.has_role(auth.uid(),'subscriber') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY admin_signals ON public.signals FOR ALL TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE TABLE public.signal_teasers (signal_id uuid PRIMARY KEY REFERENCES public.signals(id) ON DELETE CASCADE,asset text NOT NULL,bias text NOT NULL);
GRANT SELECT ON public.signal_teasers TO anon,authenticated; GRANT ALL ON public.signal_teasers TO service_role;
ALTER TABLE public.signal_teasers ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_teasers ON public.signal_teasers FOR SELECT TO anon,authenticated USING(true);
CREATE FUNCTION public.sync_signal_teaser() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN IF NEW.premium THEN INSERT INTO public.signal_teasers(signal_id,asset,bias) VALUES(NEW.id,NEW.asset,NEW.bias) ON CONFLICT(signal_id) DO UPDATE SET asset=excluded.asset,bias=excluded.bias; ELSE DELETE FROM public.signal_teasers WHERE signal_id=NEW.id; END IF; RETURN NEW; END $$;
CREATE TRIGGER signal_teaser_sync AFTER INSERT OR UPDATE ON public.signals FOR EACH ROW EXECUTE FUNCTION public.sync_signal_teaser();
CREATE TABLE public.lessons(id text PRIMARY KEY,module integer NOT NULL,module_name text NOT NULL,title text NOT NULL,duration integer NOT NULL,body text NOT NULL,sort_order integer NOT NULL);
GRANT SELECT ON public.lessons TO anon,authenticated; GRANT ALL ON public.lessons TO service_role;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_lessons ON public.lessons FOR SELECT TO anon,authenticated USING(true);
CREATE TABLE public.desk_accounts(user_id uuid PRIMARY KEY,display_name text NOT NULL DEFAULT 'Oyeniran',balance numeric NOT NULL DEFAULT 10000,completed text[] NOT NULL DEFAULT '{}',positions jsonb NOT NULL DEFAULT '[]',history jsonb NOT NULL DEFAULT '[]',notifications boolean NOT NULL DEFAULT true,updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT,UPDATE ON public.desk_accounts TO authenticated; GRANT ALL ON public.desk_accounts TO service_role;
ALTER TABLE public.desk_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_account ON public.desk_accounts FOR ALL TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
CREATE POLICY admin_account_read ON public.desk_accounts FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE TABLE public.subscriptions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid NOT NULL,monthly_amount numeric NOT NULL DEFAULT 0,status text NOT NULL DEFAULT 'inactive',created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.subscriptions TO authenticated; GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_subscription ON public.subscriptions FOR SELECT TO authenticated USING(user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
INSERT INTO public.signals(asset,bias,entry_low,entry_high,stop,tp1,tp2,tp3,premium,thesis) VALUES
('XAU/USD','LONG',2640,2645,2628,2660,2675,2690,false,'Bullish continuation above the London range. Wait for a liquidity sweep and confirmation at the demand zone.'),
('EUR/USD','LONG',1.084,1.085,1.0815,1.088,1.091,1.094,false,'Demand holding above prior session value. Look for a controlled retracement into the entry zone.'),
('GBP/USD','SHORT',1.298,1.3,1.303,1.293,1.289,1.285,false,'Supply overhead with a lower high on the hourly structure. Invalidation above the previous session high.'),
('USD/JPY','LONG',149.2,149.4,148.8,150,150.4,151,true,'Order-flow confirmation at the Asian range high.');
INSERT INTO public.lessons(id,module,module_name,title,duration,body,sort_order) VALUES
('f1',1,'Foundations','The forex market, explained',8,'The foreign exchange market is a decentralized network where currencies trade in pairs. The base currency is the first currency; the quote currency is the second. EUR/USD at 1.0850 means one euro costs 1.0850 US dollars. Major pairs tend to have deeper liquidity, but spreads can widen during news and session transitions. Define the instrument, session and invalidation before allocating capital.',1),
('f2',1,'Foundations','Sessions, liquidity & market participants',12,'Trading activity follows the Asian, London and New York sessions. Liquidity is not constant: the London–New York overlap often has greater participation. Banks, funds, corporations and individual traders have different objectives. A session boundary is context, not a standalone signal. Record the session and any scheduled releases in your trading journal.',2),
('f3',1,'Foundations','Position sizing & capital preservation',10,'Risk starts with invalidation. Define the maximum dollar loss you accept, then divide that amount by the distance between entry and stop to estimate units. Notional allocation and dollars at risk are not the same thing. A stop is an instruction, not a guarantee of fill in live markets. The Execution Sandbox uses reference marks and does not model slippage or commissions.',3),
('t1',2,'Technical Analysis','Reading market structure',14,'Structure is the sequence of swing highs and lows. A trend shows directional expansion and controlled retracements. A break of a meaningful swing can signal a shift, but context and closing confirmation matter. Identify the higher-timeframe structure first, then refine execution on a lower timeframe.',4),
('t2',2,'Technical Analysis','Support, resistance & confluence',11,'Support and resistance are zones of prior participation rather than exact price barriers. Mark only consequential reactions. A stronger thesis combines structure, session context and a clear invalidation. Avoid counting correlated indicators as independent confirmations.',5),
('t3',2,'Technical Analysis','Building an execution plan',16,'An execution plan records entry criteria, allocation, invalidation and targets before the order. Predefine what would cancel the setup. After closing, review adherence to the plan separately from the outcome. A profitable rule violation is still a process failure.',6),
('s1',3,'Smart Money Concepts','Liquidity pools & displacement',15,'Liquidity often clusters around visible swing levels and equal highs or lows. A sweep alone does not establish direction. Look for displacement, structure change and a retracement that offers defined invalidation. These are interpretive tools, not evidence of any specific institution’s intent.',7),
('s2',3,'Smart Money Concepts','Order flow & fair value gaps',18,'A fair value gap describes a three-candle imbalance. Not all gaps fill, and a gap is not a trade by itself. Evaluate the surrounding trend, liquidity and time of day. Keep your entry and invalidation objective enough that another analyst could reproduce the plan.',8),
('e1',4,'Execution & Discipline','The disciplined trading process',12,'Use a pre-session checklist, a fixed risk budget and a post-session review. Discipline measures adherence to a repeatable plan, not frequency of trading. Standing aside is a valid decision when criteria are absent. Review drawdown and exposure before initiating a new position.',9);
ALTER PUBLICATION supabase_realtime ADD TABLE public.signals;