export type Asset = 'XAU/USD'|'EUR/USD'|'GBP/USD'|'USD/JPY'|'BTC'|'ETH'|'SOL';
export type Kind='forex'|'crypto';
export const instruments: Record<Asset,{symbol:string;name:string;precision:number;kind:Kind;pip:number;contract:number}> = {
 'XAU/USD':{symbol:'OANDA:XAUUSD',name:'Gold',precision:2,kind:'forex',pip:0.01,contract:100},
 'EUR/USD':{symbol:'FX:EURUSD',name:'Euro / US Dollar',precision:5,kind:'forex',pip:0.0001,contract:100000},
 'GBP/USD':{symbol:'FX:GBPUSD',name:'British Pound / US Dollar',precision:5,kind:'forex',pip:0.0001,contract:100000},
 'USD/JPY':{symbol:'FX:USDJPY',name:'US Dollar / Japanese Yen',precision:3,kind:'forex',pip:0.01,contract:100000},
 BTC:{symbol:'BINANCE:BTCUSDT',name:'Bitcoin',precision:2,kind:'crypto',pip:0.01,contract:1},
 ETH:{symbol:'BINANCE:ETHUSDT',name:'Ethereum',precision:2,kind:'crypto',pip:0.01,contract:1},
 SOL:{symbol:'BINANCE:SOLUSDT',name:'Solana',precision:2,kind:'crypto',pip:0.01,contract:1}
};
export const LEVERAGE=100;
export type Position={id:string;asset:Asset;side:'LONG'|'SHORT';entry:number;units:number;allocation:number;tp:number|null;sl:number|null;opened:string;lots?:number};
export type TradeLog=Position&{exit:number;pnl:number;reason:string;closed:string};
export const money=(v:number)=>v.toLocaleString('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2});
export const price=(asset:string,v:number)=>!v?'—':v.toLocaleString('en-US',{minimumFractionDigits:instruments[asset as Asset]?.precision??2,maximumFractionDigits:instruments[asset as Asset]?.precision??2});
/** Margin at 1:100 for a forex/gold lot size, in USD. */
export function margin(asset:Asset,lots:number,mark:number){const i=instruments[asset];const notional=asset==='USD/JPY'?lots*i.contract:lots*i.contract*mark;return notional/LEVERAGE;}
export const pips=(p:Position,mark:number)=>(mark-p.entry)/instruments[p.asset].pip*(p.side==='LONG'?1:-1);
export function pnl(p:Position,mark:number){const dir=p.side==='LONG'?1:-1;if(p.lots!==undefined){const i=instruments[p.asset];const raw=(mark-p.entry)*p.lots*i.contract*dir;return p.asset==='USD/JPY'?raw/mark:raw;}return (mark-p.entry)*p.units*dir;}
export const roi=(p:Position,mark:number)=>p.allocation?pnl(p,mark)/p.allocation*100:0;
export function trigger(p:Position,mark:number){if(p.sl!==null&&(p.side==='LONG'?mark<=p.sl:mark>=p.sl))return 'Stop loss';if(p.tp!==null&&(p.side==='LONG'?mark>=p.tp:mark<=p.tp))return 'Take profit';return null;}
export function validateOrder(side:Position['side'],entry:number,allocation:number,available:number,tp:number|null,sl:number|null){if(!Number.isFinite(entry)||entry<=0)return 'Reference price is unavailable.';if(!Number.isFinite(allocation)||allocation<=0||allocation>available)return 'Allocation must be positive and within available capital.';if(tp!==null&&(!Number.isFinite(tp)||(side==='LONG'?tp<=entry:tp>=entry)))return 'Take profit must be beyond entry in the direction of the trade.';if(sl!==null&&(!Number.isFinite(sl)||sl<=0||(side==='LONG'?sl>=entry:sl<=entry)))return 'Stop loss must be beyond entry against the direction of the trade.';return null;}
export const momentum=(percent:number)=>percent<30?'Pace is slow — take a lesson today to build momentum':percent>60?'Strong momentum — complete Module 4 next':'Consistency builds an edge — keep your learning on track';
/** Fetch live quotes over REST: Binance for crypto, Frankfurter for FX, gold-api for XAU. */
export async function fetchQuotes():Promise<Partial<Record<Asset,number>>>{const out:Partial<Record<Asset,number>>={};await Promise.allSettled([
 fetch('https://api.binance.com/api/v3/ticker/price?symbols='+encodeURIComponent('["BTCUSDT","ETHUSDT","SOLUSDT"]')).then(r=>r.json()).then((rows:{symbol:string;price:string}[])=>{for(const r of rows){const a=({BTCUSDT:'BTC',ETHUSDT:'ETH',SOLUSDT:'SOL'} as Record<string,Asset>)[r.symbol];if(a)out[a]=Number(r.price);}}),
 fetch('https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,JPY').then(r=>r.json()).then((d:{rates:{EUR:number;GBP:number;JPY:number}})=>{out['EUR/USD']=1/d.rates.EUR;out['GBP/USD']=1/d.rates.GBP;out['USD/JPY']=d.rates.JPY;}),
 fetch('https://api.gold-api.com/price/XAU').then(r=>r.json()).then((d:{price:number})=>{if(d.price)out['XAU/USD']=Number(d.price);}),
]);return out;}
