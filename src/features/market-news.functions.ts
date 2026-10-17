import {createServerFn} from '@tanstack/react-start';
import {getRequest} from '@tanstack/react-start/server';
import {requireSupabaseAuth} from '@/integrations/supabase/auth-middleware';
import {z} from 'zod';
import {findNews} from './market-news-data';

export const analyzeNews=createServerFn({method:'POST'})
 .middleware([requireSupabaseAuth])
 .inputValidator(z.object({newsId:z.string()}).strict())
 .handler(async({data,context})=>{
  const news=findNews(data.newsId);
  if(!news)return {ok:false as const,status:400,message:'This story is unavailable.'};
  const {interpretNews}=await import('@/lib/arclight-ai/news.server');
  return interpretNews(news,context.supabase,getRequest());
 });