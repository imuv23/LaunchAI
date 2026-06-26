"use server";

import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ai } from "@/lib/gemini";

export async function generateAIInsights(industry) {
  // Check if GEMINI_API_KEY is available
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set");
    throw new Error("AI service is not configured. Please check environment variables.");
  }

  const prompt = `
    Generate industry insights for ${industry} in the following JSON format:
    {
      "salaryRanges": [
        {"role": "Junior", "min": 50000, "max": 80000},
        {"role": "Mid-level", "min": 80000, "max": 120000},
        {"role": "Senior", "min": 120000, "max": 180000}
      ],
      "growthRate": 15.5,
      "demandLevel": "High",
      "topSkills": ["skill1", "skill2", "skill3"],
      "marketOutlook": "Positive outlook with strong growth potential",
      "keyTrends": ["trend1", "trend2", "trend3"],
      "recommendedSkills": ["rec_skill1", "rec_skill2", "rec_skill3"]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating insights:", error);
    
    // Check if it's an API key error
    if (error.message?.includes('API_KEY') || error.message?.includes('authentication')) {
      throw new Error("AI service authentication failed. Please check your API key.");
    }
    
    // Return default insights if AI generation fails
    return {
      salaryRanges: [
        { role: "Junior", min: 50000, max: 80000 },
        { role: "Mid-level", min: 80000, max: 120000 },
        { role: "Senior", min: 120000, max: 180000 },
      ],
      growthRate: 10.0,
      demandLevel: "Medium",
      topSkills: ["Communication", "Problem Solving", "Teamwork"],
      marketOutlook: "Stable market with growth opportunities",
      keyTrends: ["Digital transformation", "Remote work", "Automation"],
      recommendedSkills: ["Leadership", "Technical skills", "Adaptability"],
    };
  }
}

export async function getIndustryInsights() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        industryInsight: true,
      },
    });

    if (!user) throw new Error("User not found");

    // If no insights exist, generate them
    if (!user.industryInsight) {
      const insights = await generateAIInsights(user.industry);

      const industryInsight = await db.industryInsight.create({
        data: {
          industry: user.industry,
          ...insights,
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return industryInsight;
    }

    return user.industryInsight;
  } catch (error) {
    console.error("Error in getIndustryInsights:", error);
    throw new Error(`Failed to get industry insights: ${error.message}`);
  }
}
