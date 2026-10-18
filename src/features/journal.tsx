import {useState} from 'react';
import {Link} from '@tanstack/react-router';
import {BookOpen,ArrowUpRight,Check,Save,Search,ShieldCheck} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Checkbox} from '@/components/ui/checkbox';
import {Textarea} from '@/components/ui/textarea';
import {Sheet,SheetContent,SheetTitle,SheetDescription} from '@/components/ui/sheet';
import {useDesk} from './desk-context';
import {money,price,pips} from './trading';
import {performance,STRATEGIES,EMOTIONS,REVIEW_RULES,type ReviewedTrade,type TradeReview} from './journal-data';
export function Journal(){
 const d=useDesk();const m=performance(d.history);const [selected,setSelected]=useState<string|null>(null);const [search,setSearch]=useState('');const [filter,setFilter]=useState('All trades');const trade=d.history.find(t=>t.id===selected);
 const rows=d.history.filter(t=>(`${t.asset} ${t.side} ${t.review?.notes??''}`).toLowerCase().includes(search.toLowerCase())&&(filter==='All trades'||(filter==='Reviewed'?Boolean(t.review):!t.review)));
 return <><div className="page-heading"><div><div className="eyebrow">ACCOUNTABILITY DESK</div><h1>Trading Journal</h1><p>Every execution. Every decision. A measurable standard.</p></div><Button asChild variant="outline"><Link to="/paper-desk">Paper Desk <ArrowUpRight/></Link></Button></div>
 <div className="journal-metrics">{[['Rule Adherence Streak',`${m.streak} trades`],['Rules Broken',String(m.broken)],['Discipline Index',`${m.discipline}/100`],['Win Rate',`${m.winRate}%`],['Net Realized PnL',money(m.net)]].map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
 <div className="journal-toolbar"><div className="segmented">{['All trades','Needs review','Reviewed'].map(f=><Button key={f} variant="ghost" className={filter===f?'active':''} onClick={()=>setFilter(f)}>{f}</Button>)}</div><label className="journal-search"><Search size={16}/><Input aria-label="Search journal" placeholder="Search trades…" value={search} onChange={e=>setSearch(e.target.value)}/></label></div>
 <div className="section-heading"><h2>Execution record <span className="count-badge">{d.history.length}</span></h2><span className="subtle-tag">{m.reviewed} REVIEWED</span></div>
 {d.history.length?<div className="table-scroll"><table><thead><tr>{['CLOSED / ASSET','SIDE','SIZE / LEVERAGE','ENTRY','EXIT','PIPS','REALIZED P&L','REVIEW'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(t=><tr key={t.id}><td><strong>{t.asset}</strong><small className="journal-date">{new Date(t.closed).toLocaleString()}</small></td><td><span className={`bias ${t.side==='SHORT'?'short':''}`}>{t.side}</span></td><td>{t.lots!==undefined?`${t.lots.toFixed(4)} lots · 1:100`:`${t.units.toFixed(6)} units · ${t.leverage??1}x`}<small className="journal-date">{t.reason}</small></td><td>{price(t.asset,t.entry)}</td><td>{price(t.asset,t.exit)}</td><td>{t.lots===undefined?'—':`${pips(t,t.exit)>=0?'+':''}${pips(t,t.exit).toFixed(1)}`}</td><td className={t.pnl<0?'text-destructive':'text-ice'}>{money(t.pnl)}</td><td><Button variant="outline" size="sm" onClick={()=>setSelected(t.id)}>{t.review?<Check size={14}/>:<BookOpen size={14}/>} {t.review?'Edit review':'Review trade'}</Button></td></tr>)}</tbody></table>{!rows.length&&<p className="empty-state">No trades match this view.</p>}</div>:<div className="empty-state journal-empty"><BookOpen size={32}/><h2>No closed trades yet.</h2><Button asChild><Link to="/paper-desk">Open Paper Desk <ArrowUpRight/></Link></Button></div>}
 <p className="journal-footnote"><ShieldCheck size={16}/> Discipline Index awards one point per verified checklist rule. Unreviewed rules earn no points. The streak requires a defined stop with an exit at or within it; liquidations break the streak.</p>
 {!d.user&&<Button variant="link" onClick={()=>d.setAuthOpen(true)}>Sign in to retain your journal and reviews</Button>}
 <Sheet open={Boolean(trade)} onOpenChange={v=>{if(!v)setSelected(null);}}><SheetContent className="review-drawer"><SheetTitle>Trade reflection</SheetTitle><SheetDescription>{trade?`${trade.asset} · ${trade.side} · ${money(trade.pnl)}`:'Execution review'}</SheetDescription>{trade&&<TradeReflection key={trade.id} trade={trade} onSaved={()=>setSelected(null)}/>}</SheetContent></Sheet></>;
}
function TradeReflection({trade,onSaved}:{trade:ReviewedTrade;onSaved:()=>void}){
 const d=useDesk();const [review,setReview]=useState<TradeReview>(()=>trade.review??{strategies:[],emotions:[],checks:{stopRespected:false,riskSized:false,entryPlanned:false,noRevenge:false},notes:'',reviewedAt:''});const [busy,setBusy]=useState(false);
 function toggle(field:'strategies'|'emotions',value:string){setReview(r=>({...r,[field]:r[field].includes(value)?r[field].filter(t=>t!==value):[...r[field],value]}));}
 return <form className="reflection-form" onSubmit={async e=>{e.preventDefault();setBusy(true);const saved=await d.saveReview(trade.id,{...review,reviewedAt:new Date().toISOString()});setBusy(false);if(saved)onSaved();}}>
 <section><h3>Strategy</h3><div className="tag-options">{STRATEGIES.map(t=><Button type="button" variant="outline" key={t} aria-pressed={review.strategies.includes(t)} className={review.strategies.includes(t)?'active':''} onClick={()=>toggle('strategies',t)}>{t}</Button>)}</div></section>
 <section><h3>Emotional state</h3><div className="tag-options">{EMOTIONS.map(t=><Button type="button" variant="outline" key={t} aria-pressed={review.emotions.includes(t)} className={review.emotions.includes(t)?'active':''} onClick={()=>toggle('emotions',t)}>{t}</Button>)}</div></section>
 <section><h3>Risk & rule compliance</h3>{REVIEW_RULES.map(r=><label className="review-rule" key={r.key}><Checkbox checked={review.checks[r.key]} onCheckedChange={v=>setReview(x=>({...x,checks:{...x.checks,[r.key]:v===true}}))}/>{r.label}</label>)}</section>
 <label className="review-notes">Review notes<Textarea aria-label="Review notes" rows={6} maxLength={5000} value={review.notes} onChange={e=>setReview(r=>({...r,notes:e.target.value}))}/></label><Button type="submit" disabled={busy}><Save size={16}/>{busy?'Saving…':'Save review'}</Button>
 </form>;
}