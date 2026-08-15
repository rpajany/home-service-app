import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import { getSession } from "@/lib/auth";
export async function DELETE(req,{params}) { const session=await getSession(); if(!session) return NextResponse.json({error:"Unauthenticated"},{status:401}); const {id}=await params; try { await connectDB(); const b=await Booking.findOneAndUpdate({_id:id,user:session.userId},{status:"Cancelled"},{new:true}); if(!b) return NextResponse.json({error:"Booking not found"},{status:404}); return NextResponse.json({booking:b}); } catch { return NextResponse.json({error:"Unable to cancel booking"},{status:500}); } }
