import { eq } from "drizzle-orm";
import { user } from "./db/auth-schema";
import { db } from "./db/db";

export async function getQueriedUserId(
  email: string | undefined,
  session: {
    session: {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      userId: string;
      expiresAt: Date;
      token: string;
      ipAddress?: string | null | undefined | undefined;
      userAgent?: string | null | undefined | undefined;
    };
    user: {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      email: string;
      emailVerified: boolean;
      name: string;
      image?: string | null | undefined | undefined;
    };
  }
) {
  if (email) {
    const selectedUser = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (!selectedUser.length) {
      throw createError({
        statusCode: 404,
        message: "User not found",
      });
    }

    return selectedUser[0].id;
  }

  return session.user.id;
}
