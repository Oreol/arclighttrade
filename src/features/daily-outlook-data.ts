import {z} from 'zod';
export const dailyOutlookSchema=z.object({sentence1:z.string(),sentence2:z.string(),sentence3:z.string()}).strict();
export function utcDay(date=new Date()){return date.toISOString().slice(0,10);}
export function outlookSentences(value:unknown):string[]|null{
 const parsed=dailyOutlookSchema.safeParse(value);
 if(!parsed.success)return null;
 const sentences=[parsed.data.sentence1,parsed.data.sentence2,parsed.data.sentence3];
 return sentences.every(s=>s.trim().length>0)?sentences:null;
}
export function canGenerate(status:string|undefined){return status===undefined;}