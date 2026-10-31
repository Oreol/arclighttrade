export const PRO_PRICE='30.00';
export const PRO_NAME='Arclight Pro';
// PayPal's documented public sandbox client ID is used when no project client ID is configured.
export function paypalClientId(configured:string|undefined){return configured&&configured.trim()?configured.trim():'test';}
/** Premium Alpha Briefs and Arclight AI news analysis require an active Pro subscription (or admin access). */
export function hasProAccess(roles:{subscriber:boolean;admin:boolean}){return roles.subscriber||roles.admin;}
