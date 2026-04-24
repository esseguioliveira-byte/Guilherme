import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Discord from 'next-auth/providers/discord';
import { db } from '@/db';
import { users, accounts, sessions, verificationTokens } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { cookies } from 'next/headers';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  trustHost: true,
  debug: true,

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Discord({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: 'E-mail e Senha',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@digistore.com" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          const userList = await db.select().from(users).where(eq(users.email, email));
          const user = userList[0];
          
          if (!user || !user.password) return null;
          
          const passwordsMatch = await compare(password, user.password);
          if (passwordsMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }

        }
        return null;
      },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' || account?.provider === 'discord') {
        return true;
      }
      return true;
    },
  },

  events: {
    async createUser({ user }) {
      // Lógica de Afiliado para usuários que se cadastram via OAuth
      try {
        const cookieStore = await cookies();
        const refCode = cookieStore.get('affiliate_ref')?.value;
        
        if (refCode && user.id) {
          const affiliate = await db.select({ id: users.id })
            .from(users)
            .where(eq(users.affiliateCode, refCode))
            .then(res => res[0]);

          if (affiliate && affiliate.id !== user.id) {
            await db.update(users)
              .set({ referredBy: affiliate.id })
              .where(eq(users.id, user.id));
            
            console.log(`User ${user.id} referred by ${affiliate.id} via OAuth`);
          }
        }
      } catch (error) {
        console.error('Error handling affiliate referral in createUser event:', error);
      }
    },
  },
});

