import type {TradeLog} from './trading';
export const STRATEGIES=['Breakout','Retest','Liquidity Sweep','News','Trend Following'] as const;
export const EMOTIONS=['Disciplined Plan','Patient Entry','FOMO Chase','Revenge Trade','Anxious','Overconfident'] as const;
export const REVIEW_RULES=[{key:'stopRespected',label:'Stop loss defined and respected'},{key:'riskSized',label:'Position sized within my risk plan'},{key:'entryPlanned',label:'Entry followed my strategy'},{key:'noRevenge',label:'No impulsive or revenge execution'}] as const;
export type TradeReview={strategies:string[];emotions:string[];checks:Record<typeof REVIEW_RULES[number]['key'],boolean>;notes:string;reviewedAt:string};
export type ReviewedTrade=TradeLog&{review?:TradeReview};
export function stopRespected(t:ReviewedTrade){return t.sl!==null&&t.reason!=='Liquidation'&&(t.side==='LONG'?t.exit>=t.sl:t.exit<=t.sl)&&t.review?.checks.stopRespected!==false;}
export function performance(trades:ReviewedTrade[]){
 const sorted=[...trades].sort((a,b)=>b.closed.localeCompare(a.closed));let streak=0;for(const t of sorted){if(!stopRespected(t))break;streak++;}
 let passed=0,broken=0;for(const t of trades){const checks=[stopRespected(t),...REVIEW_RULES.slice(1).map(r=>t.review?.checks[r.key]===true)];passed+=checks.filter(Boolean).length;broken+=checks.filter((v,i)=>!v&&(i===0||Boolean(t.review))).length;}
 const net=trades.reduce((s,t)=>s+t.pnl,0);
 return {streak,broken,discipline:trades.length?Math.round(passed/(trades.length*4)*100):0,winRate:trades.length?Math.round(trades.filter(t=>t.pnl>0).length/trades.length*100):0,net,netReturn:net/10000*100,reviewed:trades.filter(t=>t.review).length};
}