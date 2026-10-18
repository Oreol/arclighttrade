import {useQuery} from '@tanstack/react-query';
import {useServerFn} from '@tanstack/react-start';
import {AudioLines,LoaderCircle} from 'lucide-react';
import {useDesk} from './desk-context';
import {supabase} from '@/integrations/supabase/client';
import {getDailyOutlook} from './daily-outlook.functions';
import {outlookSentences,utcDay} from './daily-outlook-data';
export function DailyOutlook(){
 const desk=useDesk();const get=useServerFn(getDailyOutlook);const day=utcDay();
 const query=useQuery({queryKey:['daily-outlook',day,desk.user?.id??'public'],retry:false,staleTime:Infinity,queryFn:async()=>{
  if(desk.user)return get();
  const {data,error}=await supabase.from('daily_market_outlooks').select('sentences,status,message').eq('day',day).maybeSingle();
  if(error)throw new Error('Today’s outlook could not be loaded.');
  return data?{status:data.status,sentences:outlookSentences(data.sentences),message:data.message}:{status:'missing',sentences:null,message:'Sign in to prepare today’s briefing.'};
 },refetchInterval:query=>query.state.data?.status==='generating'?5000:false});
 return <section className="daily-outlook" aria-label="Today's Market Outlook"><div className="outlook-title"><span className="outlook-icon"><AudioLines size={21}/></span><div><span className="section-kicker">ARCLIGHT AI · DAILY BRIEFING</span><h2>Today's Market Outlook</h2></div><time dateTime={day}>{day} · UTC</time></div>
 {query.isPending?<p className="outlook-loading" role="status"><LoaderCircle size={15} className="animate-spin"/>Preparing your briefing…</p>:query.data?.sentences?<p className="outlook-copy">{query.data.sentences.join(' ')}</p>:<p role="status">{query.error?.message??query.data?.message??'Today’s briefing is being prepared.'}</p>}
 <span className="outlook-source">Preset news context · Educational interpretation, not live reporting</span></section>;
}