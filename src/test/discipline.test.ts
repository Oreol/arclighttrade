import {describe,it,expect} from 'vitest';
import {dailyCapReached,DEFAULT_DAILY_LIMIT,normalizeDailyLimit,tradesToday} from '@/features/discipline-data';
const now=new Date('2026-11-11T12:00:00Z');
const trade=(id:string,opened='2026-11-11T08:00:00Z')=>({id,opened});
describe('Daily execution discipline',()=>{
 it('defaults to two trades',()=>expect(DEFAULT_DAILY_LIMIT).toBe(2));
 it('allows only limits 2, 3 and 4',()=>{expect([2,3,4].map(normalizeDailyLimit)).toEqual([2,3,4]);expect(normalizeDailyLimit(5)).toBe(2);});
 it('counts executions across open and closed trades without counting a closed trade twice',()=>{expect(tradesToday([trade('a')],[trade('a'),trade('b')],now)).toBe(2);});
 it.each([2,3,4] as const)('blocks additional execution after %i trades',limit=>{const rows=Array.from({length:limit},(_,i)=>trade(String(i)));expect(dailyCapReached(rows.slice(0,-1),[],limit,now)).toBe(false);expect(dailyCapReached(rows,[],limit,now)).toBe(true);});
 it('closing a position does not free a daily slot',()=>{expect(dailyCapReached([trade('a')],[trade('b')],2,now)).toBe(true);expect(dailyCapReached([],[trade('a'),trade('b')],2,now)).toBe(true);});
 it('resets the count at the next UTC session, not at close time',()=>{expect(tradesToday([],[trade('a','2026-11-10T23:59:59Z')],new Date('2026-11-11T00:00:00Z'))).toBe(0);});
});