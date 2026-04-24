import Link from 'next/link';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Navbar from '@/components/Navbar';
import PixPaymentPanel from '@/components/PixPaymentPanel';

export default async function OrderDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const orderId = resolvedParams.id;

  // Try to load order from DB for the most up-to-date state
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1).catch(() => [null]);

  // Prefer DB-stored values, fall back to URL params (for immediate display after checkout)
  const pixCode = order?.pixCode
    ?? (typeof resolvedSearchParams.pixCode === 'string' ? resolvedSearchParams.pixCode : null);
  const pixQrcodeImage = order?.pixQrcodeImage
    ?? (typeof resolvedSearchParams.pixQrcodeImage === 'string' ? resolvedSearchParams.pixQrcodeImage : null);
  const totalAmount = order ? Number(order.totalAmount) : null;
  const orderStatus = order?.status ?? 'PENDING';

  // Calculate remaining time based on URL timestamp (precise) or DB creation date
  let initialSecondsLeft = 15 * 60; // 15 mins default
  
  if (resolvedSearchParams.t && typeof resolvedSearchParams.t === 'string') {
    const elapsedSeconds = Math.floor((Date.now() - Number(resolvedSearchParams.t)) / 1000);
    initialSecondsLeft = Math.max(0, (15 * 60) - elapsedSeconds);
  } else if (order?.createdAt) {
    // Corrige o bug de fuso horário local: O MySQL local salva em UTC-3, mas o Drizzle lê como UTC-0.
    // Isso faz a data parecer 3 horas no passado.
    // Somamos o offset local (ex: 180 min) para converter para o UTC real.
    const tzOffset = new Date().getTimezoneOffset() * 60000;
    const realCreatedAtMs = order.createdAt.getTime() + tzOffset;
    
    const elapsedSeconds = Math.floor((Date.now() - realCreatedAtMs) / 1000);
    
    // Se o elapsed ainda for negativo (pode acontecer se o banco já estiver em UTC e o Node em UTC-3),
    // ignoramos. Só aplicamos se for positivo e menor que 1 dia.
    if (elapsedSeconds > 0 && elapsedSeconds < 86400) {
      initialSecondsLeft = Math.max(0, (15 * 60) - elapsedSeconds);
    } else if (elapsedSeconds < 0) {
      // Fallback extremo: se a conta deu negativo, assumimos que acabou de criar
      initialSecondsLeft = 15 * 60;
    }
  }

  return (
    <main className="min-h-screen pt-20">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <PixPaymentPanel
          orderId={orderId}
          pixCode={pixCode}
          pixQrcodeImage={pixQrcodeImage}
          totalAmount={totalAmount}
          orderStatus={orderStatus}
          initialSecondsLeft={initialSecondsLeft}
        />
      </div>
    </main>
  );
}
