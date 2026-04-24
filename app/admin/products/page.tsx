import { db } from '@/db';
import { products, categories } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

import ProductsTable from '@/components/ProductsTable';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const productList = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      category: categories.name, // Use the actual name from categories table
      categoryId: products.categoryId,
      stock: products.stock,
      imageUrl: products.imageUrl,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt));

  const categoryList = await db.select().from(categories).orderBy(desc(categories.name));

  return <ProductsTable initialProducts={productList as any} categories={categoryList} />;
}


