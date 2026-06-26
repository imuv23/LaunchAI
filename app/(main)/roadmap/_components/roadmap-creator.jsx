"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateRoadmap } from "@/actions/roadmap";

const formSchema = z.object({
  role: z.string().min(3, "Role must be at least 3 characters"),
});

export default function RoadmapCreator() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await generateRoadmap(data.role);
      toast.success("Roadmap generated successfully!");
      form.reset();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate New Roadmap</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Target Role</Label>
            <Input
              id="role"
              placeholder="e.g. Backend Developer, DevOps Engineer"
              {...form.register("role")}
              disabled={isLoading}
            />
            {form.formState.errors.role && (
              <p className="text-sm text-red-500">
                {form.formState.errors.role.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Roadmap
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}