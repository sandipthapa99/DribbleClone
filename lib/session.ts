import { getServerSession } from "next-auth/next";
import { NextAuthOptions, User } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import jsonwebtoken from "jsonwebtoken";
import { JWT } from "next-auth/jwt";
import { SessionInterface, UserProfile } from "@/common.types";
import { createUser, getUser } from "./actions";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    jwt: {
        encode: ({ secret, token }) => {
            const encodedToken = jsonwebtoken.sign(
                {
                    ...token,
                    iss: "grafbase",
                    exp: Math.floor(Date.now() / 1000) + 60 * 60,
                },
                secret
            );
            return encodedToken;
        },
        decode: async ({ secret, token }) => {
            const decodedToken = jsonwebtoken.verify(token!, secret) as JWT;
            console.log("🚀 ~ file: session.ts:31 ~ decode: ~ decodedToken:", decodedToken);
            return decodedToken;
        },
    },
    theme: {
        colorScheme: "light",
        logo: "/logo.png",
    },
    callbacks: {
        async session({ session }) {
            const email = session?.user?.email as string;

            try {
                const data = (await getUser(email)) as { user?: UserProfile };
                const newSession = {
                    ...session,
                    user: {
                        ...session.user,
                        ...data.user,
                    },
                };
                console.log("🚀 ~ file: session.ts:53 ~ session ~ newSession:", session);
                return newSession;
            } catch (error) {
                console.log("🚀 ~ file: session.ts:40 ~ session ~ error:", error);
                return session;
            }
        },
        async signIn({ user }: { user: AdapterUser | User }) {
            try {
                // get the user if they exist
                const userExists = (await getUser(user?.email as string)) as { user?: UserProfile };
                console.log("🚀 ~ file: session.ts:62 ~ signIn ~ userExists:", userExists);

                // if they don't exist, create them
                if (!userExists.user) {
                    await createUser(user.name as string, user.email as string, user.image as string);
                }
                return true;
            } catch (error: any) {
                console.log("🚀 ~ file: session.ts:33 ~ signIn ~ error:", JSON.stringify(error));
                return error;
            }
        },
    },
};

export async function getCurrentUser() {
    const session = (await getServerSession(authOptions)) as SessionInterface;
    return session;
}
