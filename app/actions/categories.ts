'use server';

import { db } from '@/db';
import { categories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';

export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string;
  const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

  if (!name) return { error: 'Nome é obrigatório' };

  try {
    await db.insert(categories).values({
      id: randomUUID(),
      name,
      slug,
    });
    revalidatePath('/admin/categories');
    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    return { error: 'Erro ao criar categoria: ' + e.message };
  }
}

export async function deleteCategory(id: string) {
  try {
    await db.delete(categories).where(eq(categories.id, id));
    revalidatePath('/admin/categories');
    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    return { error: 'Erro ao deletar categoria: ' + e.message };
  }
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

  if (!name) return { error: 'Nome é obrigatório' };

  try {
    await db.update(categories).set({
      name,
      slug,
    }).where(eq(categories.id, id));
    revalidatePath('/admin/categories');
    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    return { error: 'Erro ao atualizar categoria: ' + e.message };
  }
}
