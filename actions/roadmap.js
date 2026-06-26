"use server";

import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

import { ai } from "@/lib/gemini";

export async function generateRoadmap(role) {
  try {
    // Check if GEMINI_API_KEY is available
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("AI service is not configured. Please check environment variables.");
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        industryInsight: true,
      },
    });

    if (!user) throw new Error("User not found");
    if (!user.industry) throw new Error("Please complete your industry profile first");

    const prompt = `
      Create a detailed career roadmap for becoming a ${role} in the ${user.industry} industry.
      Return the response in the following JSON format without any additional text:
      {
        "description": "Brief overview of the role and career path",
        "timeframe": number_of_months_needed,
        "skills": ["required_skill_1", "required_skill_2"],
        "steps": [
          {
            "title": "Step title",
            "description": "Detailed description",
            "duration": "estimated_weeks",
            "resources": [
              {
                "type": "course/book/project",
                "title": "Resource title",
                "url": "optional_url"
              }
            ]
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let roadmapData;
    
    try {
      const text = response.text();
      const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
      roadmapData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Error parsing roadmap data:", parseError);
      throw new Error("Failed to generate roadmap data");
    }

    const roadmap = await db.roadmap.create({
      data: {
        userId: user.id,
        industry: user.industry,
        role,
        description: roadmapData.description,
        skills: roadmapData.skills,
        steps: roadmapData.steps,
        timeframe: roadmapData.timeframe,
      },
    });

    revalidatePath("/roadmap");
    return roadmap;
  } catch (error) {
    console.error("Error generating roadmap:", error);
    
    // Check if it's an API key error
    if (error.message?.includes('API_KEY') || error.message?.includes('authentication')) {
      throw new Error("AI service authentication failed. Please check your API key.");
    }
    
    throw new Error(error.message || "Failed to generate roadmap");
  }
}

export async function getRoadmaps() {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      console.log(`Attempting to get roadmaps (attempt ${retryCount + 1}/${maxRetries})`);
      
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        console.error('Authentication failed: No userId found');
        throw new Error("Unauthorized");
      }

      const user = await db.user.findUnique({
        where: { id: session.user.id },
      });

      if (!user) {
        console.error('User not found in database');
        throw new Error("User not found");
      }

      console.log('Fetching roadmaps for user:', user.id);
      const roadmaps = await db.roadmap.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      console.log(`Successfully fetched ${roadmaps.length} roadmaps`);
      return roadmaps;

    } catch (error) {
      console.error(`Error in getRoadmaps (attempt ${retryCount + 1}):`, error);
      
      if (error.message.includes('Unauthorized') || error.message.includes('User not found')) {
        throw error; // Don't retry auth/user errors
      }

      retryCount++;
      if (retryCount === maxRetries) {
        console.error('Max retries reached. Failing getRoadmaps.');
        throw new Error("Failed to fetch roadmaps after multiple attempts");
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
    }
  }
}

export async function updateRoadmapProgress(id, progress) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) throw new Error("User not found");

  const roadmap = await db.roadmap.findUnique({
    where: { id },
  });

  if (!roadmap || roadmap.userId !== user.id) {
    throw new Error("Roadmap not found or access denied");
  }

  const status = progress >= 100 ? "completed" : "in_progress";

  await db.roadmap.update({
    where: { id },
    data: {
      progress,
      status,
    },
  });

  revalidatePath("/dashboard");
}