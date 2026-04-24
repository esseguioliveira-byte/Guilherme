import { db } from '@/db';
import { paymentSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { CreditCard, Shield, Zap, Globe } from 'lucide-react';
import StylepaySettingsForm from '@/components/admin/StylepaySettingsForm';

export default async function AdminPaymentsPage() {
  const [settings] = await db
    .select()
    .from(paymentSettings)
    .where(eq(paymentSettings.provider, 'stylepay'))
    .limit(1)
    .catch(() => [null]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-white uppercase italic tracking-tight nasa-title">
          Métodos de Pagamento
        </h1>
        <p className="text-gray-500 mt-1">Gerencie suas integrações de gateway de pagamento.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-[32px] p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <img
                  src="https://uploads.stylepay.com.br/logo/logow.png"
                  alt="Stylepay"
                  className="w-7 h-7 object-contain opacity-90"
                />
              </div>
              <div>
                <h2 className="text-white font-black text-lg">StylePay</h2>
                <p className="text-xs text-gray-500">Gateway de Pagamento — Pix &amp; Recorrência</p>
              </div>
              <div className="ml-auto">
                <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full bg-primary/10 text-primary border border-primary/20">
                  Integrado
                </span>
              </div>
            </div>

            <StylepaySettingsForm
              initialSettings={settings ? {
                clientId: settings.clientId,
                clientSecret: settings.clientSecret,
                webhookSecret: settings.webhookSecret,
                environment: settings.environment,
                isActive: settings.isActive,
              } : null}
            />
          </div>

          {/* Webhook endpoint info */}
          <div className="bg-[#0A0A0A] border border-[#222] rounded-[32px] p-8">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-primary" />
              Endpoint de Webhook
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Configure este URL no painel da Stylepay para receber notificações de pagamento automáticas.
            </p>
            <div className="bg-[#111] border border-[#333] rounded-xl px-4 py-3 font-mono text-sm text-primary select-all">
              /api/webhooks/stylepay
            </div>
            <p className="text-[10px] text-gray-600 mt-2">
              A Stylepay enviará um POST para este endpoint a cada evento de pagamento (pago, cancelado, expirado).
            </p>
          </div>
        </div>

        {/* Info & Tips sidebar */}
        <div className="space-y-5">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-[32px] p-6">
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Como obter as credenciais</h3>
            <ol className="space-y-3 text-sm text-gray-400">
              <li className="flex gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-black shrink-0 mt-0.5">1</span>
                Acesse o painel da Stylepay em <a href="https://stylepay.com.br" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">stylepay.com.br</a>
              </li>
              <li className="flex gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-black shrink-0 mt-0.5">2</span>
                Vá em <strong className="text-white">Configurações → API</strong>
              </li>
              <li className="flex gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-black shrink-0 mt-0.5">3</span>
                Copie o <strong className="text-white">Client ID</strong> e o <strong className="text-white">Client Secret</strong>
              </li>
              <li className="flex gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-black shrink-0 mt-0.5">4</span>
                Cole as credenciais no formulário ao lado e salve
              </li>
            </ol>
          </div>

          <div className="bg-[#0A0A0A] border border-[#222] rounded-[32px] p-6 space-y-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest">Recursos Suportados</h3>
            {[
              { icon: Zap, label: 'Pix Instantâneo', desc: 'Geração de QR Code automática' },
              { icon: Shield, label: 'Webhook Seguro', desc: 'Confirmação via assinatura HMAC' },
              { icon: CreditCard, label: 'Cobrança Recorrente', desc: 'Assinaturas e planos mensais' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#111] border border-[#222] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">{label}</p>
                  <p className="text-gray-500 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
