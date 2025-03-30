import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import clientPromise from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Ensure Mongoose is connected
        if (mongoose.connection.readyState === 0) {
          await mongoose.connect(process.env.MONGODB_URI, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
          });
        }

        // Optionally, wait for native MongoClient too (if needed elsewhere)
        await clientPromise;

        // Find user by username
        const user = await User.findOne({ username: credentials.username });
        if (!user) throw new Error("Invalid username or password");

        // Compare password (hashed)
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid username or password");

        return { id: user._id.toString(), username: user.username };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = { id: token.id, username: token.username };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
