import {describe,it,expect} from 'vitest';
import {marketNews,findNews,matchingSetups,newsAnalysisSchema} from '@/features/market-news-data';
describe('Market News rules',()=>{
 it('provides exactly five preset forex, crypto and gold stories',()=>{expect(marketNews).toHaveLength(5);expect(new Set(marketNews.map(n=>n.category))).toEqual(new Set(['Forex','Crypto','Gold']));});
 it('restricts market impact to Bullish, Bearish or Neutral',()=>{expect(newsAnalysisSchema.safeParse({summary:'A. B.',impact:'Buy now',impactReason:'x',assets:['BTC']}).success).toBe(false);for(const impact of ['Bullish','Bearish','Neutral'])expect(newsAnalysisSchema.safeParse({summary:'A. B.',impact,impactReason:'x',assets:['BTC']}).success).toBe(true);});
 it('only links active setups for affected assets',()=>{expect(matchingSetups([{asset:'BTC',status:'Active'},{asset:'BTC',status:'Closed'},{asset:'ETH',status:'Active'}],['BTC'])).toEqual([{asset:'BTC',status:'Active'}]);});
 it('rejects unknown news rather than analyzing arbitrary input',()=>{expect(findNews('invented')).toBeUndefined();expect(findNews('gold-yields')?.assets).toEqual(['XAU/USD']);});
});