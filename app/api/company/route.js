import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Company from "@/models/Company";
export async function GET(){try{await connectDB();let company=await Company.findOne().lean();if(!company) company=await Company.create({});return NextResponse.json({company});}catch(e){console.error("COMPANY_GET_ERROR",e);return NextResponse.json({error:"Unable to load company information."},{status:500});}}
