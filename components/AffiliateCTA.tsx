'use client';

import { useState } from 'react';
import { joinAffiliateProgram } from '@/app/actions/affiliate';
import { Loader2, CheckCircle, Copy, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AffiliateCTA({ initialIsAffiliate, initialCode }: { initialIsAffiliate: boolean, initialCode?: string | null }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean, error?: string, message?: string, code?: string | null }>({
    success: initialIsAffiliate,
    message: initialIsAffiliate ? 'Você já é um afiliado!' : undefined,
    code: initialCode
  });
  const router = useRouter();

  const handleJoin = async () => {
    setLoading(true);
    const res = await joinAffiliateProgram();
    setResult(res);
    setLoading(false);
    
    if (res.error === 'Você precisa estar logado para se tornar um afiliado.') {
      router.push('/login');
    }
  };

  const copyToClipboard = () => {
    if (result.code) {
      navigator.clipboard.writeText(`${window.location.origin}/?ref=${result.code}`);
      alert('Link de afiliado copiado!');
    }
  };

  if (result.success) {
    return (
      <div id="affiliate-cta" className="mt-32 text-center p-12 bg-emerald-500/10 border border-emerald-500/20 rounded-[40px] animate-in zoom-in duration-300">
        <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-2 italic uppercase">Você já faz parte do time!</h2>
        <p className="text-gray-400 mb-8">Seu código de afiliado é: <span className="text-emerald-400 font-black tracking-widest">{result.code}</span></p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-2xl mx-auto">
          <button 
            onClick={copyToClipboard}
            className="w-full sm:w-auto flex-1 flex justify-center items-center gap-3 px-8 py-5 bg-emerald-500 hover:bg-emerald-600 rounded-2xl font-black text-lg sm:text-xl transition-all shadow-[0_20px_40px_rgba(16,185,129,0.3)] uppercase italic"
          >
            <Copy className="w-5 h-5 sm:w-6 sm:h-6" /> Copiar Link
          </button>
          
          <Link 
            href="/affiliates/dashboard"
            className="w-full sm:w-auto flex-1 flex justify-center items-center gap-3 px-8 py-5 bg-[#111] hover:bg-[#222] text-white border border-[#333] rounded-2xl font-black text-lg sm:text-xl transition-all uppercase italic"
          >
            <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6" /> Acessar Painel
          </Link>
        </div>
        <p className="text-gray-500 mt-6 text-sm flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Comece a divulgar e lucrar hoje mesmo.
        </p>
      </div>
    );
  }

  return (
    <div id="affiliate-cta" className="mt-32 text-center p-12 bg-primary/10 border border-primary/20 rounded-[40px]">
       <h2 className="text-3xl font-bold mb-6 italic uppercase">Pronto para começar a lucrar?</h2>
       
       {result.error && (
         <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
           {result.error}
         </div>
       )}

       <button 
         onClick={handleJoin}
         disabled={loading}
         className="px-12 py-6 bg-primary hover:bg-blue-600 disabled:bg-gray-800 disabled:opacity-50 rounded-2xl font-black text-2xl transition-all shadow-[0_20px_50px_rgba(59,130,246,0.4)] uppercase italic flex items-center gap-3 mx-auto"
       >
          {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : 'Quero ser Afiliado'}
       </button>
       
       <p className="text-gray-500 mt-6 text-sm flex items-center justify-center gap-2">
         <ShieldCheck className="w-4 h-4" /> Cadastro 100% seguro e gratuito
       </p>
    </div>
  );
}
