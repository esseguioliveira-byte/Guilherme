'use client';

import { useState, useTransition, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle, XCircle, Loader2, Wifi, WifiOff, Save, RefreshCw } from 'lucide-react';
import { savePaymentSettings, testStylepayConnection, toggleStylepayActive } from '@/app/actions/payments';

interface Settings {
  clientId: string;
  clientSecret: string;
  webhookSecret: string | null;
  environment: 'sandbox' | 'production';
  isActive: boolean;
}

export default function StylepaySettingsForm({ initialSettings }: { initialSettings: Settings | null }) {
  const [showSecret, setShowSecret] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isTesting, startTesting] = useTransition();
  const [isToggling, startToggling] = useTransition();

  const [clientId, setClientId] = useState(initialSettings?.clientId ?? '');
  const [clientSecret, setClientSecret] = useState(initialSettings?.clientSecret ?? '');
  const [webhookSecret, setWebhookSecret] = useState(initialSettings?.webhookSecret ?? '');
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>(initialSettings?.environment ?? 'production');
  const [isActive, setIsActive] = useState(initialSettings?.isActive ?? true);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    const formData = new FormData();
    formData.append('clientId', clientId);
    formData.append('clientSecret', clientSecret);
    formData.append('webhookSecret', webhookSecret);
    formData.append('environment', environment);

    startTransition(async () => {
      const res = await savePaymentSettings(formData);
      setFeedback(res.success
        ? { type: 'success', message: 'Configurações salvas com sucesso!' }
        : { type: 'error', message: res.error || 'Erro ao salvar.' }
      );
    });
  }

  function handleTest() {
    setTestResult(null);
    startTesting(async () => {
      const res = await testStylepayConnection(clientId, clientSecret, environment);
      setTestResult(res.success
        ? { type: 'success', message: res.message || 'Conexão bem-sucedida!' }
        : { type: 'error', message: res.error || 'Falha na conexão.' }
      );
    });
  }

  function handleToggle() {
    startToggling(async () => {
      const res = await toggleStylepayActive(!isActive);
      if (res.success) setIsActive(!isActive);
    });
  }

  return (
    <div className="space-y-6">
      {/* Status card */}
      <div className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
        isActive ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse' : 'bg-red-500'}`} />
          <div>
            <p className="text-white font-bold text-sm">Integração Stylepay</p>
            <p className={`text-xs mt-0.5 ${isActive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isActive ? 'Ativa — Processando pagamentos' : 'Desativada — Pagamentos suspensos'}
            </p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          disabled={isToggling || !initialSettings}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 ${
            isActive
              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
          }`}
        >
          {isToggling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isActive ? 'Desativar' : 'Ativar'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Environment */}
        <div>
          <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2 block">Ambiente</label>
          <div className="flex gap-3">
            {(['production', 'sandbox'] as const).map((env) => (
              <button
                key={env}
                type="button"
                onClick={() => setEnvironment(env)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider border transition-all ${
                  environment === env
                    ? 'bg-primary/10 border-primary/50 text-primary shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                    : 'bg-[#111] border-[#333] text-gray-500 hover:text-white hover:border-[#444]'
                }`}
              >
                {env === 'production' ? '🚀 Produção' : '🧪 Sandbox'}
              </button>
            ))}
          </div>
        </div>

        {/* Client ID */}
        <div>
          <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2 block">Client ID</label>
          <input
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Seu Client ID da Stylepay"
            className="w-full px-4 py-3 bg-[#111] border border-[#333] focus:border-primary/50 rounded-2xl text-white text-sm outline-none transition-all font-mono"
            required
          />
        </div>

        {/* Client Secret */}
        <div>
          <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2 block">Client Secret</label>
          <div className="relative">
            <input
              type={showSecret ? 'text' : 'password'}
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="Seu Client Secret da Stylepay"
              className="w-full px-4 py-3 pr-12 bg-[#111] border border-[#333] focus:border-primary/50 rounded-2xl text-white text-sm outline-none transition-all font-mono"
              required
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Webhook Secret */}
        <div>
          <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2 block">
            Webhook Secret <span className="text-gray-600 normal-case font-normal">(opcional)</span>
          </label>
          <div className="relative">
            <input
              type={showWebhook ? 'text' : 'password'}
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder="Chave para validar notificações de pagamento"
              className="w-full px-4 py-3 pr-12 bg-[#111] border border-[#333] focus:border-primary/50 rounded-2xl text-white text-sm outline-none transition-all font-mono"
            />
            <button
              type="button"
              onClick={() => setShowWebhook(!showWebhook)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              {showWebhook ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-gray-600 mt-1.5 pl-1">
            Configure o endpoint de webhook em seu painel Stylepay: <span className="text-primary font-mono">{baseUrl || 'https://sualoja.com'}/api/webhooks/stylepay</span>
          </p>
        </div>

        {/* Test result */}
        {testResult && (
          <div className={`flex items-start gap-3 p-4 rounded-2xl border text-sm ${
            testResult.type === 'success'
              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
              : 'bg-red-500/5 border-red-500/20 text-red-300'
          }`}>
            {testResult.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
            {testResult.message}
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className={`flex items-start gap-3 p-4 rounded-2xl border text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
              : 'bg-red-500/5 border-red-500/20 text-red-300'
          }`}>
            {feedback.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
            {feedback.message}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleTest}
            disabled={isTesting || !clientId || !clientSecret}
            className="flex items-center gap-2 px-5 py-3 bg-[#111] border border-[#333] hover:border-primary/40 text-gray-300 hover:text-white rounded-2xl font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-40"
          >
            {isTesting
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <RefreshCw className="w-4 h-4" />
            }
            Testar Conexão
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary hover:bg-blue-600 text-white rounded-2xl font-black uppercase italic text-sm tracking-widest transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {isPending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Save className="w-4 h-4" />
            }
            Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  );
}
