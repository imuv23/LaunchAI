export const dynamic = "force-dynamic";
import { getResume } from "@/actions/resume";
import ResumeBuilder from "./_components/resume-builder";
import ResumeErrorFallback from "./_components/resume-error-fallback";

export default async function ResumePage() {
  try {
    const resume = await getResume();

    return (
      <div className="container mx-auto py-6">
        <ResumeBuilder initialContent={resume?.content} />
      </div>
    );
  } catch (error) {
    console.error("Resume page error:", error);
    return <ResumeErrorFallback error={error} />;
  }
}
