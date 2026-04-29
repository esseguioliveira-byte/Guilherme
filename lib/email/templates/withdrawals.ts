/** Withdrawal request submitted email */
export function withdrawalSubmittedTemplate(data: {
  affiliateName: string;
  amount: string;
  pixKey: string;
  pixKeyType: string;
  requestId: string;
  appUrl?: string;
}) {
  const { affiliateName, amount, pixKey, pixKeyType, requestId, appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000' } = data;
  const shortId = requestId.slice(0, 8).toUpperCase();
  const subject = `🏦 Saque de R$ ${amount} solicitado — Bahia Store`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#0a0a1a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a1a;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a5f,#3b82f6);padding:40px 32px;border-radius:16px 16px 0 0;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">🏦</div>
            <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;">Saque Solicitado</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Solicitação #${shortId}</p>
          </td>
        </tr>
        <tr>
          <td style="background:#12122a;padding:40px 32px;border-radius:0 0 16px 16px;">
            <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.6;">
              Olá, <strong style="color:#e2e8f0;">${affiliateName}</strong>! Sua solicitação de saque foi recebida e está sendo analisada pelo nosso time.
            </p>
            <div style="background:#1e1e3f;border-radius:12px;padding:24px;margin-bottom:32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#94a3b8;font-size:13px;padding-bottom:10px;">Valor solicitado</td>
                  <td style="color:#3b82f6;font-size:18px;font-weight:800;text-align:right;padding-bottom:10px;">R$ ${amount}</td>
                </tr>
                <tr>
                  <td style="color:#94a3b8;font-size:13px;padding-bottom:10px;border-top:1px solid #2d2d5e;padding-top:10px;">Chave PIX</td>
                  <td style="color:#e2e8f0;font-size:13px;text-align:right;border-top:1px solid #2d2d5e;padding-top:10px;">${pixKey}</td>
                </tr>
                <tr>
                  <td style="color:#94a3b8;font-size:13px;border-top:1px solid #2d2d5e;padding-top:10px;">Tipo</td>
                  <td style="color:#e2e8f0;font-size:13px;text-align:right;border-top:1px solid #2d2d5e;padding-top:10px;">${pixKeyType}</td>
                </tr>
              </table>
            </div>
            <div style="background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);border-radius:12px;padding:16px;margin-bottom:32px;">
              <p style="margin:0;color:#93c5fd;font-size:13px;text-align:center;">⏳ O prazo de análise é de até 3 dias úteis.</p>
            </div>
            <div style="text-align:center;">
              <a href="${appUrl}/affiliates" style="display:inline-block;background:linear-gradient(135deg,#1e3a5f,#3b82f6);color:#fff;text-decoration:none;padding:14px 36px;border-radius:100px;font-size:15px;font-weight:700;">
                Ver Painel de Afiliado →
              </a>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Saque de R$ ${amount} solicitado!\n\nOlá ${affiliateName}, sua solicitação #${shortId} está sendo analisada.\nChave PIX: ${pixKey} (${pixKeyType})\n\nPrazo: até 3 dias úteis.`;
  return { subject, html, text };
}

/** Withdrawal approved email */
export function withdrawalApprovedTemplate(data: {
  affiliateName: string;
  amount: string;
  pixKey: string;
  requestId: string;
  adminNote?: string;
  appUrl?: string;
}) {
  const { affiliateName, amount, pixKey, requestId, adminNote, appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000' } = data;
  const shortId = requestId.slice(0, 8).toUpperCase();
  const subject = `✅ Saque de R$ ${amount} APROVADO — Bahia Store`;

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
            <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;">Saque Aprovado!</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:28px;font-weight:800;">R$ ${amount}</p>
          </td>
        </tr>
        <tr>
          <td style="background:#12122a;padding:40px 32px;border-radius:0 0 16px 16px;">
            <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.6;">
              Ótimas notícias, <strong style="color:#e2e8f0;">${affiliateName}</strong>! Seu saque foi <strong style="color:#10b981;">APROVADO</strong> e o PIX está sendo processado para a chave: <strong style="color:#e2e8f0;">${pixKey}</strong>.
            </p>
            ${adminNote ? `<div style="background:#1e1e3f;border-radius:12px;padding:20px;margin-bottom:24px;"><p style="margin:0;color:#94a3b8;font-size:13px;">💬 Nota do admin: <em>${adminNote}</em></p></div>` : ''}
            <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:12px;padding:16px;margin-bottom:32px;">
              <p style="margin:0;color:#6ee7b7;font-size:13px;text-align:center;">⚡ O PIX pode levar até 30 minutos para chegar.</p>
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

  const text = `Saque de R$ ${amount} APROVADO!\n\nOlá ${affiliateName}, seu saque foi aprovado. PIX enviado para: ${pixKey}.`;
  return { subject, html, text };
}

/** Withdrawal rejected email */
export function withdrawalRejectedTemplate(data: {
  affiliateName: string;
  amount: string;
  requestId: string;
  adminNote?: string;
  appUrl?: string;
}) {
  const { affiliateName, amount, requestId, adminNote, appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000' } = data;
  const shortId = requestId.slice(0, 8).toUpperCase();
  const subject = `❌ Saque de R$ ${amount} recusado — Bahia Store`;

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
            <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;">Saque Recusado</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Solicitação #${shortId} · R$ ${amount}</p>
          </td>
        </tr>
        <tr>
          <td style="background:#12122a;padding:40px 32px;border-radius:0 0 16px 16px;">
            <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.6;">
              Olá, <strong style="color:#e2e8f0;">${affiliateName}</strong>. Infelizmente sua solicitação de saque de <strong>R$ ${amount}</strong> foi recusada.
            </p>
            ${adminNote ? `<div style="background:#1e1e3f;border-radius:12px;padding:20px;margin-bottom:24px;"><p style="margin:0;color:#94a3b8;font-size:13px;">💬 Motivo: <em style="color:#fca5a5;">${adminNote}</em></p></div>` : ''}
            <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:12px;padding:16px;margin-bottom:32px;">
              <p style="margin:0;color:#fca5a5;font-size:13px;text-align:center;">O saldo foi restaurado à sua conta. Você pode fazer uma nova solicitação.</p>
            </div>
            <div style="text-align:center;">
              <a href="${appUrl}/affiliates" style="display:inline-block;background:linear-gradient(135deg,#6c3ef2,#a855f7);color:#fff;text-decoration:none;padding:14px 36px;border-radius:100px;font-size:15px;font-weight:700;">
                Ver Painel de Afiliado →
              </a>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Saque recusado.\n\nOlá ${affiliateName}, sua solicitação de saque de R$ ${amount} foi recusada. ${adminNote ? `Motivo: ${adminNote}` : ''}\n\nSeu saldo foi restaurado.`;
  return { subject, html, text };
}
