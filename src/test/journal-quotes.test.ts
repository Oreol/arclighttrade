import {describe,it,expect,vi,afterEach} from 'vitest';
import {fetchMarketQuotes,SEED_RATES} from '@/features/market-quotes';
import {lotsFromCapital,margin,createPosition,type OrderOptions} from '@/features/trading';
import {performance,stopRespected,type ReviewedTrade} from '@/features/journal-data';
import {benchmarkAccounts,benchmarkRows,COHORT_SIZE,PERSONAL_RANK} from '@/features/leaderboard-data';
const options:OrderOptions={type:'Market',target:null,leverage:1,marginMode:'Isolated',sizing:'USD'};
const trade=(id:string,sl:number|null=90,exit=110):ReviewedTrade=>({...createPosition('BTC','LONG',1000,100,null,sl,options,id),exit,pnl:(exit-100)*10,closed:`2026-10-18T00:00:0${id}Z`,reason:'Manual close'});
afterEach(()=>vi.unstubAllGlobals());
describe('Reliable evaluation quotes',()=>{
 it('keeps positive seeds for all seven assets',()=>{expect(Object.keys(SEED_RATES)).toHaveLength(7);for(const a of ['BTC','ETH','SOL'] as const)expect(SEED_RATES[a]).toBeGreaterThan(0);});
 it('uses Coinbase spot quotes for BTC ETH and SOL',async()=>{const mock=vi.fn(async(url:string)=>({ok:true,json:async()=>url.includes('coinbase')?{data:{amount:'123'}}:{}}));vi.stubGlobal('fetch',mock);const q=await fetchMarketQuotes();expect(q.BTC?.value).toBe(123);expect(q.ETH?.source).toBe('Coinbase');expect(q.SOL?.source).toBe('Coinbase');expect(mock.mock.calls.filter(([url])=>url.includes('coingecko'))).toHaveLength(0);});
 it('fails over to CoinGecko when Coinbase returns zero or is blocked',async()=>{vi.stubGlobal('fetch',vi.fn(async(url:string)=>({ok:true,json:async()=>url.includes('coinbase')?{data:{amount:'0'}}:url.includes('coingecko')?{bitcoin:{usd:64000},ethereum:{usd:2400},solana:{usd:140}}:{}})));const q=await fetchMarketQuotes();expect(q.BTC).toMatchObject({value:64000,source:'CoinGecko'});expect(q.ETH?.value).toBe(2400);expect(q.SOL?.value).toBe(140);});
 it('returns no invalid updates when all feeds fail, preserving seed state',async()=>{vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new Error('blocked')));const q=await fetchMarketQuotes();expect(q).toEqual({});expect({...SEED_RATES,...q}.BTC).toBe(65000);});
});
describe('Forex capital sizing',()=>{
 it('converts $110 allocation to 0.1 EUR/USD lots at 1:100',()=>expect(lotsFromCapital('EUR/USD',110,1.1)).toBeCloseTo(.1));
 it('converts $260 allocation to 0.1 gold lots at 1:100',()=>expect(lotsFromCapital('XAU/USD',260,2600)).toBeCloseTo(.1));
 it('supports 25 50 75 and 100 percent of $10000 without margin overshoot',()=>{for(const pct of [25,50,75,100]){const allocation=10000*pct/100;expect(margin('GBP/USD',lotsFromCapital('GBP/USD',allocation,1.3),1.3)).toBeCloseTo(allocation);}});
 it('converts $100 JPY margin to 0.1 lots',()=>expect(lotsFromCapital('USD/JPY',100,150)).toBeCloseTo(.1));
});
describe('Journal accountability',()=>{
 it('counts only consecutive most recent trades respecting the stop',()=>expect(performance([trade('1',null),trade('2'),trade('3')]).streak).toBe(2));
 it('breaks the streak on liquidation even with a defined stop',()=>expect(stopRespected({...trade('1'),reason:'Liquidation'})).toBe(false));
 it('does not treat a close beyond the stop as respecting it',()=>expect(stopRespected(trade('1',90,89))).toBe(false));
 it('awards 100 discipline for four compliant rules and counts broken reviews',()=>{const t=trade('1');t.review={strategies:['Retest'],emotions:['Patient Entry'],checks:{stopRespected:true,riskSized:true,entryPlanned:true,noRevenge:true},notes:'Plan followed',reviewedAt:''};expect(performance([t]).discipline).toBe(100);expect(performance([t]).broken).toBe(0);expect(performance([{...t,review:{...t.review,checks:{...t.review.checks,noRevenge:false}}}]).broken).toBe(1);});
 it('calculates win rate and net return from actual settlements',()=>{const m=performance([trade('1'),trade('2',90,95)]);expect(m.winRate).toBe(50);expect(m.net).toBe(50);expect(m.netReturn).toBe(.5);});
 it('gives empty accounts no invented performance',()=>expect(performance([])).toMatchObject({discipline:0,winRate:0,net:0,streak:0}));
});
describe('Disclosed modeled cohort',()=>{
 it('contains exactly 5420 accounts including the personal #57 slot',()=>{expect(benchmarkAccounts.length+1).toBe(COHORT_SIZE);expect(COHORT_SIZE).toBe(5420);expect(PERSONAL_RANK).toBe(57);expect(benchmarkAccounts.some(t=>t.rank===57)).toBe(false);});
 it('filters rising and cohort accounts rather than relabeling the same rows',()=>{expect(benchmarkRows('Rising Traders').every(t=>t.rising)).toBe(true);expect(benchmarkRows('My Cohort').every(t=>t.cohort)).toBe(true);expect(benchmarkRows('Rising Traders')).not.toEqual(benchmarkRows('Top Performers'));});
});