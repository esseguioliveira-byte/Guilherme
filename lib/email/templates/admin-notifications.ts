/** Admin: new order notification email */
export function adminNewOrderTemplate(data: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: string;
  items: Array<{ name: string; quantity: number; price: string }>;
  appUrl?: string;
}) {
  const { orderId, customerName, customerEmail, totalAmount, items, appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000' } = data;
  const shortId = orderId.slice(0, 8).toUpperCase();
  const subject = `🛍️ Novo pedido #${shortId} — R$ ${totalAmount}`;

  const itemsHtml = items.map(item =>
    `<tr><td style="padding:8px 0;color:#e2e8f0;font-size:13px;border-bottom:1px solid #1e1e3f;">${item.name}</td><td style="padding:8px 0;color:#94a3b8;text-align:center;border-bottom:1px solid #1e1e3f;">${item.quantity}x</td><td style="padding:8px 0;color:#a855f7;text-align:right;font-weight:600;border-bottom:1px solid #1e1e3f;">R$ ${item.price}</td></tr>`
  ).join('');

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#0a0a1a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a1a;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#312e81,#6c3ef2);padding:40px 32px;border-radius:16px 16px 0 0;text-align:center;">
            <div style="font-size:36px;margin-bottom:8px;">🛍️</div>
            <h1 style="margin:0;color:#fff;font-size:20px;font-weight:800;">Novo Pedido Recebido</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:24px;font-weight:800;">R$ ${totalAmount}</p>
          </td>
        </tr>
        <tr>
          <td style="background:#12122a;padding:32px;border-radius:0 0 16px 16px;">
            <div style="background:#1e1e3f;border-radius:12px;padding:20px;margin-bottom:20px;">
              <p style="margin:0 0 8px;color:#a855f7;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Cliente</p>
              <p style="margin:0;color:#e2e8f0;font-size:15px;font-weight:600;">${customerName}</p>
              <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">${customerEmail}</p>
            </div>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <th style="text-align:left;color:#a855f7;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;">Produto</th>
                <th style="text-align:center;color:#a855f7;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;">Qtd</th>
                <th style="text-align:right;color:#a855f7;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;">Preço</th>
              </tr>
              ${itemsHtml}
            </table>
            <div style="text-align:center;">
              <a href="${appUrl}/admin" style="display:inline-block;background:linear-gradient(135deg,#312e81,#6c3ef2);color:#fff;text-decoration:none;padding:12px 28px;border-radius:100px;font-size:14px;font-weight:700;">Ver no Painel Admin →</a>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Novo pedido #${shortId} de ${customerName} (${customerEmail}) — R$ ${totalAmount}\n\nVer: ${appUrl}/admin`;
  return { subject, html, text };
}

/** Admin: new withdrawal request notification */
export function adminWithdrawalRequestTemplate(data: {
  affiliateName: string;
  affiliateEmail: string;
  amount: string;
  pixKey: string;
  pixKeyType: string;
  requestId: string;
  appUrl?: string;
}) {
  const { affiliateName, affiliateEmail, amount, pixKey, pixKeyType, requestId, appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000' } = data;
  const shortId = requestId.slice(0, 8).toUpperCase();
  const subject = `🏦 Novo saque solicitado — R$ ${amount} por ${affiliateName}`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#0a0a1a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a1a;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a5f,#3b82f6);padding:32px;border-radius:16px 16px 0 0;text-align:center;">
            <div style="font-size:36px;margin-bottom:8px;">🏦</div>
            <h1 style="margin:0;color:#fff;font-size:20px;font-weight:800;">Solicitação de Saque</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:24px;font-weight:800;">R$ ${amount}</p>
          </td>
        </tr>
        <tr>
          <td style="background:#12122a;padding:32px;border-radius:0 0 16px 16px;">
            <div style="background:#1e1e3f;border-radius:12px;padding:20px;margin-bottom:20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="color:#94a3b8;font-size:13px;padding-bottom:8px;">Afiliado</td><td style="color:#e2e8f0;text-align:right;font-size:13px;padding-bottom:8px;">${affiliateName}</td></tr>
                <tr><td style="color:#94a3b8;font-size:13px;padding-bottom:8px;border-top:1px solid #2d2d5e;padding-top:8px;">Email</td><td style="color:#e2e8f0;text-align:right;font-size:13px;border-top:1px solid #2d2d5e;padding-top:8px;">${affiliateEmail}</td></tr>
                <tr><td style="color:#94a3b8;font-size:13px;padding-top:8px;border-top:1px solid #2d2d5e;">Chave PIX (${pixKeyType})</td><td style="color:#3b82f6;text-align:right;font-size:13px;font-weight:600;padding-top:8px;border-top:1px solid #2d2d5e;">${pixKey}</td></tr>
              </table>
            </div>
            <div style="text-align:center;">
              <a href="${appUrl}/admin/withdrawals" style="display:inline-block;background:linear-gradient(135deg,#1e3a5f,#3b82f6);color:#fff;text-decoration:none;padding:12px 28px;border-radius:100px;font-size:14px;font-weight:700;">Revisar no Painel Admin →</a>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Novo saque solicitado:\n${affiliateName} (${affiliateEmail}) pediu R$ ${amount} via PIX (${pixKeyType}): ${pixKey}\n\nRevisar: ${appUrl}/admin/withdrawals`;
  return { subject, html, text };
}
