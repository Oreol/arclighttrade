import {createContext,useContext} from 'react';
import type {User} from '@supabase/supabase-js';
import type {Database} from '@/integrations/supabase/types';
import type {ReviewedTrade,TradeReview} from './journal-data';
import type {DailyLimit} from './discipline-data';
import type {Quote} from './market-quotes';
import type {Asset,Position,PendingOrder,OrderOptions} from './trading';
export type Signal=Database['public']['Tables']['signals']['Row'];
export type Lesson=Database['public']['Tables']['lessons']['Row'];
export type Teaser=Database['public']['Tables']['signal_teasers']['Row'];
export type State={maxTradesPerDay:DailyLimit;balance:number;completed:string[];positions:Position[];history:ReviewedTrade[];pending:PendingOrder[];name:string;notifications:boolean};
type DeskContext=State&{tradesToday:number;dailyLocked:boolean;disciplineOpen:boolean;setDisciplineOpen:(v:boolean)=>void;setMaxTradesPerDay:(v:DailyLimit)=>void;user:User|null;admin:boolean;pro:boolean;proOpen:boolean;setProOpen:(v:boolean)=>void;refreshAccess:()=>Promise<void>;signals:Signal[];lessons:Lesson[];teasers:Teaser[];prices:Record<Asset,number>;quotes:Record<Asset,Quote>;saveReview:(id:string,review:TradeReview)=>Promise<boolean>;authOpen:boolean;setAuthOpen:(v:boolean)=>void;available:number;equity:number;openPosition:(asset:Asset,side:Position['side'],allocation:number,tp:number|null,sl:number|null,options?:OrderOptions)=>boolean;cancelOrder:(id:string)=>void;closePosition:(id:string)=>void;complete:(id:string)=>void;updateProfile:(name:string,notifications:boolean)=>void;refresh:()=>Promise<void>};
export const DeskContext=createContext<DeskContext|null>(null);
export function useDesk(){const context=useContext(DeskContext);if(!context)throw new Error('Desk provider missing');return context;}
