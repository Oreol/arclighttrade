import {createFileRoute} from '@tanstack/react-router';
import {Academy} from '@/features/academy';
import {pageHead} from '@/features/metadata';
export const Route=createFileRoute('/academy')({validateSearch:(search:Record<string,unknown>):{lesson?:string}=>typeof search['lesson']==='string'?{lesson:search['lesson']}:{},head:()=>pageHead('Academy','Build a disciplined trading process through forex foundations, technical analysis and institutional order flow.'),component:Academy});
