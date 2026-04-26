import ProductCard from './ProductCard';
import { db } from '@/db';
import { products, categories as categoriesTable } from '@/db/schema';
import { desc, isNull, isNotNull } from 'drizzle-orm';
import Link from 'next/link';

export default async function ProductGrid({ currentCategory }: { currentCategory?: string }) {
  const dbCategories = await db.select().from(categoriesTable).orderBy(desc(categoriesTable.name));
  
  const parentProducts = await db.select()
    .from(products)
    .where(isNull(products.parentId))
    .orderBy(desc(products.createdAt));

  const allSubProducts = await db.select().from(products).where(isNotNull(products.parentId));
  
  const processedProducts = parentProducts.map(parent => {
    const children = allSubProducts.filter(p => p.parentId === parent.id);
    const family = [parent, ...children];
    
    const inStockItems = family.filter(p => p.stock > 0);
    let cheapestItem;
    let totalStock = family.reduce((acc, p) => acc + p.stock, 0);

    if (inStockItems.length > 0) {
      cheapestItem = inStockItems.reduce((min, p) => Number(p.price) < Number(min.price) ? p : min, inStockItems[0]);
    } else {
      cheapestItem = family.reduce((min, p) => Number(p.price) < Number(min.price) ? p : min, family[0]);
    }

    return {
      ...parent,
      price: cheapestItem.price,
      stock: totalStock,
      hasSubProducts: children.length > 0,
    };
  });

  // Group products
  const groups: { id: string, name: string, slug: string, products: typeof processedProducts }[] = [];
  
  // First, map valid categories
  for (const cat of dbCategories) {
    const catProducts = processedProducts.filter(p => p.categoryId === cat.id || p.category === cat.name);
    if (catProducts.length > 0) {
      groups.push({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        products: catProducts
      });
    }
  }

  // Then, find products that didn't match any category
  const categorizedProductIds = new Set(groups.flatMap(g => g.products.map(p => p.id)));
  const uncategorizedProducts = processedProducts.filter(p => !categorizedProductIds.has(p.id));
  
  if (uncategorizedProducts.length > 0) {
    groups.push({
      id: 'outros',
      name: 'Outros',
      slug: 'outros',
      products: uncategorizedProducts
    });
  }

  // Apply current filter
  const activeGroups = currentCategory && currentCategory !== 'all' 
    ? groups.filter(g => g.slug === currentCategory)
    : groups;

  return (
    <div className="w-full flex flex-col gap-8 sm:gap-16 pb-24" id="produtos">

      {activeGroups.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          Nenhum produto cadastrado no banco de dados para esta categoria.
        </div>
      ) : (
        activeGroups.map((group) => (
          <section key={group.id} className="max-w-7xl mx-auto px-4 w-full scroll-mt-32" id={`cat-${group.slug}`}>
            <h3 className="text-2xl font-black mb-8 text-white uppercase italic tracking-widest flex items-center gap-4">
              {group.name}
              <div className="h-[1px] flex-grow bg-gradient-to-r from-white/10 to-transparent" />
            </h3>
            <div data-stagger className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {group.products.map((product) => (
                <div key={product.id} data-scroll="up">
                  <ProductCard product={product as any} />
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
