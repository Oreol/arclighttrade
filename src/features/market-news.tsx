import {useRef,useState} from 'react';
import {Link} from '@tanstack/react-router';
import {useServerFn} from '@tanstack/react-start';
import {Newspaper,ArrowUpRight,ArrowRight,AudioLines,Clock,BookOpen,Radio,LoaderCircle,ShieldCheck} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Sheet,SheetContent,SheetHeader,SheetTitle,SheetDescription} from '@/components/ui/sheet';
import {useDesk} from './desk-context';
import {marketNews} from './market-news-data';
import {analyzeNews} from './market-news.functions';
type Result=Awaited<ReturnType<typeof analyzeNews>>;
export function MarketNews(){
 const desk=useDesk();const analyze=useServerFn(analyzeNews);
 const [selected,setSelected]=useState<typeof marketNews[number]|null>(null);
 const [result,setResult]=useState<Result|null>(null);const [busy,setBusy]=useState(false);const requestId=useRef(0);
 async function ask(story:typeof marketNews[number]){
  const id=++requestId.current;setSelected(story);setResult(null);
  if(!desk.user){setBusy(false);return;}
  setBusy(true);
  try{const response=await analyze({data:{newsId:story.id}});if(id===requestId.current)setResult(response);}
  catch{if(id===requestId.current)setResult({ok:false,status:503,message:'The analysis request could not be completed. Please check your connection.'});}
  finally{if(id===requestId.current)setBusy(false);}
 }
 return <>
  <div className="page-heading"><div><div className="eyebrow">ARCLIGHT INTELLIGENCE</div><h1>Market News</h1><p>Macro context. Clear interpretation. Disciplined perspective.</p></div><span className="session-tag"><Newspaper size={14}/>Preset briefing</span></div>
  <div className="news-edition"><span>16 OCTOBER 2026 · EDUCATIONAL SCENARIOS</span><span>5 BRIEFS</span></div>
  <div className="news-grid">{marketNews.map((story,index)=><article key={story.id} className="news-card">
   <div className="news-meta"><span>{story.category}</span><time dateTime={story.timestamp}><Clock size={12}/>{new Date(story.timestamp).toISOString().slice(11,16)} UTC</time></div>
   <div className="news-title"><span className="news-number">0{index+1}</span><h2>{story.headline}</h2></div>
   <p>{story.body}</p><div className="news-tags"><span className="news-sentiment">{story.sentiment}</span>{story.assets.map(a=><span key={a}>{a}</span>)}</div>
   <Button variant="outline" onClick={()=>void ask(story)}><AudioLines size={16}/>Ask Arclight AI<ArrowUpRight size={15}/></Button>
  </article>)}</div>
  <div className="risk-notice"><ShieldCheck size={18}/><p>Preset scenarios, not live reporting. AI interpretation is educational and may be inaccurate. Not investment advice.</p></div>
  <Sheet open={Boolean(selected)} onOpenChange={open=>{if(!open)setSelected(null);}}><SheetContent className="news-drawer" side="right">
   <SheetHeader><span className="ai-identity"><AudioLines size={22}/> ARCLIGHT INTELLIGENCE</span><SheetTitle>Arclight AI</SheetTitle><SheetDescription>News interpretation · Preset scenario</SheetDescription></SheetHeader>
   <h2 className="analysis-headline">{selected?.headline}</h2>
   {!desk.user?<div className="analysis-section"><p>Sign in to request your analysis.</p><Button onClick={()=>{setSelected(null);desk.setAuthOpen(true);}}>Sign in<ArrowRight/></Button></div>:busy?<div className="analysis-loading" role="status"><LoaderCircle className="animate-spin"/><span>Interpreting this briefing…</span></div>:result?.ok?<div aria-live="polite">
    <section className="analysis-section"><h3>Plain-English Summary</h3><p>{result.analysis.summary}</p></section>
    <section className="analysis-section"><h3>Market Impact <span className="news-sentiment">{result.analysis.impact}</span></h3><p>{result.analysis.impactReason}</p></section>
    <section className="analysis-section"><h3>Affected Assets</h3><div className="news-tags">{result.analysis.assets.map(a=><span key={a}>{a}</span>)}</div>
     {result.setups.length>0?<Button asChild variant="outline"><Link to="/signals"><Radio/>See active setup on Signals Desk<ArrowUpRight/></Link></Button>:<><p>No matching active setup is available.</p><Button asChild variant="outline"><Link to="/signals"><Radio/>Open Signals Desk<ArrowUpRight/></Link></Button></>}
    </section>
    {result.lesson&&<section className="analysis-section"><h3>Recommended Lesson</h3><p>Module {result.lesson.module} · {result.lesson.module_name}</p><Button asChild variant="outline"><Link to="/academy" search={{lesson:result.lesson.id}}><BookOpen/>{result.lesson.title}<ArrowUpRight/></Link></Button></section>}
   </div>:result&&!result.ok?<div className="analysis-section" role="alert"><h3>Analysis unavailable</h3><p>{result.message}</p></div>:null}
   <p className="analysis-disclaimer">Educational interpretation · Not an execution recommendation.</p>
  </SheetContent></Sheet>
 </>;
}