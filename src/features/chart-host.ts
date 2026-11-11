import {useSyncExternalStore} from 'react';
import type {Asset} from './trading';
// Shared, non-component store so the shell-level chart survives route changes and Fast Refresh.
type ChartHostState={asset:Asset;slot:HTMLElement|null;expanded:boolean};
let state:ChartHostState={asset:'XAU/USD',slot:null,expanded:false};
const listeners=new Set<()=>void>();
export const chartHost={
 get:()=>state,
 set(patch:Partial<ChartHostState>){state={...state,...patch};listeners.forEach(l=>l());},
 subscribe(l:()=>void){listeners.add(l);return()=>{listeners.delete(l);};},
};
export function useChartHost(){return useSyncExternalStore(chartHost.subscribe,chartHost.get,chartHost.get);}
