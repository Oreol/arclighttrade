import {beforeEach,describe,expect,it} from 'vitest';
import {newsStorageKey,readNewsAnalysis,writeNewsAnalysis,type SavedNewsAnalysis} from '@/features/news-analysis-storage';
const snapshot:SavedNewsAnalysis={version:1,storyId:'gold-yields',open:true,result:{ok:true,analysis:{summary:'Yields increased. Gold may face pressure.',impact:'Bearish',impactReason:'Higher yields.',assets:['XAU/USD']},setups:[{id:'gold',asset:'XAU/USD'}],lesson:null}};
describe('Saved Market News interpretation',()=>{
 beforeEach(()=>localStorage.clear());
 it('restores the selected story and complete interpretation without generation',()=>{writeNewsAnalysis(localStorage,'student',snapshot);expect(readNewsAnalysis(localStorage,'student')).toEqual(snapshot);});
 it('never restores another account’s interpretation',()=>{writeNewsAnalysis(localStorage,'student',snapshot);expect(readNewsAnalysis(localStorage,'other')).toBeNull();});
 it('retains the last result when its drawer was closed',()=>{writeNewsAnalysis(localStorage,'student',{...snapshot,open:false});expect(readNewsAnalysis(localStorage,'student')?.result).toEqual(snapshot.result);expect(readNewsAnalysis(localStorage,'student')?.open).toBe(false);});
 it('rejects malformed or removed stories',()=>{localStorage.setItem(newsStorageKey('student'),'{');expect(readNewsAnalysis(localStorage,'student')).toBeNull();writeNewsAnalysis(localStorage,'student',{...snapshot,storyId:'removed'});expect(readNewsAnalysis(localStorage,'student')).toBeNull();});
 it('handles disabled storage without blocking analysis',()=>{const storage={getItem(){throw new Error('disabled');},setItem(){throw new Error('disabled');}};expect(readNewsAnalysis(storage,'student')).toBeNull();expect(()=>writeNewsAnalysis(storage,'student',snapshot)).not.toThrow();});
});