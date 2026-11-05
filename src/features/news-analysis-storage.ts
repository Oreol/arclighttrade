import {z} from 'zod';
import {findNews,newsAnalysisSchema} from './market-news-data';

const resultSchema=z.discriminatedUnion('ok',[
 z.object({ok:z.literal(true),analysis:newsAnalysisSchema,setups:z.array(z.object({id:z.string(),asset:z.string()})),lesson:z.object({id:z.string(),title:z.string(),module:z.number(),module_name:z.string()}).nullable()}),
 z.object({ok:z.literal(false),status:z.number(),message:z.string()}),
]);
const savedSchema=z.object({version:z.literal(1),storyId:z.string(),open:z.boolean(),result:resultSchema.nullable()});
export type SavedNewsAnalysis=z.infer<typeof savedSchema>;
export function newsStorageKey(userId:string){return `arclight:news-analysis:v1:${userId}`;}
export function readNewsAnalysis(storage:Pick<Storage,'getItem'>,userId:string):SavedNewsAnalysis|null{
 try{
  const raw=storage.getItem(newsStorageKey(userId));if(!raw)return null;
  const parsed=savedSchema.safeParse(JSON.parse(raw));
  return parsed.success&&findNews(parsed.data.storyId)?parsed.data:null;
 }catch{return null;}
}
export function writeNewsAnalysis(storage:Pick<Storage,'setItem'>,userId:string,value:SavedNewsAnalysis){
 try{storage.setItem(newsStorageKey(userId),JSON.stringify(value));}catch{/* Storage may be disabled or full; analysis remains usable. */}
}