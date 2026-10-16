export type Asset = 'XAU/USD'|'EUR/USD'|'GBP/USD'|'USD/JPY'|'BTC'|'ETH'|'SOL';
export type Kind='forex'|'crypto';
export const instruments: Record<Asset,{symbol:string;name:string;precision:number;kind:Kind;pip:number;contract:number}> = {
 'XAU/USD':{symbol:'OANDA:XAUUSD',name:'Gold',precision:2,kind:'forex',pip:0.1,contract:100},
 'EUR/USD':{symbol:'FX:EURUSD',name:'Euro / US Dollar',precision:5,kind:'forex',pip:0.0001,contract:100000},
 'GBP/USD':{symbol:'FX:GBPUSD',name:'British Pound / US Dollar',precision:5,kind:'forex',pip:0.0001,contract:100000},
 'USD/JPY':{symbol:'FX:USDJPY',name:'US Dollar / Japanese Yen',precision:3,kind:'forex',pip:0.01,contract:100000},
 BTC:{symbol:'BINANCE:BTCUSDT',name:'Bitcoin',precision:2,kind:'crypto',pip:0.01,contract:1},
 ETH:{symbol:'BINANCE:ETHUSDT',name:'Ethereum',precision:2,kind:'crypto',pip:0.01,contract:1},
 SOL:{symbol:'BINANCE:SOLUSDT',name:'Solana',precision:2,kind:'crypto',pip:0.01,contract:1}
};
export const LEVERAGE=100;
export type Position={id:string;asset:Asset;side:'LONG'|'SHORT';entry:number;units:number;allocation:number;tp:number|null;sl:number|null;opened:string;lots?:number;leverage?:number;marginMode?:'Cross'|'Isolated';liquidation?:number};
export type TradeLog=Position&{exit:number;pnl:number;reason:string;closed:string};
export const money=(v:number)=>v.toLocaleString('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2});
export const price=(asset:string,v:number)=>!v?'—':v.toLocaleString('en-US',{minimumFractionDigits:instruments[asset as Asset]?.precision??2,maximumFractionDigits:instruments[asset as Asset]?.precision??2});
/** Margin at 1:100 for a forex/gold lot size, in USD. */
export function margin(asset:Asset,lots:number,mark:number){const i=instruments[asset];const notional=asset==='USD/JPY'?lots*i.contract:lots*i.contract*mark;return notional/LEVERAGE;}
export const pips=(p:Position,mark:number)=>(mark-p.entry)/instruments[p.asset].pip*(p.side==='LONG'?1:-1);
export function pnl(p:Position,mark:number){const dir=p.side==='LONG'?1:-1;if(p.lots!==undefined){const i=instruments[p.asset];const raw=(mark-p.entry)*p.lots*i.contract*dir;return p.asset==='USD/JPY'?raw/mark:raw;}return (mark-p.entry)*p.units*dir*(p.leverage??1);}
export const roi=(p:Position,mark:number)=>p.allocation?pnl(p,mark)/p.allocation*100:0;
export function trigger(p:Position,mark:number){if(p.liquidation!==undefined&&(p.side==='LONG'?mark<=p.liquidation:mark>=p.liquidation))return 'Liquidation';if(p.sl!==null&&(p.side==='LONG'?mark<=p.sl:mark>=p.sl))return 'Stop loss';if(p.tp!==null&&(p.side==='LONG'?mark>=p.tp:mark<=p.tp))return 'Take profit';return null;}
export function validateOrder(side:Position['side'],entry:number,allocation:number,available:number,tp:number|null,sl:number|null){if(!Number.isFinite(entry)||entry<=0)return 'Reference price is unavailable.';if(!Number.isFinite(allocation)||allocation<=0||allocation>available)return 'Allocation must be positive and within available capital.';if(tp!==null&&(!Number.isFinite(tp)||tp<=0||(side==='LONG'?tp<=entry:tp>=entry)))return 'Take profit must be beyond entry in the direction of the trade.';if(sl!==null&&(!Number.isFinite(sl)||sl<=0||(side==='LONG'?sl>=entry:sl<=entry)))return 'Stop loss must be beyond entry against the direction of the trade.';return null;}
export const momentum=(percent:number)=>percent<30?'Pace is slow — take a lesson today to build momentum':percent>60?'Strong momentum — complete Module 4 next':'Consistency builds an edge — keep your learning on track';
/** Fetch live quotes over REST: Binance for crypto, Frankfurter for FX, gold-api for XAU. */
export async function fetchQuotes():Promise<Partial<Record<Asset,number>>>{const out:Partial<Record<Asset,number>>={};await Promise.allSettled([
 fetch('https://api.binance.com/api/v3/ticker/price?symbols='+encodeURIComponent('["BTCUSDT","ETHUSDT","SOLUSDT"]'),{signal:AbortSignal.timeout(2500)}).then(r=>{if(!r.ok)throw new Error('Quote unavailable');return r.json();}).then((rows:{symbol:string;price:string}[])=>{for(const r of rows){const a=({BTCUSDT:'BTC',ETHUSDT:'ETH',SOLUSDT:'SOL'} as Record<string,Asset>)[r.symbol];if(a)out[a]=Number(r.price);}}),
 fetch('https://api.frankfurter.dev/v1/latest?from=USD&to=EUR,GBP,JPY',{signal:AbortSignal.timeout(2500)}).then(r=>{if(!r.ok)throw new Error('Quote unavailable');return r.json();}).then((d:{rates:{EUR:number;GBP:number;JPY:number}})=>{out['EUR/USD']=1/d.rates.EUR;out['GBP/USD']=1/d.rates.GBP;out['USD/JPY']=d.rates.JPY;}),
 fetch('https://api.gold-api.com/price/XAU',{signal:AbortSignal.timeout(2500)}).then(r=>{if(!r.ok)throw new Error('Quote unavailable');return r.json();}).then((d:{price:number})=>{if(d.price)out['XAU/USD']=Number(d.price);}),
]);return out;}

export type OrderType='Market'|'Buy Limit'|'Sell Limit'|'Buy Stop'|'Sell Stop'|'Limit'|'Conditional';
export type OrderOptions={type:OrderType;target:number|null;leverage:number;marginMode:'Cross'|'Isolated';sizing:'USD'|'Units'};
export type PendingOrder={id:string;asset:Asset;side:Position['side'];size:number;tp:number|null;sl:number|null;options:OrderOptions;allocation:number;created:string};
export const CRYPTO_LEVERAGES=[1,2,5,10,25,50,75];
export function liquidationPrice(entry:number,side:Position['side'],leverage:number,collateralRatio=1){return Math.max(0,entry*(1+(side==='LONG'?-1:1)*collateralRatio/leverage));}
export function orderSide(type:OrderType,side:Position['side']):Position['side']{return type.startsWith('Buy')?'LONG':type.startsWith('Sell')?'SHORT':side;}
export function pendingTouches(order:PendingOrder,mark:number){const target=order.options.target;if(!target||!Number.isFinite(mark)||mark<=0)return false;const buy=order.side==='LONG';const stop=order.options.type.includes('Stop')||order.options.type==='Conditional';return stop?(buy?mark>=target:mark<=target):(buy?mark<=target:mark>=target);}
export function validatePending(type:OrderType,side:Position['side'],target:number,mark:number){if(!Number.isFinite(target)||target<=0)return 'Entry target must be positive.';const buy=orderSide(type,side)==='LONG';const stop=type.includes('Stop')||type==='Conditional';if(stop?(buy?target<=mark:target>=mark):(buy?target>=mark:target<=mark))return 'Entry target is on the wrong side of the reference price.';return null;}
export function createPosition(asset:Asset,side:Position['side'],size:number,entry:number,tp:number|null,sl:number|null,options:OrderOptions,id:string):Position{const fx=instruments[asset].kind==='forex';const allocation=fx?margin(asset,size,entry):options.sizing==='Units'?size*entry:size;return {id,asset,side,entry,allocation,units:fx?size*instruments[asset].contract:options.sizing==='Units'?size:allocation/entry,tp,sl,opened:new Date().toISOString(),...(fx?{lots:size}:{leverage:options.leverage,marginMode:options.marginMode,liquidation:liquidationPrice(entry,side,options.leverage)})};}
export function settledPnl(p:Position,mark:number,reason:string){return reason==='Liquidation'?-p.allocation:Math.max(-p.allocation,pnl(p,mark));}
