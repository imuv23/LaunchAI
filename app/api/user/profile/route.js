import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        industry: true,
        experience: true,
        skills: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      name,
      email,
      bio,
      industry,
      experience,
      skills,
    } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findFirst({
      where: {
        email,
        NOT: {
          email: session.user.email,
        },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    const updatedUser = await db.$transaction(async (tx) => {

      // Create IndustryInsight if it doesn't exist
      if (industry) {
        const existingIndustry =
          await tx.industryInsight.findUnique({
            where: {
              industry,
            },
          });

        if (!existingIndustry) {
          await tx.industryInsight.create({
            data: {
              industry,
              salaryRanges: [],
              growthRate: 0,
              demandLevel: "Medium",
              topSkills: [],
              marketOutlook: "No data available",
              keyTrends: [],
              recommendedSkills: [],
              nextUpdate: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
              ),
            },
          });
        }
      }

      return await tx.user.update({
        where: {
          email: session.user.email,
        },
        data: {
          name: name || null,
          email,
          bio: bio || null,
          industry: industry || null,
          experience: Number(experience) || 0,
          skills: Array.isArray(skills) ? skills : [],
        },
        select: {
          id: true,
          name: true,
          email: true,
          bio: true,
          industry: true,
          experience: true,
          skills: true,
          imageUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error("========== PROFILE UPDATE ERROR ==========");
    console.error(error);
    console.error("==========================================");

    return NextResponse.json(
      {
        error: error.message || "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}
