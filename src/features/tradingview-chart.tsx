import {useEffect,useRef,useState} from 'react';
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
export function TradingViewChart({asset}:{asset:Asset}){
 const host=useRef<HTMLDivElement>(null);const [failed,setFailed]=useState(false);const [loaded,setLoaded]=useState(false);
 const symbol=tradingViewSymbols[asset];
 useEffect(()=>{
  const container=host.current;if(!container)return;
  setFailed(false);setLoaded(false);container.replaceChildren();
  const widget=document.createElement('div');widget.className='tradingview-widget-container__widget';container.append(widget);
  const script=document.createElement('script');script.src='https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';script.async=true;
  const up=cssColor('--primary'),down=cssColor('--destructive');
  script.textContent=JSON.stringify({autosize:true,symbol,interval:'60',timezone:'Etc/UTC',theme:'dark',style:'1',locale:'en',backgroundColor:cssColor('--background'),gridColor:cssColor('--chart-grid'),allow_symbol_change:false,hide_side_toolbar:false,hide_top_toolbar:false,save_image:true,calendar:false,details:false,hotlist:false,withdateranges:true,support_host:'https://www.tradingview.com',studies:['STD;RSI','STD;EMA','STD;MACD'],time_frames:chartIntervals.map(interval=>({text:interval==='D'?'1D':interval==='60'?'1h':interval==='240'?'4h':`${interval}m`,resolution:interval})),overrides:{'paneProperties.background':cssColor('--background'),'paneProperties.backgroundType':'solid','mainSeriesProperties.candleStyle.upColor':up,'mainSeriesProperties.candleStyle.downColor':down,'mainSeriesProperties.candleStyle.wickUpColor':up,'mainSeriesProperties.candleStyle.wickDownColor':down,'mainSeriesProperties.candleStyle.borderUpColor':up,'mainSeriesProperties.candleStyle.borderDownColor':down}});
  script.onerror=()=>setFailed(true);container.append(script);
  const observer=new MutationObserver(()=>{const frame=container.querySelector('iframe');if(frame){frame.title=`TradingView technical analysis for ${asset}`;frame.addEventListener('load',()=>setLoaded(true),{once:true});}});
  observer.observe(container,{childList:true,subtree:true});
  return()=>{observer.disconnect();script.onerror=null;container.replaceChildren();};
 },[asset,symbol]);
 return <><div className="advanced-chart"><div ref={host} className="tradingview-widget-container"/>{!loaded&&!failed&&<div className="chart-loading" role="status"><LoaderCircle className="animate-spin" size={17}/>Loading TradingView…</div>}{failed&&<div className="chart-loading" role="alert">TradingView could not be loaded.</div>}</div><div className="chart-disclaimer"><span>TradingView analysis · Execution uses independent reference quotes</span><Button asChild variant="link" size="sm"><a href={`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(symbol)}`} target="_blank" rel="noreferrer">TradingView<ExternalLink size={12}/></a></Button></div></>;
}