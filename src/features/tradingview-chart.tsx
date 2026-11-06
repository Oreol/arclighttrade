import {memo,useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {LoaderCircle} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {tradingViewSymbols} from './tradingview-config';
import {useChartHost} from './chart-host';
import type {Asset} from './trading';
function cssColor(name:string){
 const canvas=document.createElement('canvas');canvas.width=1;canvas.height=1;
 const context=canvas.getContext('2d');if(!context)return undefined;
 context.fillStyle=getComputedStyle(document.documentElement).getPropertyValue(name).trim();context.fillRect(0,0,1,1);
 const data=context.getImageData(0,0,1,1).data;
 return `#${[data[0],data[1],data[2]].map(n=>(n??0).toString(16).padStart(2,'0')).join('')}`;
}
// One widget per asset. Interval changes happen inside TradingView's own toolbar so the iframe (and drawings) are never rebuilt.
export const TradingViewChart=memo(function TradingViewChart({asset}:{asset:Asset}){
 const host=useRef<HTMLDivElement>(null);const [failed,setFailed]=useState(false);const [loaded,setLoaded]=useState(false);const [attempt,setAttempt]=useState(0);
 const symbol=tradingViewSymbols[asset];
 useEffect(()=>{
  const container=host.current;if(!container)return;
  setFailed(false);setLoaded(false);container.replaceChildren();
  const widget=document.createElement('div');widget.className='tradingview-widget-container__widget';container.append(widget);
  const script=document.createElement('script');script.src='https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';script.async=true;
  const up=cssColor('--primary'),down=cssColor('--destructive');
  script.textContent=JSON.stringify({autosize:true,symbol,interval:'60',timezone:'Etc/UTC',theme:'dark',style:'1',locale:'en',backgroundColor:cssColor('--tradingview-background'),gridColor:cssColor('--chart-grid'),allow_symbol_change:false,hide_side_toolbar:false,hide_top_toolbar:false,save_image:true,calendar:false,details:false,hotlist:false,withdateranges:true,support_host:'https://www.tradingview.com',studies:[],overrides:{'paneProperties.background':cssColor('--tradingview-background'),'paneProperties.backgroundType':'solid','mainSeriesProperties.candleStyle.upColor':up,'mainSeriesProperties.candleStyle.downColor':down,'mainSeriesProperties.candleStyle.wickUpColor':up,'mainSeriesProperties.candleStyle.wickDownColor':down,'mainSeriesProperties.candleStyle.borderUpColor':up,'mainSeriesProperties.candleStyle.borderDownColor':down}});
  let disposed=false;let frame:HTMLIFrameElement|null=null;
  const onLoad=()=>{if(!disposed){clearTimeout(timeout);setLoaded(true);setFailed(false);}};
  const onError=()=>{if(!disposed){clearTimeout(timeout);setFailed(true);}};
  const timeout=setTimeout(()=>{if(!disposed)setFailed(true);},15000);
  const observer=new MutationObserver(()=>{const next=container.querySelector('iframe');if(next&&next!==frame){frame?.removeEventListener('load',onLoad);frame=next;frame.title=`TradingView technical analysis for ${asset}`;frame.addEventListener('load',onLoad,{once:true});}});
  observer.observe(container,{childList:true,subtree:true});
  script.onerror=onError;container.append(script);
  return()=>{disposed=true;clearTimeout(timeout);observer.disconnect();frame?.removeEventListener('load',onLoad);script.onerror=null;container.replaceChildren();};
 },[asset,symbol,attempt]);
 return <div className="advanced-chart" style={{height:'100%'}}><div ref={host} className="tradingview-widget-container"/>{!loaded&&!failed&&<div className="chart-loading" role="status"><LoaderCircle className="animate-spin" size={17}/>Loading TradingView…</div>}{failed&&<div className="chart-loading" role="alert" style={{pointerEvents:'auto'}}>TradingView is taking longer than expected.<Button variant="outline" size="sm" onClick={()=>setAttempt(value=>value+1)}>Retry chart</Button></div>}</div>;
});
type Box={top:number;left:number;width:number;height:number};
// Mounted once in the shell. Widgets stay alive (hidden off-screen) while the user is on other pages.
export function PersistentCharts(){
 const {asset,slot}=useChartHost();const [mounted,setMounted]=useState(false);const [visited,setVisited]=useState<Asset[]>([]);const [box,setBox]=useState<Box|null>(null);
 useEffect(()=>setMounted(true),[]);
 useEffect(()=>{if(slot)setVisited(v=>v.includes(asset)?v:[...v,asset]);},[asset,slot]);
 useEffect(()=>{if(!slot){setBox(null);return;}let raf=0;let last='';const tick=()=>{const r=slot.getBoundingClientRect();const next={top:r.top+window.scrollY,left:r.left+window.scrollX,width:r.width,height:r.height};const key=`${next.top}|${next.left}|${next.width}|${next.height}`;if(key!==last){last=key;setBox(next);}raf=requestAnimationFrame(tick);};tick();return()=>cancelAnimationFrame(raf);},[slot]);
 if(!mounted||visited.length===0)return null;
 const width=box?.width||900,height=box?.height||600;
 return createPortal(<>{visited.map(a=>{const show=!!box&&a===asset;return <div key={a} className="persistent-chart" aria-hidden={!show} style={{position:'absolute',top:show?box.top:0,left:show?box.left:-20000,width,height,visibility:show?'visible':'hidden',zIndex:show?1:-1}}><TradingViewChart asset={a}/></div>;})}</>,document.body);
}
