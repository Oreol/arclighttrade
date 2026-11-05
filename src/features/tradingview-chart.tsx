import {memo,useEffect,useRef,useState} from 'react';
import {ExternalLink,LoaderCircle} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {tradingViewSymbols,chartIntervals} from './tradingview-config';
import type {Asset} from './trading';
function cssColor(name:string){
 const canvas=document.createElement('canvas');canvas.width=1;canvas.height=1;
 const context=canvas.getContext('2d');if(!context)return undefined;
 context.fillStyle=getComputedStyle(document.documentElement).getPropertyValue(name).trim();context.fillRect(0,0,1,1);
 const data=context.getImageData(0,0,1,1).data;
 return `#${[data[0],data[1],data[2]].map(n=>(n??0).toString(16).padStart(2,'0')).join('')}`;
}
export const TradingViewChart=memo(function TradingViewChart({asset}:{asset:Asset}){
 const host=useRef<HTMLDivElement>(null);const [failed,setFailed]=useState(false);const [loaded,setLoaded]=useState(false);const [interval,setInterval]=useState<string>('60');const [attempt,setAttempt]=useState(0);
 const symbol=tradingViewSymbols[asset];
 useEffect(()=>{
  const container=host.current;if(!container)return;
  setFailed(false);setLoaded(false);container.replaceChildren();
  const widget=document.createElement('div');widget.className='tradingview-widget-container__widget';container.append(widget);
  const script=document.createElement('script');script.src='https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';script.async=true;
  const up=cssColor('--primary'),down=cssColor('--destructive');
  script.textContent=JSON.stringify({autosize:true,symbol,interval,timezone:'Etc/UTC',theme:'dark',style:'1',locale:'en',backgroundColor:cssColor('--tradingview-background'),gridColor:cssColor('--chart-grid'),allow_symbol_change:false,hide_side_toolbar:false,hide_top_toolbar:false,save_image:true,calendar:false,details:false,hotlist:false,withdateranges:true,support_host:'https://www.tradingview.com',studies:[],overrides:{'paneProperties.background':cssColor('--tradingview-background'),'paneProperties.backgroundType':'solid','mainSeriesProperties.candleStyle.upColor':up,'mainSeriesProperties.candleStyle.downColor':down,'mainSeriesProperties.candleStyle.wickUpColor':up,'mainSeriesProperties.candleStyle.wickDownColor':down,'mainSeriesProperties.candleStyle.borderUpColor':up,'mainSeriesProperties.candleStyle.borderDownColor':down}});
  let disposed=false;let frame:HTMLIFrameElement|null=null;
  const onLoad=()=>{if(!disposed){clearTimeout(timeout);setLoaded(true);setFailed(false);}};
  const onError=()=>{if(!disposed){clearTimeout(timeout);setFailed(true);}};
  const timeout=setTimeout(()=>{if(!disposed)setFailed(true);},15000);
  const observer=new MutationObserver(()=>{const next=container.querySelector('iframe');if(next&&next!==frame){frame?.removeEventListener('load',onLoad);frame=next;frame.title=`TradingView technical analysis for ${asset}`;frame.addEventListener('load',onLoad,{once:true});}});
  observer.observe(container,{childList:true,subtree:true});
  script.onerror=onError;container.append(script);
  return()=>{disposed=true;clearTimeout(timeout);observer.disconnect();frame?.removeEventListener('load',onLoad);script.onerror=null;container.replaceChildren();};
 },[asset,symbol,interval,attempt]);
 return <><div className="chart-tools"><div>{chartIntervals.map(value=><Button key={value} variant="ghost" className={interval===value?'active':''} aria-pressed={interval===value} onClick={()=>setInterval(value)}>{value==='D'?'1D':value==='60'?'1h':value==='240'?'4h':`${value}m`}</Button>)}</div></div><div className="advanced-chart"><div ref={host} className="tradingview-widget-container"/>{!loaded&&!failed&&<div className="chart-loading" role="status"><LoaderCircle className="animate-spin" size={17}/>Loading TradingView…</div>}{failed&&<div className="chart-loading" role="alert">TradingView is taking longer than expected.<Button variant="outline" size="sm" onClick={()=>setAttempt(value=>value+1)}>Retry chart</Button></div>}</div><div className="chart-disclaimer"><span>TradingView analysis · Execution uses independent reference quotes</span><Button asChild variant="link" size="sm"><a href={`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(symbol)}`} target="_blank" rel="noreferrer">TradingView<ExternalLink size={12}/></a></Button></div></>;
});