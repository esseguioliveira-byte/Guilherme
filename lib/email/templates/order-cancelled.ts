/** Order cancelled email */
export function orderCancelledTemplate(data: {
  orderId: string;
  userName: string;
  totalAmount: string;
  appUrl?: string;
}) {
  const { orderId, userName, totalAmount, appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000' } = data;
  const shortId = orderId.slice(0, 8).toUpperCase();
  const subject = `❌ Pedido #${shortId} cancelado — Bahia Store`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#0a0a1a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a1a;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#7f1d1d,#ef4444);padding:40px 32px;border-radius:16px 16px 0 0;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">❌</div>
            <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;">Pedido Cancelado</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Pedido #${shortId} · R$ ${totalAmount}</p>
          </td>
        </tr>
        <tr>
          <td style="background:#12122a;padding:40px 32px;border-radius:0 0 16px 16px;">
            <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.6;">
              Olá, <strong style="color:#e2e8f0;">${userName}</strong>! Infelizmente seu pedido <strong>#${shortId}</strong> foi cancelado. Nenhuma cobrança foi realizada.
            </p>
            <div style="background:#1e1e3f;border-radius:12px;padding:20px;margin-bottom:32px;">
              <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6;">
                ℹ️ Se você acredita que isso é um erro, entre em contato conosco pelo site.
              </p>
            </div>
            <div style="text-align:center;margin-bottom:32px;">
              <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#6c3ef2,#a855f7);color:#fff;text-decoration:none;padding:14px 36px;border-radius:100px;font-size:15px;font-weight:700;">
                Explorar Produtos →
              </a>
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

  const text = `Pedido #${shortId} cancelado.\n\nOlá ${userName}, seu pedido foi cancelado. Nenhuma cobrança foi realizada.\n\nBahia Store`;
  return { subject, html, text };
}
