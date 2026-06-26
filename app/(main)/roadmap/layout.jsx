'use client';

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { BarLoader } from "react-spinners";
import RoadmapError from "./_components/error-boundary";

export default function RoadmapLayout({ children }) {
  return (
    <div className="px-5">
      <ErrorBoundary FallbackComponent={RoadmapError}>
        <Suspense
          fallback={<BarLoader className="mt-4" width={"100%"} color="gray" />}
        >
          {children}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}