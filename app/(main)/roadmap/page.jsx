import { getRoadmaps } from "@/actions/roadmap";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import RoadmapCreator from "./_components/roadmap-creator";
import RoadmapList from "./_components/roadmap-list";
import RoadmapError from "./_components/error-boundary";
import { BarLoader } from "react-spinners";

export const dynamic = "force-dynamic";

async function RoadmapContent() {
  const roadmaps = await getRoadmaps();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <RoadmapCreator />
      <RoadmapList roadmaps={roadmaps} />
    </div>
  );
}

export default async function RoadmapPage() {
  try {
    // Check if user is onboarded
    const { isOnboarded } = await getUserOnboardingStatus();

    // If not onboarded, redirect to onboarding page
    if (!isOnboarded) {
      redirect("/onboarding");
    }

    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Career Roadmap Generator</h1>
            <p className="text-muted-foreground">
              Get a personalized roadmap for your dream role
            </p>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="w-full py-10">
              <BarLoader width={"100%"} color="gray" />
            </div>
          }
        >
          <RoadmapContent />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Error in RoadmapPage:", error);
    throw error;
  }
}