import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { createSession } from "@/lib/auth";

const providers = [];
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) providers.push(Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET }));
if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) providers.push(Facebook({ clientId: process.env.FACEBOOK_CLIENT_ID, clientSecret: process.env.FACEBOOK_CLIENT_SECRET }));
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) providers.push(MicrosoftEntraID({ clientId: process.env.MICROSOFT_CLIENT_ID, clientSecret: process.env.MICROSOFT_CLIENT_SECRET, issuer: process.env.MICROSOFT_ISSUER || "https://login.microsoftonline.com/common/v2.0" }));

export const { handlers } = NextAuth({
  providers,
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "development-secret-change-me",
  trustHost: true,
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user, account }) {
      if (!user?.email) return false;
      await connectDB();
      let dbUser = await User.findOne({ email: user.email.toLowerCase() });
      if (!dbUser) {
        dbUser = await User.create({ name: user.name || user.email.split("@")[0], email: user.email.toLowerCase(), passwordHash: "", oauthProviders: account?.provider ? [account.provider] : [] });
      } else if (account?.provider && !dbUser.oauthProviders?.includes(account.provider)) {
        dbUser.oauthProviders = [...(dbUser.oauthProviders || []), account.provider];
        await dbUser.save();
      }
      await createSession(dbUser);
      return true;
    }
  }
});
export const GET = handlers.GET;
export const POST = handlers.POST;
