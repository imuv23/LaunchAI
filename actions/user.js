"use server";

import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  try {
    const result = await db.$transaction(async (tx) => {
      let industryInsight = await tx.industryInsight.findUnique({
        where: {
          industry: data.industry,
        },
      });

      if (!industryInsight) {
        try {
          const insights = await generateAIInsights(data.industry);

          industryInsight = await tx.industryInsight.create({
            data: {
              industry: data.industry,
              ...insights,
              nextUpdate: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
              ),
            },
          });
        } catch (aiError) {
          console.error(
            "AI insight generation failed, using defaults:",
            aiError
          );

          industryInsight = await tx.industryInsight.create({
            data: {
              industry: data.industry,
              salaryRanges: [
                {
                  role: "Junior",
                  min: 50000,
                  max: 80000,
                },
                {
                  role: "Mid-level",
                  min: 80000,
                  max: 120000,
                },
                {
                  role: "Senior",
                  min: 120000,
                  max: 180000,
                },
              ],
              growthRate: 10,
              demandLevel: "Medium",
              topSkills: [
                "Communication",
                "Problem Solving",
                "Teamwork",
              ],
              marketOutlook:
                "Stable market with growth opportunities",
              keyTrends: [
                "Digital transformation",
                "Remote work",
                "Automation",
              ],
              recommendedSkills: [
                "Leadership",
                "Technical Skills",
                "Adaptability",
              ],
              nextUpdate: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
              ),
            },
          });
        }
      }

      const updatedUser = await tx.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          industry: data.industry,
          experience: Number(data.experience),
          bio: data.bio,
          skills: data.skills,
        },
      });

      return {
        updatedUser,
        industryInsight,
      };
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/onboarding");

    return result.updatedUser;
  } catch (error) {
  console.error("========== UPDATE PROFILE ERROR ==========");
  console.error(error);
  console.error(error.stack);
  console.error("=========================================");

  throw error;
}
}

export async function getUserOnboardingStatus() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        industry: true,
      },
    });

    return {
      isOnboarded: !!user?.industry,
    };
  } catch (error) {
    console.error(
      "Error checking onboarding status:",
      error
    );
    throw new Error(
      "Failed to check onboarding status"
    );
  }
}