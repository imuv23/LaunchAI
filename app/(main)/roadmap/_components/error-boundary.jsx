'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function RoadmapError({
  error,
  reset,
}) {
  useEffect(() => {
    console.error('Roadmap error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-4">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="text-muted-foreground">
          {error?.message || 'Failed to load roadmap data'}
        </p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}