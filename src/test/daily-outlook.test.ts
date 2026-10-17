import {describe,it,expect} from 'vitest';
import {utcDay,canGenerate,outlookSentences} from '@/features/daily-outlook-data';
import {tradingViewSymbols,chartIntervals} from '@/features/tradingview-config';
describe('Daily briefing rules',()=>{
 it('uses one UTC day across time zones',()=>{expect(utcDay(new Date('2026-10-17T01:30:00+02:00'))).toBe('2026-10-16');expect(utcDay(new Date('2026-10-17T01:30:00Z'))).toBe('2026-10-17');});
 it('never regenerates an existing daily job, even failed',()=>{expect(canGenerate(undefined)).toBe(true);for(const s of ['ready','generating','failed','paused'])expect(canGenerate(s)).toBe(false);});
 it('requires exactly three sentence fields',()=>{expect(outlookSentences({sentence1:'One.',sentence2:'Two.',sentence3:'Three.'})).toEqual(['One.','Two.','Three.']);expect(outlookSentences({sentence1:'One.',sentence2:'Two.'})).toBeNull();});
});
describe('TradingView asset routing',()=>{
 it('maps all seven assets to the requested venues',()=>{expect(tradingViewSymbols).toEqual({'XAU/USD':'OANDA:XAUUSD','EUR/USD':'OANDA:EURUSD','GBP/USD':'OANDA:GBPUSD','USD/JPY':'OANDA:USDJPY',BTC:'BINANCE:BTCUSDT',ETH:'BINANCE:ETHUSDT',SOL:'BINANCE:SOLUSDT'});});
 it('supports the six requested intervals',()=>{expect(chartIntervals).toEqual(['1','5','15','60','240','D']);});
});