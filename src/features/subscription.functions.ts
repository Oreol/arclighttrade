import {createServerFn} from '@tanstack/react-start';
import {requireSupabaseAuth} from '@/integrations/supabase/auth-middleware';
import {z} from 'zod';
import {PRO_PRICE} from './subscription-data';

async function grantPro(userId:string){
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const role=await supabaseAdmin.from('user_roles').upsert({user_id:userId,role:'subscriber'},{onConflict:'user_id,role',ignoreDuplicates:true});
 if(role.error)return {ok:false as const,message:'Your subscription could not be activated. Please contact the desk.'};
 const existing=await supabaseAdmin.from('subscriptions').select('id').eq('user_id',userId).eq('status','active').maybeSingle();
 if(!existing.data)await supabaseAdmin.from('subscriptions').insert({user_id:userId,status:'active',monthly_amount:Number(PRO_PRICE)});
 return {ok:true as const};
}

// Grants the subscriber role after a PayPal Sandbox approval.
// When PAYPAL_CLIENT_SECRET is configured the order is verified with PayPal before access is granted.
export const activatePro=createServerFn({method:'POST'})
 .middleware([requireSupabaseAuth])
 .inputValidator(z.object({orderId:z.string().min(3).max(64).regex(/^[A-Za-z0-9-]+$/)}).strict())
 .handler(async({data,context})=>{
  const clientId=process.env['PAYPAL_CLIENT_ID']??process.env['VITE_PAYPAL_CLIENT_ID'];
  const secret=process.env['PAYPAL_CLIENT_SECRET'];
  if(clientId&&secret){
   const base='https://api-m.sandbox.paypal.com';
   const auth=await fetch(`${base}/v1/oauth2/token`,{method:'POST',headers:{Authorization:`Basic ${btoa(`${clientId}:${secret}`)}`,'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials'});
   if(!auth.ok)return {ok:false as const,message:'Payment could not be verified. Please try again.'};
   const {access_token}=await auth.json() as {access_token:string};
   const res=await fetch(`${base}/v2/checkout/orders/${data.orderId}`,{headers:{Authorization:`Bearer ${access_token}`}});
   if(!res.ok)return {ok:false as const,message:'Payment could not be verified. Please try again.'};
   const order=await res.json() as {status?:string;purchase_units?:{amount?:{value?:string;currency_code?:string}}[]};
   const amount=order.purchase_units?.[0]?.amount;
   if(order.status!=='COMPLETED'||amount?.value!==PRO_PRICE||amount.currency_code!=='USD')return {ok:false as const,message:'Payment was not completed for Arclight Pro.'};
  }
  return grantPro(context.userId);
 });

// One-click sandbox approval for walkthroughs. Only available while PayPal verification is not configured,
// so it never bypasses a verified payment setup.
export const activateProSandbox=createServerFn({method:'POST'})
 .middleware([requireSupabaseAuth])
 .handler(async({context})=>{
  if(process.env['PAYPAL_CLIENT_SECRET'])return {ok:false as const,message:'Sandbox approval is disabled while verified PayPal checkout is active.'};
  return grantPro(context.userId);
 });
