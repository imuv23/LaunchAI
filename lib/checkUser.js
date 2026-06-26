import { getServerSession } from "next-auth/next";
import { db } from "./prisma";
import { authOptions } from "./auth";

export const checkUser = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    const newUser = await db.user.create({
      data: {
        email: session.user.email,
        name: session.user.name || "User",
        imageUrl: session.user.image,
      },
    });

    return newUser;
  } catch (error) {
    console.log(error.message);
  }
};
