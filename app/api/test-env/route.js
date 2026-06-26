import { NextResponse } from "next/server";

export async function GET() {
  const envVars = {
    DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Missing",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "✅ Set" : "❌ Missing",
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? "✅ Set" : "❌ Missing",
    NODE_ENV: process.env.NODE_ENV || "Not set"
  };

  return NextResponse.json({
    message: "Environment Variables Check",
    environment: envVars,
    timestamp: new Date().toISOString()
  });
} 