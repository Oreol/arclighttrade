import {createServerFn} from '@tanstack/react-start';
import {getRequest} from '@tanstack/react-start/server';
import {requireSupabaseAuth} from '@/integrations/supabase/auth-middleware';
import {z} from 'zod';
import {findNews} from './market-news-data';
import {hasProAccess} from './subscription-data';

export const analyzeNews=createServerFn({method:'POST'})
 .middleware([requireSupabaseAuth])
 .inputValidator(z.object({newsId:z.string()}).strict())
 .handler(async({data,context})=>{
  const news=findNews(data.newsId);
  if(!news)return {ok:false as const,status:400,message:'This story is unavailable.'};
  const [sub,adm]=await Promise.all([context.supabase.rpc('has_role',{_user_id:context.userId,_role:'subscriber'}),context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'})]);
  if(!hasProAccess({subscriber:Boolean(sub.data),admin:Boolean(adm.data)}))return {ok:false as const,status:402,message:'Arclight AI analysis is available to Arclight Pro subscribers.'};
  const {interpretNews}=await import('@/lib/arclight-ai/news.server');
  return interpretNews(news,context.supabase,getRequest());
 });