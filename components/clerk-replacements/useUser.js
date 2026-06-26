import { useSession } from "next-auth/react";

export function useUser() {
  const { data: session, status } = useSession();
  const user = session?.user
    ? {
        id: session.user.id,
        fullName: session.user.name || session.user.email?.split("@")[0] || "User",
        email: session.user.email,
        imageUrl: session.user.imageUrl || undefined,
      }
    : null;
  return { user, isLoaded: status === "authenticated" };
} 