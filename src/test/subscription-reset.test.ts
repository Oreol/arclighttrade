import {beforeEach,describe,expect,it,vi} from 'vitest';

const mocks=vi.hoisted(()=>({from:vi.fn(),auth:{name:'auth'}}));
vi.mock('@tanstack/react-start',()=>({createServerFn:()=>{
 const builder={middleware:vi.fn((middleware:unknown[])=>{expect(middleware).toEqual([mocks.auth]);return builder;}),inputValidator:()=>builder,handler:(handler:unknown)=>handler};return builder;
}}));
vi.mock('@/integrations/supabase/auth-middleware',()=>({requireSupabaseAuth:mocks.auth}));
vi.mock('@/integrations/supabase/client.server',()=>({supabaseAdmin:{from:mocks.from}}));
import {resetProSubscription} from '@/features/subscription.functions';
const reset=resetProSubscription as unknown as (input:{context:{userId:string};data?:unknown})=>Promise<{ok:boolean}>;

describe('Subscription self-reset',()=>{
 beforeEach(()=>mocks.from.mockReset());
 function setup(cancelError:unknown=null,removeError:unknown=null){
  const cancelLast=vi.fn().mockResolvedValue({error:cancelError});const cancelOwner=vi.fn(()=>({eq:cancelLast}));const update=vi.fn(()=>({eq:cancelOwner}));
  const removeLast=vi.fn().mockResolvedValue({error:removeError});const removeOwner=vi.fn(()=>({eq:removeLast}));const remove=vi.fn(()=>({eq:removeOwner}));
  mocks.from.mockImplementation(table=>table==='subscriptions'?{update}:{delete:remove});return {update,cancelOwner,cancelLast,removeOwner,removeLast};
 }
 it('cancels only the verified caller active subscription and removes only their subscriber role',async()=>{
  const calls=setup();expect(await reset({context:{userId:'signed-in-owner'},data:{userId:'other-account'}})).toEqual({ok:true});
  expect(calls.update).toHaveBeenCalledWith({status:'cancelled'});expect(calls.cancelOwner).toHaveBeenCalledWith('user_id','signed-in-owner');expect(calls.cancelLast).toHaveBeenCalledWith('status','active');
  expect(calls.removeOwner).toHaveBeenCalledWith('user_id','signed-in-owner');expect(calls.removeLast).toHaveBeenCalledWith('role','subscriber');
 });
 it('does not touch balances, positions or trade records',async()=>{
  setup();await reset({context:{userId:'signed-in-owner'}});expect(mocks.from.mock.calls).toEqual([['subscriptions'],['user_roles']]);
 });
 it('does not report success if subscription cancellation fails',async()=>{
  setup({message:'failure'});expect((await reset({context:{userId:'owner'}})).ok).toBe(false);expect(mocks.from).toHaveBeenCalledTimes(1);
 });
 it('does not report success if subscriber role removal fails',async()=>{
  setup(null,{message:'failure'});expect((await reset({context:{userId:'owner'}})).ok).toBe(false);
 });
});