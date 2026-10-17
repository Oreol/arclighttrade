import {APICallError} from 'ai';
import type {SupabaseClient} from '@supabase/supabase-js';
import type {Database} from '@/integrations/supabase/types';
import {marketNews,matchingSetups} from '@/features/market-news-data';
import {createResponsesCall} from './responses.server.ts';

const model='openai/gpt-6-astra';
export async function interpretNews(news:typeof marketNews[number],client:SupabaseClient<Database>,request:Request){
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const {data:block,error:blockError}=await supabaseAdmin.from('ai_access_blocks').select('message').eq('model',model).maybeSingle();
 if(blockError)return {ok:false as const,status:503,message:'AI access could not be checked. Please try again later.'};
 if(block)return {ok:false as const,status:403,message:block.message};
 const key=process.env['LOVABLE_API_KEY'];
 if(!key)return {ok:false as const,status:401,message:'Arclight AI is not configured yet.'};
 try{
  const call=createResponsesCall(request,{baseURL:'https://ai.gateway.lovable.dev/v1',apiKey:key,model},[{role:'user',content:JSON.stringify(news)}],
   'You are Arclight AI, an institutional news interpreter for an educational evaluation desk. The provided story is a fictional preset scenario, NOT verified current reporting. Analyze only its supplied facts. Give exactly two plain-English sentences in summary. Set impact to Bullish, Bearish or Neutral relative to the primary named asset, and clarify direction for currency pairs in impactReason. Include only affected assets from the story assets list. Explain uncertainty, never invent prices or active setups, give trade instructions or promise returns. Output the required structured object.');
  const analysis=await call.result.output;
  if(!analysis)return {ok:false as const,status:422,message:'Arclight AI returned no analysis. No automatic retry was made.'};
  const assets=analysis.assets.filter(asset=>(news.assets as readonly string[]).includes(asset));
  const [signals,lessons]=await Promise.all([client.from('signals').select('id,asset,status').eq('status','Active'),client.from('lessons').select('id,title,module,module_name').order('sort_order')]);
  const setups=matchingSetups(signals.data??[],assets);
  const lesson=lessons.data?.find(l=>l.id==='f2')??lessons.data?.[0]??null;
  return {ok:true as const,analysis:{...analysis,assets},setups,lesson};
 }catch(error){
  if(APICallError.isInstance(error)){
   const status=error.statusCode??500;
   let message=error.message;
   let type='';
   try {const payload=JSON.parse(error.responseBody??'{}');message=payload.message??payload.error?.message??message;type=payload.type??payload.error?.type??'';}catch{/* retain safe gateway message */}
   if(status===403&&!['provider_not_available_in_region','model_requires_retention_consent','model_vendor_not_enabled','credit_limit_reached'].includes(type)){
    const saved=await supabaseAdmin.from('ai_access_blocks').upsert({model,message});
    if(saved.error)console.error('Could not persist AI access block');
   }
   return {ok:false as const,status,message};
  }
  return {ok:false as const,status:422,message:'Arclight AI could not produce a complete analysis. No automatic retry was made.'};
 }
}