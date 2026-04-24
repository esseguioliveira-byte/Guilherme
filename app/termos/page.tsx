import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldAlert } from 'lucide-react';

export default function TermosPage() {
  return (
    <main className="min-h-screen pt-24 flex flex-col items-center">
      <Navbar />
      
      <section className="w-full max-w-4xl mx-auto px-4 py-12 flex-grow animate-in fade-in duration-500">
        <div className="bg-[#0A0A0A] border border-[#222] rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col items-center justify-center mb-12 text-center relative z-10">
            <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mb-6 text-primary shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-widest nasa-title">
              Termos e Condições da Compra
            </h1>
          </div>

          <div className="space-y-8 text-gray-300 leading-relaxed relative z-10">
            <div className="group bg-[#111]/50 p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-all">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 bg-primary/20 text-primary rounded-lg font-black text-sm">1</span> 
                Uso de Serviços Compartilhados
              </h3>
              <p className="text-sm pl-11 text-gray-400 group-hover:text-gray-300 transition-colors">
                Ao adquirir uma assinatura compartilhada, você está ciente de que a conta será utilizada por outras pessoas além de você. Isso pode resultar em limitações de acesso ou de número de telas disponíveis.
              </p>
            </div>

            <div className="group bg-[#111]/50 p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-all">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 bg-primary/20 text-primary rounded-lg font-black text-sm">2</span> 
                Conduta e Suspensão
              </h3>
              <p className="text-sm pl-11 text-gray-400 group-hover:text-gray-300 transition-colors">
                Ao efetuar a compra, você concorda que qualquer uso indevido dos serviços ou produtos da loja poderá resultar na suspensão de sua conta, sem possibilidade de reembolso ou recurso.
              </p>
            </div>

            <div className="group bg-[#111]/50 p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-all">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 bg-primary/20 text-primary rounded-lg font-black text-sm">3</span> 
                Política de Reembolso
              </h3>
              <p className="text-sm pl-11 text-gray-400 group-hover:text-gray-300 transition-colors">
                Em caso de insatisfação com o serviço adquirido, você está ciente de que não fazemos devolução após a compra.
              </p>
            </div>

            <div className="group bg-[#111]/50 p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-all">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 bg-primary/20 text-primary rounded-lg font-black text-sm">4</span> 
                Erro de Compra
              </h3>
              <p className="text-sm pl-11 text-gray-400 group-hover:text-gray-300 transition-colors">
                Todos os serviços estão devidamente categorizados e descritos. Em caso de erro na compra por parte do cliente, não será realizada troca do serviço.
              </p>
            </div>

            <div className="group bg-[#111]/50 p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-all">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 bg-primary/20 text-primary rounded-lg font-black text-sm">5</span> 
                Suporte e Garantia
              </h3>
              <p className="text-sm pl-11 text-gray-400 group-hover:text-gray-300 transition-colors">
                Você tem direito a suporte técnico durante o período de garantia especificado na descrição do serviço/assinatura adquirido. Após o término desse período, o suporte será encerrado.
              </p>
            </div>

            <div className="group bg-[#111]/50 p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-all">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 bg-primary/20 text-primary rounded-lg font-black text-sm">6</span> 
                Responsabilidade de Contatar o Suporte
              </h3>
              <p className="text-sm pl-11 text-gray-400 group-hover:text-gray-300 transition-colors">
                Em caso de problemas com sua conta ou serviço, é sua responsabilidade entrar em contato com o suporte para obter esclarecimentos ou solicitar trocas.
              </p>
            </div>

            <div className="group bg-[#111]/50 p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-all">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 bg-primary/20 text-primary rounded-lg font-black text-sm">7</span> 
                Vencimento de Garantia e Não Uso
              </h3>
              <p className="text-sm pl-11 text-gray-400 group-hover:text-gray-300 transition-colors">
                Se a garantia do serviço adquirido expirar, e você não tiver utilizado o serviço, a loja não tem obrigação de prorrogar o período de garantia.
              </p>
            </div>

            <div className="mt-12 p-6 bg-primary/10 border border-primary/30 rounded-2xl text-center shadow-[0_0_30px_rgba(59,130,246,0.1)]">
              <p className="text-primary font-bold italic tracking-wide">
                Ao concluir sua compra, você confirma que leu, entendeu e concorda com todos os termos acima.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
