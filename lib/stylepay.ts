'use server';

import { db } from '@/db';
import { paymentSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface StylepayPixResult {
  payment_id: string;
  qrcode_image: string; // Base64 PNG
  qrcode: string;       // Pix Copia e Cola string
  status: string;
}

export interface StylepayPixRequest {
  amount: number;
  external_id: string;
  payer: {
    name: string;
    document: string;
    phoneNumber: string;
    email: string;
    address: {
      street: string;
      number: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
  payerQuestion: string;
  postbackUrl: string;
  products: Array<{
    name: string;
    quantity: string;
    price: number;
  }>;
}

/**
 * Loads active Stylepay credentials from the database.
 */
async function getStylepayCredentials(): Promise<{ clientId: string; clientSecret: string; environment: string } | null> {
  const [settings] = await db
    .select()
    .from(paymentSettings)
    .where(eq(paymentSettings.provider, 'stylepay'))
    .limit(1);

  if (!settings || !settings.isActive) return null;
  return {
    clientId: settings.clientId,
    clientSecret: settings.clientSecret,
    environment: settings.environment,
  };
}

/**
 * Calls the Stylepay API to generate a real PIX QR Code.
 * Uses credentials stored in the database.
 */
export async function generateStylepayPixQrCode(
  payload: StylepayPixRequest
): Promise<{ success: true; data: StylepayPixResult } | { success: false; error: string }> {
  console.log('[Stylepay API] Iniciando geração de QR Code PIX para o pedido:', payload.external_id, 'Valor:', payload.amount);
  try {
    const credentials = await getStylepayCredentials();
    if (!credentials) {
      console.error('[Stylepay API] Falha: Credenciais não encontradas ou gateway inativo no banco de dados.');
      return { success: false, error: 'Gateway de pagamento não configurado ou inativo. Configure as credenciais da Stylepay no painel admin.' };
    }

    const baseUrl = 'https://api.stylepay.com.br';
    const endpoint = `${baseUrl}/api/v1/gateway/request-qrcode`;

    console.log(`[Stylepay API] Fazendo POST para ${endpoint} com Client ID: ${credentials.clientId.substring(0, 5)}...`);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'stpi': credentials.clientId,
        'stps': credentials.clientSecret,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error(`[Stylepay] API error ${response.status}:`, responseText);
      let errorMessage = `Erro na Stylepay (${response.status})`;
      try {
        const errJson = JSON.parse(responseText);
        errorMessage = errJson.message || errJson.error || errorMessage;
      } catch {}
      return { success: false, error: errorMessage };
    }

    const rawResponse = JSON.parse(responseText);
    const data = rawResponse.data || rawResponse; // Handle both nested 'data' and flat responses

    if (!data.payment_id || !data.qrcode) {
      console.error('[Stylepay API] Resposta inválida - campos faltando:', {
        receivedFields: Object.keys(rawResponse),
        hasNestedData: !!rawResponse.data,
        fullData: rawResponse,
        status: response.status
      });
      return { success: false, error: 'Resposta inválida da Stylepay. Verifique as credenciais ou a estrutura da resposta.' };
    }

    console.log('[Stylepay API] Sucesso! Payment ID recebido:', data.payment_id);
    return { success: true, data: data as StylepayPixResult };
  } catch (e: any) {
    console.error('[Stylepay] Network error:', e.message);
    return { success: false, error: `Erro de conexão com a Stylepay: ${e.message}` };
  }
}
