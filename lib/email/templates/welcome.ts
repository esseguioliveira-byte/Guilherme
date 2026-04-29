/**
 * Welcome email — sent when a new user registers.
 */
export function welcomeTemplate(data: { name: string; appUrl?: string }) {
  const { name, appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000' } = data;
  const subject = `Bem-vindo à Bahia Store, ${name}! 🎉`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a1a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a1a;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#6c3ef2,#a855f7);padding:40px 32px;border-radius:16px 16px 0 0;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">✨ BAHIA'S STORE</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Produtos Digitais Premium</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background:#12122a;padding:40px 32px;border-radius:0 0 16px 16px;">
            <h2 style="margin:0 0 16px;color:#e2e8f0;font-size:22px;">Olá, ${name}! 👋</h2>
            <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.6;">
              Sua conta foi criada com sucesso! Agora você tem acesso a todos os nossos
              produtos e assinaturas digitais premium.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td style="background:#1e1e3f;border-radius:12px;padding:24px;">
                  <p style="margin:0 0 12px;color:#a855f7;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">O que você pode fazer:</p>
                  <ul style="margin:0;padding-left:20px;color:#94a3b8;font-size:14px;line-height:2;">
                    <li>🛍️ Navegar pelo catálogo de produtos</li>
                    <li>⚡ Acesso instantâneo após pagamento</li>
                    <li>💰 Tornar-se afiliado e ganhar comissões</li>
                    <li>📦 Acompanhar seus pedidos em tempo real</li>
                  </ul>
                </td>
              </tr>
            </table>
            <div style="text-align:center;margin-bottom:32px;">
              <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#6c3ef2,#a855f7);color:#fff;text-decoration:none;padding:14px 36px;border-radius:100px;font-size:15px;font-weight:700;letter-spacing:0.5px;">
                Explorar Produtos →
              </a>
            </div>
            <hr style="border:none;border-top:1px solid #1e1e3f;margin:0 0 24px;">
            <p style="margin:0;color:#475569;font-size:12px;text-align:center;line-height:1.6;">
              Você recebeu este email porque criou uma conta na Bahia Store.<br>
              Se não foi você, ignore este email.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Bem-vindo à Bahia Store, ${name}!\n\nSua conta foi criada com sucesso. Acesse: ${appUrl}\n\nBahia Store — Produtos Digitais Premium`;

  return { subject, html, text };
}
