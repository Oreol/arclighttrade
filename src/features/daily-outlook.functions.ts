import {createServerFn} from '@tanstack/react-start';
import {getRequest} from '@tanstack/react-start/server';
import {requireSupabaseAuth} from '@/integrations/supabase/auth-middleware';
export const getDailyOutlook=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async()=>{
 const {dailyOutlook}=await import('@/lib/arclight-ai/daily-outlook.server');
 return dailyOutlook(getRequest());
});