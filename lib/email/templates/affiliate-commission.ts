/** Affiliate commission earned email */
export function affiliateCommissionTemplate(data: {
  affiliateName: string;
  commissionAmount: string;
  orderId: string;
  balance: string;
  appUrl?: string;
}) {
  const { affiliateName, commissionAmount, orderId, balance, appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000' } = data;
  const shortId = orderId.slice(0, 8).toUpperCase();
  const subject = `💰 Nova comissão de R$ ${commissionAmount} — Bahia Store`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#0a0a1a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a1a;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#92400e,#f59e0b);padding:40px 32px;border-radius:16px 16px 0 0;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">💰</div>
            <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;">Nova Comissão!</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:28px;font-weight:800;">R$ ${commissionAmount}</p>
          </td>
        </tr>
        <tr>
          <td style="background:#12122a;padding:40px 32px;border-radius:0 0 16px 16px;">
            <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.6;">
              Parabéns, <strong style="color:#e2e8f0;">${affiliateName}</strong>! Uma venda foi realizada através do seu link de afiliado (pedido #${shortId}) e você ganhou uma comissão!
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td style="background:#1e1e3f;border-radius:12px;padding:24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="color:#94a3b8;font-size:13px;padding-bottom:12px;">Comissão desta venda</td>
                      <td style="color:#f59e0b;font-size:18px;font-weight:800;text-align:right;padding-bottom:12px;">+ R$ ${commissionAmount}</td>
                    </tr>
                    <tr>
                      <td style="color:#94a3b8;font-size:13px;border-top:1px solid #2d2d5e;padding-top:12px;">Saldo total disponível</td>
                      <td style="color:#10b981;font-size:18px;font-weight:800;text-align:right;border-top:1px solid #2d2d5e;padding-top:12px;">R$ ${balance}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <div style="text-align:center;margin-bottom:32px;">
              <a href="${appUrl}/affiliates" style="display:inline-block;background:linear-gradient(135deg,#92400e,#f59e0b);color:#fff;text-decoration:none;padding:14px 36px;border-radius:100px;font-size:15px;font-weight:700;">
                Ver Meu Painel de Afiliado →
              </a>
            </div>
            <hr style="border:none;border-top:1px solid #1e1e3f;margin:0 0 24px;">
            <p style="margin:0;color:#475569;font-size:12px;text-align:center;">Bahia Store — Programa de Afiliados</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Nova comissão de R$ ${commissionAmount}!\n\nOlá ${affiliateName}, você ganhou uma comissão da venda #${shortId}.\nSaldo total: R$ ${balance}\n\nAcesse: ${appUrl}/affiliates`;
  return { subject, html, text };
}
