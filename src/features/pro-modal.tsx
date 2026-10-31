import {useState} from 'react';
import {PayPalScriptProvider,PayPalButtons} from '@paypal/react-paypal-js';
import {useServerFn} from '@tanstack/react-start';
import {Check,LoaderCircle,ShieldCheck} from 'lucide-react';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {Dialog,DialogContent,DialogDescription,DialogTitle} from '@/components/ui/dialog';
import {useDesk} from './desk-context';
import {activatePro} from './subscription.functions';
import {PRO_NAME,PRO_PRICE,paypalClientId} from './subscription-data';

const benefits=['Premium Desk Alpha Briefs with entry zones, invalidation and tiered targets','Arclight AI interpretation for every Market News briefing','Analyst-reviewed setups across Forex, Gold and Crypto'];

export function ProModal(){
 const desk=useDesk();const activate=useServerFn(activatePro);const [busy,setBusy]=useState(false);
 async function approve(orderId:string){
  setBusy(true);
  try{const result=await activate({data:{orderId}});if(!result.ok){toast.error(result.message);return;}await desk.refreshAccess();desk.setProOpen(false);toast.success('Welcome to Arclight Pro!');}
  catch{toast.error('Your subscription could not be activated. Please try again.');}
  finally{setBusy(false);}
 }
 return <Dialog open={desk.proOpen} onOpenChange={desk.setProOpen}><DialogContent className="pro-modal">
  <div className="eyebrow">PREMIUM DESK ACCESS</div>
  <DialogTitle>{PRO_NAME}</DialogTitle>
  <DialogDescription>Unlock Analyst Alpha Briefs and Arclight AI news interpretation.</DialogDescription>
  <div className="pro-price"><strong>${PRO_PRICE}</strong><span>/ month</span></div>
  <ul className="pro-benefits">{benefits.map(b=><li key={b}><Check size={15}/>{b}</li>)}</ul>
  {!desk.user?<Button onClick={()=>{desk.setProOpen(false);desk.setAuthOpen(true);}}>Sign in to subscribe</Button>
  :desk.pro?<p className="pro-active"><ShieldCheck size={16}/>Your Arclight Pro access is active.</p>
  :busy?<div className="analysis-loading" role="status"><LoaderCircle className="animate-spin"/><span>Activating your subscription…</span></div>
  :<div className="pro-checkout"><PayPalScriptProvider options={{clientId:paypalClientId(import.meta.env['VITE_PAYPAL_CLIENT_ID']),currency:'USD',intent:'capture'}}>
   <PayPalButtons style={{layout:'vertical',color:'blue',shape:'rect',label:'subscribe'}}
    createOrder={(_data,actions)=>actions.order.create({intent:'CAPTURE',purchase_units:[{description:PRO_NAME,amount:{currency_code:'USD',value:PRO_PRICE}}]})}
    onApprove={async(data,actions)=>{await actions.order?.capture();await approve(data.orderID);}}
    onError={()=>toast.error('PayPal checkout could not be completed.')}/>
  </PayPalScriptProvider></div>}
  <p className="analysis-disclaimer">PayPal Sandbox checkout · Your Simulated Evaluation Capital is unaffected.</p>
 </DialogContent></Dialog>;
}
