import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdmin = (auth?.user as any)?.role === 'ADMIN';
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnProfile = nextUrl.pathname.startsWith('/profile');
      
      if (isOnAdmin) {
        if (isLoggedIn && isAdmin) return true;
        if (isLoggedIn) return Response.redirect(new URL('/', nextUrl)); // Redirect to home if not admin
        return false;
      }

      if (isOnProfile) {
        if (isLoggedIn) return true;
        return false;
      }
      return true;
    },
    async session({ session, token }) {
      if (token?.sub && session.user) {
        session.user.id = token.sub;
        (session.user as any).role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    }


  },
  providers: [],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
} satisfies NextAuthConfig;
