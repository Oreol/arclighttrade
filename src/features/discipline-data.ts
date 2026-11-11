import type {Position} from './trading';
export const DAILY_LIMITS = [2,3,4] as const;
export type DailyLimit = typeof DAILY_LIMITS[number];
export const DEFAULT_DAILY_LIMIT:DailyLimit = 2;
export function normalizeDailyLimit(value:unknown):DailyLimit {
 return value===3||value===4?value:DEFAULT_DAILY_LIMIT;
}
export const sessionDay=(now=new Date())=>now.toISOString().slice(0,10);
export function tradesToday(positions:Pick<Position,'id'|'opened'>[],history:Pick<Position,'id'|'opened'>[],now=new Date()) {
 const day=sessionDay(now);
 return new Set([...positions,...history].filter(p=>p.opened.slice(0,10)===day).map(p=>p.id)).size;
}
export function dailyCapReached(positions:Pick<Position,'id'|'opened'>[],history:Pick<Position,'id'|'opened'>[],limit:DailyLimit,now=new Date()) {
 return tradesToday(positions,history,now)>=limit;
}