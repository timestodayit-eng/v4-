import { NextResponse } from 'next/server';
import { checkAdminCredentials, createSessionToken, setAdminSession } from '../../../../lib/admin-auth';
export async function POST(request){
  try{const body=await request.json();if(!checkAdminCredentials(body.email,body.password))return NextResponse.json({error:'Invalid email or password'},{status:401});const token=createSessionToken();setAdminSession(token);return NextResponse.json({success:true});}
  catch(error){console.error('Admin login error',error);return NextResponse.json({error:'Login failed. Check server configuration.'},{status:500})}
}
