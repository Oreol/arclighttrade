import {createOpenAI} from '@ai-sdk/openai';
import {streamText,Output,APICallError} from 'ai';
import {dailyOutlookSchema,outlookSentences,utcDay,canGenerate} from '@/features/daily-outlook-data';
import {marketNews} from '@/features/market-news-data';
import {createLovableAiGatewayRunIdFetch,getLovableAiGatewayRunId} from './run-id.ts';
const model='openai/gpt-6-astra';
export async function dailyOutlook(request:Request){
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 const day=utcDay();
 const {data:cached,error:readError}=await db.from('daily_market_outlooks').select('*').eq('day',day).maybeSingle();
 if(readError)return {status:'failed',sentences:null,message:'Today’s saved outlook could not be checked.'};
 if(cached&&!canGenerate(cached.status))return {status:cached.status==='generating'&&cached.lease_until<new Date().toISOString()?'failed':cached.status,sentences:outlookSentences(cached.sentences),message:cached.message??(cached.status==='generating'?'Today’s briefing is being prepared.':'Today’s briefing is unavailable.')};
 const claim=await db.from('daily_market_outlooks').insert({day});
 if(claim.error){
  const {data:existing}=await db.from('daily_market_outlooks').select('*').eq('day',day).maybeSingle();
  return {status:existing?.status??'failed',sentences:outlookSentences(existing?.sentences),message:existing?.message??'Today’s briefing is being prepared.'};
 }
 const stop=async(status:'paused'|'failed',message:string)=>{
  const saved=await db.from('daily_market_outlooks').update({status,message}).eq('day',day);
  if(saved.error)console.error('Daily briefing pause could not be saved');
  return {status,sentences:null,message};
 };
 const {data:block,error:blockError}=await db.from('ai_access_blocks').select('message').eq('model',model).maybeSingle();
 if(blockError||block)return stop('paused',block?.message??'AI access could not be checked.');
 // A credit/policy pause persists across dates and page loads. Only owner restoration clears it.
 const {data:paused,error:pauseError}=await db.from('daily_market_outlooks').select('message').eq('status','paused').limit(1).maybeSingle();
 if(pauseError||paused)return stop('paused',paused?.message??'Briefing access could not be checked.');
 const key=process.env['LOVABLE_API_KEY'];
 if(!key)return stop('failed','Arclight AI is not configured yet.');
 try{
  const run=createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider=createOpenAI({baseURL:'https://ai.gateway.lovable.dev/v1',apiKey:key,headers:{'Lovable-API-Key':key,'X-Lovable-AIG-SDK':'vercel-ai-sdk'},fetch:run.fetch});
  const result=streamText({model:provider.responses(model),maxRetries:0,abortSignal:request.signal,output:Output.object({schema:dailyOutlookSchema}),system:'You are Arclight AI. Write a calm institutional daily educational market outlook using ONLY the supplied preset scenarios, not verified current news. Output exactly three concise plain-English sentences, one sentence in each required field. Sentence 1 covers forex and rate expectations; sentence 2 covers gold and crypto; sentence 3 emphasizes uncertainty and disciplined risk management. Do not invent current events, prices or trade instructions. Make clear the outlook uses preset context rather than live reporting.',messages:[{role:'user',content:JSON.stringify({day,scenarios:marketNews})}],providerOptions:{openai:{forceReasoning:true,reasoningEffort:'low',reasoningSummary:'auto',store:false,include:['reasoning.encrypted_content']}}});
  const output=await result.output;const sentences=outlookSentences(output);
  if(!sentences)throw new Error('Arclight AI returned an incomplete briefing.');
  const saved=await db.from('daily_market_outlooks').update({status:'ready',sentences:output,message:null}).eq('day',day);
  if(saved.error)return {status:'failed',sentences:null,message:'Today’s briefing could not be saved; it will not regenerate automatically.'};
  return {status:'ready',sentences,message:null};
 }catch(error){
  let message='Today’s briefing could not be completed. No automatic retry was made.';let status='failed';
  if(APICallError.isInstance(error)){
   message=error.message;
   let type='';
   try{const body=JSON.parse(error.responseBody??'{}');message=body.message??body.error?.message??message;type=body.type??body.error?.type??'';}catch{/* retain gateway message */}
   if(error.statusCode===402||error.statusCode===403)status='paused';
   if(error.statusCode===403&&!['provider_not_available_in_region','model_requires_retention_consent','model_vendor_not_enabled','credit_limit_reached'].includes(type)){
    const saved=await db.from('ai_access_blocks').upsert({model,message});if(saved.error)console.error('AI block persistence failed');
   }
  }
  const saved=await db.from('daily_market_outlooks').update({status,message}).eq('day',day);if(saved.error)console.error('Daily briefing failure could not be saved');
  return {status,sentences:null,message};
 }
}