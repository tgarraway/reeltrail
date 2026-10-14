import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../app/chatgpt-auth';
export type Session = { uid:string; token:string; until:number; id:string; secret:string; type:string; username:string };
const cookieName='__Host-reeltrail';
export const privateHeaders={'Cache-Control':'no-store','Referrer-Policy':'no-referrer'};
export async function authorize(req:Request, mutation=false){
 const user=await getChatGPTUser();
 if(!user) throw new Error('Sign in to this private app first.');
 if(mutation && req.headers.get('origin')!==new URL(req.url).origin) throw new Error('Request origin rejected.');
 return user.userId;
}
async function key(){const value=(env as unknown as Record<string,string>).SESSION_KEY;if(!value)throw new Error('Session security configuration is unavailable.');return crypto.subtle.importKey('raw',Uint8Array.from(value.match(/.{2}/g)!.map(v=>parseInt(v,16))),{name:'AES-GCM'},false,['encrypt','decrypt']);}
export async function seal(s:Session){const iv=crypto.getRandomValues(new Uint8Array(12));const data=await crypto.subtle.encrypt({name:'AES-GCM',iv},await key(),new TextEncoder().encode(JSON.stringify(s)));return Buffer.concat([Buffer.from(iv),Buffer.from(data)]).toString('base64url');}
export async function readSession(req:Request, uid:string):Promise<Session|null>{try{const value=req.headers.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith(cookieName+'='))?.slice(cookieName.length+1);if(!value)return null;const bytes=Buffer.from(value,'base64url');const data=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.subarray(0,12)},await key(),bytes.subarray(12));const s=JSON.parse(new TextDecoder().decode(data));return s.uid===uid?s:null;}catch{return null;}}
export function cookie(value:string,clear=false){return `${cookieName}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${clear?0:2592000}`;}
export async function getToken(s:Omit<Session,'token'|'until'>):Promise<Session>{
 const body=new URLSearchParams({grant_type:s.type==='installed'?'https://oauth.reddit.com/grants/installed_client':'client_credentials'});if(s.type==='installed')body.set('device_id',crypto.randomUUID());
 const response=await fetch('https://www.reddit.com/api/v1/access_token',{method:'POST',headers:{Authorization:'Basic '+btoa(s.id+':'+s.secret),'Content-Type':'application/x-www-form-urlencoded','User-Agent':`web:reeltrail:v1.0 (by /u/${s.username})`},body,signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error(response.status===429?'Reddit rate limit reached. Wait a minute and retry.':'Reddit rejected the connection. Check your approved client ID, app type, and secret.');
 const data=await response.json() as {access_token?:string;expires_in?:number};if(!data.access_token)throw new Error('Reddit did not grant an access token. Check your app approval.');
 return {...s,token:data.access_token,until:Date.now()+(data.expires_in||3600)*1000-60000};
}
