import {ShieldAlert} from 'lucide-react';
import {Link} from '@tanstack/react-router';
import {Button} from '@/components/ui/button';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
import {useDesk} from './desk-context';
import {DAILY_LIMITS} from './discipline-data';
export function DailyRiskRule(){
 const d=useDesk();
 return <div className="daily-risk-rule"><label><span>Risk Rule: Max Trades Per Day</span><Select disabled={!d.accountReady} value={String(d.maxTradesPerDay)} onValueChange={v=>{if(v==='2'||v==='3'||v==='4')d.setMaxTradesPerDay(Number(v) as 2|3|4);}}><SelectTrigger aria-label="Risk Rule: Max Trades Per Day"><SelectValue/></SelectTrigger><SelectContent>{DAILY_LIMITS.map(n=><SelectItem key={n} value={String(n)}>{n} trades per day</SelectItem>)}</SelectContent></Select></label><span className={d.dailyLocked?'daily-count text-destructive':'daily-count text-ice'}>Trades today: {d.tradesToday} / {d.maxTradesPerDay}</span><small>Daily session resets at 00:00 UTC.</small></div>;
}
export function DisciplineModal(){
 const d=useDesk();
 return <Dialog open={d.disciplineOpen} onOpenChange={d.setDisciplineOpen}><DialogContent className="discipline-modal"><span className="discipline-warning"><ShieldAlert size={16}/> DAILY RISK LIMIT</span><DialogTitle>Discipline Protocol Enforced</DialogTitle><DialogDescription>Daily Trade Cap Reached ({d.tradesToday}/{d.maxTradesPerDay} Trades Executed Today). To protect trader psychology and prevent overtrading, further executions are locked until the next market session.</DialogDescription><div className="discipline-stats"><div><span>Trades Placed</span><strong>{d.tradesToday}</strong></div><div><span>Risk Limit</span><strong>{d.maxTradesPerDay}</strong></div></div><div className="discipline-actions"><Button asChild><Link to="/journal" onClick={()=>d.setDisciplineOpen(false)}>Review Journal &amp; Stats</Link></Button><Button variant="outline" onClick={()=>d.setDisciplineOpen(false)}>Acknowledge</Button></div></DialogContent></Dialog>;
}