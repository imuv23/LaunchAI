"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export function SignInButton({ children, ...props }) {
  return (
    <Button asChild variant="outline" {...props}>
      <Link href="/sign-in">
        {children || "Sign In"}
      </Link>
    </Button>
  );
} 