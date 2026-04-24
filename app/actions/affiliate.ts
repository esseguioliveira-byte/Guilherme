'use server';

import { auth } from '@/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function joinAffiliateProgram() {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: 'Você precisa estar logado para se tornar um afiliado.' };
  }

  try {
    // Check if already affiliate using select to be safer
    const user = await db.select({
      id: users.id,
      isAffiliate: users.isAffiliate,
      affiliateCode: users.affiliateCode
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .then(res => res[0]);

    if (user?.isAffiliate) {
      return { success: true, message: 'Você já é um afiliado!', code: user.affiliateCode };
    }

    // Generate unique code (random 8 chars)
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();

    await db.update(users)
      .set({
        isAffiliate: true,
        affiliateCode: code
      })
      .where(eq(users.id, session.user.id));

    revalidatePath('/affiliates');
    return { success: true, message: 'Parabéns! Agora você é um afiliado.', code };
  } catch (error: any) {
    console.error('Affiliate error:', error);
    if (error.message?.includes('is_affiliate')) {
      return { error: 'Erro de Banco de Dados: As colunas de afiliado ainda não foram criadas no XAMPP. Por favor, execute o comando SQL no phpMyAdmin.' };
    }
    return { error: 'Ocorreu um erro ao processar sua solicitação.' };
  }
}
