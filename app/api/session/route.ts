import {authorize,readSession,privateHeaders} from '../../../lib/reddit-session';
export async function GET(req:Request){try{const uid=await authorize(req);const s=await readSession(req,uid);return Response.json({connected:!!s},{headers:privateHeaders});}catch{return Response.json({connected:false},{headers:privateHeaders});}}
