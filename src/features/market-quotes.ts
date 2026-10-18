import type {Asset} from './trading';

export type QuoteSource='Seed reference'|'Coinbase'|'CoinGecko'|'Daily FX reference'|'Gold spot';
export type Quote={value:number;source:QuoteSource;updatedAt:string|null};
// Offline evaluation references, not current market prices.
export const SEED_RATES:Record<Asset,number>={'XAU/USD':2600,'EUR/USD':1.1,'GBP/USD':1.3,'USD/JPY':150,BTC:65000,ETH:2500,SOL:150};
export const seedQuotes=():Record<Asset,Quote>=>Object.fromEntries(Object.entries(SEED_RATES).map(([a,value])=>[a,{value,source:'Seed reference',updatedAt:null}])) as Record<Asset,Quote>;
const valid=(v:unknown)=>Number.isFinite(Number(v))&&Number(v)>0;
async function json(url:string){const r=await fetch(url,{signal:AbortSignal.timeout(2200)});if(!r.ok)throw new Error('Quote feed unavailable');return r.json();}
export async function fetchMarketQuotes():Promise<Partial<Record<Asset,Quote>>>{
 const out:Partial<Record<Asset,Quote>>={};
 const put=(a:Asset,v:unknown,source:QuoteSource)=>{if(valid(v))out[a]={value:Number(v),source,updatedAt:new Date().toISOString()};};
 await Promise.allSettled([
  (async()=>{await Promise.allSettled((['BTC','ETH','SOL'] as const).map(async a=>{const d=await json(`https://api.coinbase.com/v2/prices/${a}-USD/spot`);put(a,d?.data?.amount,'Coinbase');}));
   const missing=(['BTC','ETH','SOL'] as const).filter(a=>!out[a]);if(!missing.length)return;
   const ids={BTC:'bitcoin',ETH:'ethereum',SOL:'solana'};const d=await json(`https://api.coingecko.com/api/v3/simple/price?ids=${missing.map(a=>ids[a]).join(',')}&vs_currencies=usd`);for(const a of missing)put(a,d?.[ids[a]]?.usd,'CoinGecko');})(),
  json('https://api.frankfurter.dev/v1/latest?from=USD&to=EUR,GBP,JPY').then(d=>{if(valid(d?.rates?.EUR))put('EUR/USD',1/Number(d.rates.EUR),'Daily FX reference');if(valid(d?.rates?.GBP))put('GBP/USD',1/Number(d.rates.GBP),'Daily FX reference');put('USD/JPY',d?.rates?.JPY,'Daily FX reference');}),
  json('https://api.gold-api.com/price/XAU').then(d=>put('XAU/USD',d?.price,'Gold spot')),
 ]);
 return out;
}