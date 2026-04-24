import { DollarSign, TrendingUp, Users, Target, ShieldCheck, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import AffiliateCTA from '@/components/AffiliateCTA';
import AffiliateHeroButton from '@/components/AffiliateHeroButton';

export default async function AffiliatesPage() {
  const session = await auth();
  let isAffiliate = false;
  let affiliateCode = null;

  if (session?.user?.id) {
    try {
      const user = await db.select({
        isAffiliate: users.isAffiliate,
        affiliateCode: users.affiliateCode
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .then(res => res[0]);

      isAffiliate = user?.isAffiliate || false;
      affiliateCode = user?.affiliateCode || null;
    } catch (e) {
      console.warn("Colunas de afiliado ainda não existem no DB. Por favor, execute o SQL de atualização.");
    }
  }

  const tiers = [
    { name: "Bronze", sales: "0 - 10 vendas", commission: "5%", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    { name: "Silver", sales: "11 - 50 vendas", commission: "10%", color: "text-gray-300", bg: "bg-gray-500/10", border: "border-gray-500/20" },
    { name: "Gold", sales: "51 - 200 vendas", commission: "15%", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
    { name: "Diamond", sales: "200+ vendas", commission: "20%", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" }
  ];

  const benefits = [
    { title: "Pagamentos Instantâneos", desc: "Receba suas comissões via Pix assim que a venda for aprovada.", icon: <DollarSign className="w-6 h-6" /> },
    { title: "Alta Conversão", desc: "Produtos validados com as melhores taxas de conversão do mercado.", icon: <TrendingUp className="w-6 h-6" /> },
    { title: "Painel Exclusivo", desc: "Acompanhe seus cliques e vendas em tempo real com transparência total.", icon: <Target className="w-6 h-6" /> },
    { title: "Material de Apoio", desc: "Tenha acesso a banners, copies e vídeos prontos para divulgação.", icon: <Users className="w-6 h-6" /> }
  ];

  const faqs = [
    { q: "Como faço para me cadastrar?", a: "Basta clicar no botão 'Quero ser Afiliado' e preencher o formulário. Sua conta será analisada em até 24h." },
    { q: "Qual o valor mínimo para saque?", a: "O valor mínimo para solicitar o resgate de suas comissões é de apenas R$ 50,00." },
    { q: "Posso fazer anúncios (Google Ads)?", a: "Sim, permitimos anúncios em redes de busca, exceto para palavras-chave de marca própria (DigiStore)." },
    { q: "Como as vendas são rastreadas?", a: "Utilizamos cookies de 30 dias. Se o cliente clicar no seu link e comprar em até um mês, a comissão é sua." }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Hero Section */}
        <div className="text-center mb-20 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -z-10"></div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase italic">
            Ganhe até <span className="text-primary italic">20% de comissão</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Faça parte do programa de afiliados mais lucrativo do mercado digital. Indique a <span className="text-white font-bold">BAHIA&apos;S STORE</span> e transforme cliques em dinheiro vivo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <AffiliateHeroButton isAffiliate={isAffiliate} />
            <Link href="#como-funciona" className="px-10 py-5 bg-[#111] border border-[#222] hover:border-primary/50 rounded-2xl font-bold text-lg transition-all">
              Ver mais detalhes
            </Link>
          </div>
        </div>

        {/* Advantages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
          {benefits.map((b, i) => (
            <div key={i} className="p-8 bg-[#0A0A0A] border border-[#222] rounded-3xl hover:border-primary/30 transition-all group">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                {b.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{b.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Tiers Section */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black uppercase italic mb-4">Níveis de Comissões</h2>
            <p className="text-gray-500">Quanto mais você vende, maior é a sua fatia do lucro.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((t, i) => (
              <div key={i} className={`p-8 rounded-3xl border ${t.border} ${t.bg} flex flex-col items-center text-center relative overflow-hidden group`}>
                <div className={`text-5xl font-black mb-4 ${t.color}`}>{t.commission}</div>
                <h3 className="text-xl font-bold text-white mb-2">{t.name}</h3>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">{t.sales}</p>
                {t.name === "Diamond" && (
                   <div className="absolute top-4 right-4 animate-bounce">
                     <TrendingUp className="w-5 h-5 text-blue-400" />
                   </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* How it Works */}
        <div id="como-funciona" className="bg-[#0A0A0A] border border-[#222] rounded-[40px] p-10 md:p-20 mb-32 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 p-10 opacity-5">
             <TrendingUp className="w-64 h-64 text-primary" />
          </div>
          <div className="max-w-xl">
             <h2 className="text-4xl font-black uppercase italic mb-8">Como funciona?</h2>
             <div className="space-y-12">
                {[
                  { step: "01", title: "Faça seu cadastro", desc: "Crie sua conta de afiliado gratuitamente em poucos segundos." },
                  { step: "02", title: "Divulgue seu link", desc: "Use seus canais (Instagram, WhatsApp, TikTok) para divulgar nossos produtos." },
                  { step: "03", title: "Receba sua comissão", desc: "Acompanhe suas vendas e saque seu dinheiro diretamente via Pix." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <span className="text-4xl font-black text-primary opacity-30 italic">{item.step}</span>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                      <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
             <HelpCircle className="w-12 h-12 text-primary mx-auto mb-4" />
             <h2 className="text-3xl font-black uppercase italic mb-4">Perguntas Frequentes</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="p-6 bg-[#0A0A0A] border border-[#222] rounded-2xl">
                <h4 className="text-lg font-bold mb-3 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  {f.q}
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed ml-4.5">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <AffiliateCTA initialIsAffiliate={isAffiliate} initialCode={affiliateCode} />

      </div>
    </div>
  );
}
