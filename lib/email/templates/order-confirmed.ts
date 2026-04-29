/**
 * Order confirmed email — sent when payment is approved via Stylepay webhook.
 */
export function orderConfirmedTemplate(data: {
  orderId: string;
  userName: string;
  totalAmount: string;
  items: Array<{ name: string; quantity: number; price: string }>;
  appUrl?: string;
}) {
  const { orderId, userName, totalAmount, items, appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000' } = data;
  const shortId = orderId.slice(0, 8).toUpperCase();
  const subject = `✅ Pedido #${shortId} confirmado — Bahia Store`;

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding:12px 0;color:#e2e8f0;font-size:14px;border-bottom:1px solid #1e1e3f;">${item.name}</td>
      <td style="padding:12px 0;color:#94a3b8;font-size:14px;border-bottom:1px solid #1e1e3f;text-align:center;">${item.quantity}x</td>
      <td style="padding:12px 0;color:#a855f7;font-size:14px;border-bottom:1px solid #1e1e3f;text-align:right;font-weight:600;">R$ ${item.price}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#0a0a1a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a1a;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#065f46,#10b981);padding:40px 32px;border-radius:16px 16px 0 0;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">✅</div>
            <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;">Pagamento Confirmado!</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Pedido #${shortId}</p>
          </td>
        </tr>
        <tr>
          <td style="background:#12122a;padding:40px 32px;border-radius:0 0 16px 16px;">
            <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.6;">
              Olá, <strong style="color:#e2e8f0;">${userName}</strong>! Seu pagamento foi confirmado e seus produtos já estão disponíveis na sua conta.
            </p>
            <!-- Items -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <th style="text-align:left;color:#a855f7;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;padding-bottom:12px;border-bottom:2px solid #1e1e3f;">Produto</th>
                <th style="text-align:center;color:#a855f7;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;padding-bottom:12px;border-bottom:2px solid #1e1e3f;">Qtd</th>
                <th style="text-align:right;color:#a855f7;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;padding-bottom:12px;border-bottom:2px solid #1e1e3f;">Preço</th>
              </tr>
              ${itemsHtml}
              <tr>
                <td colspan="2" style="padding:16px 0 0;color:#94a3b8;font-size:14px;font-weight:600;">Total Pago</td>
                <td style="padding:16px 0 0;color:#10b981;font-size:18px;font-weight:800;text-align:right;">R$ ${totalAmount}</td>
              </tr>
            </table>
            <div style="text-align:center;margin-bottom:32px;">
              <a href="${appUrl}/profile" style="display:inline-block;background:linear-gradient(135deg,#065f46,#10b981);color:#fff;text-decoration:none;padding:14px 36px;border-radius:100px;font-size:15px;font-weight:700;">
                Ver Meus Pedidos →
              </a>
            </div>
            <div style="background:#1e1e3f;border-radius:12px;padding:20px;margin-bottom:24px;">
              <p style="margin:0;color:#94a3b8;font-size:13px;text-align:center;line-height:1.6;">
                ⚡ Seus produtos digitais já estão disponíveis.<br>
                Acesse <strong style="color:#a855f7;">Minha Conta → Pedidos</strong> para visualizar.
              </p>
            </div>
            <hr style="border:none;border-top:1px solid #1e1e3f;margin:0 0 24px;">
            <p style="margin:0;color:#475569;font-size:12px;text-align:center;">Bahia Store — Produtos Digitais Premium</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Pedido #${shortId} confirmado!\n\nOlá ${userName}, seu pagamento de R$ ${totalAmount} foi confirmado.\n\nAcesse seus produtos em: ${appUrl}/profile\n\nBahia Store`;

  return { subject, html, text };
}
