"use client";

import { useState } from "react";
import { Loader2, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { updateRoadmapProgress } from "@/actions/roadmap";

export default function RoadmapList({ roadmaps }) {
  const [expandedId, setExpandedId] = useState(null);
  const [updating, setUpdating] = useState(false);

  const handleProgressUpdate = async (id, progress) => {
    try {
      setUpdating(true);
      await updateRoadmapProgress(id, progress);
      toast.success("Progress updated!");
    } catch (error) {
      toast.error(error.message || "Failed to update progress");
    } finally {
      setUpdating(false);
    }
  };

  if (!roadmaps?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Roadmaps</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-6">
            No roadmaps generated yet. Create your first roadmap!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Roadmaps</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {roadmaps.map((roadmap) => (
          <Card key={roadmap.id} className="border">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{roadmap.role}</h3>
                  <p className="text-sm text-muted-foreground">
                    {roadmap.timeframe} months • {roadmap.skills.length} skills
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setExpandedId(expandedId === roadmap.id ? null : roadmap.id)
                  }
                >
                  {expandedId === roadmap.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    Progress: {roadmap.progress}%
                  </span>
                  {roadmap.status === "completed" && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <Progress value={roadmap.progress} className="h-2" />
              </div>

              {expandedId === roadmap.id && (
                <div className="mt-4 space-y-4">
                  <p className="text-sm">{roadmap.description}</p>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Required Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {roadmap.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs bg-secondary px-2 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold">Learning Path:</h4>
                    {roadmap.steps.map((step, index) => (
                      <div key={index} className="space-y-2">
                        <h5 className="text-sm font-medium">
                          {index + 1}. {step.title}
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                        {step.resources?.length > 0 && (
                          <div className="pl-4">
                            <h6 className="text-xs font-medium mb-1">
                              Resources:
                            </h6>
                            <ul className="text-xs space-y-1">
                              {step.resources.map((resource, rIndex) => (
                                <li key={rIndex}>
                                  {resource.url ? (
                                    <a
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline"
                                    >
                                      {resource.title}
                                    </a>
                                  ) : (
                                    resource.title
                                  )}
                                  {resource.type && (
                                    <span className="text-muted-foreground">
                                      {" "}
                                      ({resource.type})
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex justify-end gap-2">
                    {[25, 50, 75, 100].map((progress) => (
                      <Button
                        key={progress}
                        size="sm"
                        variant={roadmap.progress >= progress ? "default" : "outline"}
                        onClick={() => handleProgressUpdate(roadmap.id, progress)}
                        disabled={
                          updating ||
                          roadmap.progress >= progress ||
                          (progress > 25 && roadmap.progress < progress - 25)
                        }
                      >
                        {progress}%
                        {updating && progress === roadmap.progress + 25 && (
                          <Loader2 className="ml-2 h-3 w-3 animate-spin" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}