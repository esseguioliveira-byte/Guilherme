'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { emailService } from '@/lib/email';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const data = Object.fromEntries(formData.entries());
    await signIn('credentials', { ...data, redirectTo: '/' });


  } catch (error: any) {
    // Se for o erro interno de redirect do Next.js, nós re-lançamos para o redirecionamento funcionar
    if (error && typeof error === 'object' && 'digest' in error && typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    
    // Se for erro de credencial do NextAuth
    if (error?.type === 'CredentialsSignin' || error?.message?.includes('CredentialsSignin') || error?.name === 'CredentialsSignin') {
      return 'E-mail ou senha incorretos.';
    }

    // Retorna a mensagem de erro genérica para debugar na tela
    return `Erro no Login: ${error?.message || 'Falha na autenticação'}`;
  }
}

export async function signInWithGoogle() {
  try {
    await signIn('google', { redirectTo: '/' });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error && typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('Google Sign In Error:', error);
    throw error;
  }
}

export async function signInWithDiscord() {
  try {
    await signIn('discord', { redirectTo: '/' });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error && typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('Discord Sign In Error:', error);
    throw error;
  }
}



export async function registerUser(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password || password.length < 6) {
      return 'Dados inválidos. A senha deve ter no mínimo 6 caracteres.';
    }

    // Verifica se usuário já existe
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return 'E-mail já está em uso.';
    }

    const hashedPassword = await hash(password, 10);
    const userId = crypto.randomUUID();

    // Lógica de Afiliado (Referral)
    const refCode = (await cookies()).get('affiliate_ref')?.value;
    let referredBy = null;

    if (refCode) {
      const affiliate = await db.select({ id: users.id }).from(users).where(eq(users.affiliateCode, refCode)).then(res => res[0]);
      if (affiliate && affiliate.id !== userId) {
        referredBy = affiliate.id;
      }
    }

    await db.insert(users).values({
      id: userId,
      name,
      email,
      password: hashedPassword,
      referredBy,
    });

    // ── Email: Boas-vindas (non-blocking) ───────────────────────────────
    emailService.sendEmail({
      to: email,
      template: 'welcome',
      data: { name },
    }).catch(err => console.error('[Auth] Welcome email error:', err?.message));

    // Faz o login automático após o cadastro
    const data = Object.fromEntries(formData.entries());
    await signIn('credentials', { ...data, redirectTo: '/' });

  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error && typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    
    if (error?.type === 'CredentialsSignin' || error?.message?.includes('CredentialsSignin')) {
      return 'Erro ao autenticar automaticamente após cadastro.';
    }
    
    return `Ocorreu um erro inesperado: ${error?.message || 'Falha ao registrar'}`;
  }
}
