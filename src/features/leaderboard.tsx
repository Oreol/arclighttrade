import {useState} from 'react';
import {Trophy,ShieldCheck} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {useDesk} from './desk-context';
import {performance} from './journal-data';
import {benchmarkRows,COHORT_SIZE,PERSONAL_RANK,COHORT_DISCLOSURE} from './leaderboard-data';
export function Leaderboard({open,onOpenChange}:{open:boolean;onOpenChange:(v:boolean)=>void}){
 const d=useDesk();const m=performance(d.history);const [filter,setFilter]=useState('Top Performers');
 const personal={id:'self',rank:PERSONAL_RANK,name:d.name,tier:'Elite Candidate',discipline:m.discipline,winRate:m.winRate,netReturn:m.netReturn};
 const rows=[...benchmarkRows(filter),personal].sort((a,b)=>a.rank-b.rank);
 return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="performance-dialog"><DialogTitle>Global Performance Leaderboard</DialogTitle><DialogDescription>Arclight evaluation benchmarks · {COHORT_SIZE.toLocaleString()} traders</DialogDescription>
 <section className="personal-rank"><Trophy size={30}/><div><span className="section-kicker">PERSONAL BENCHMARK PLACEMENT</span><h2>Rank #57 of 5,420 Traders · Top 1.2% Elite Candidate</h2><p>{d.name} · Modeled rank, not a live competition</p></div></section>
 <div className="journal-metrics rank-metrics">{[['Discipline Index',`${m.discipline}/100`],['Win Rate',`${m.winRate}%`],['Net Return',`${m.netReturn>=0?'+':''}${m.netReturn.toFixed(2)}%`]].map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
 <div className="segmented rank-filters">{['Top Performers','Rising Traders','My Cohort'].map(f=><Button variant="ghost" key={f} className={filter===f?'active':''} onClick={()=>setFilter(f)}>{f}</Button>)}</div>
 <div className="table-scroll"><table><thead><tr>{['RANK','TRADER / TIER','DISCIPLINE','WIN RATE','NET RETURN'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(t=><tr key={t.id} className={t.id==='self'?'personal-row':''}><td>#{t.rank}</td><td><strong>{t.name}{t.id==='self'?' · You':''}</strong><small className="tier-badge">{t.tier}</small></td><td>{t.discipline}/100</td><td>{t.winRate}%</td><td className="text-ice">{t.netReturn>=0?'+':''}{t.netReturn.toFixed(2)}%</td></tr>)}</tbody></table></div>
 <p className="cohort-disclosure"><ShieldCheck size={16}/>{COHORT_DISCLOSURE}</p></DialogContent></Dialog>;
}