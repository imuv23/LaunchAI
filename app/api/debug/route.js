import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connection
    const dbTest = await db.$queryRaw`SELECT 1 as test`;
    
    // Test session
    const session = await getServerSession(authOptions);
    
    // Test user query if session exists
    let userData = null;
    if (session?.user?.id) {
      userData = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          industry: true,
          industryInsight: true
        }
      });
    }

    return NextResponse.json({
      status: "success",
      database: "✅ Connected",
      session: session ? "✅ Active" : "❌ No session",
      user: userData ? "✅ Found" : "❌ Not found",
      userData: userData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({
      status: "error",
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 