'use client';

export default function AffiliateHeroButton({ isAffiliate }: { isAffiliate: boolean }) {
  const scrollToCTA = () => {
    const element = document.getElementById('affiliate-cta');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Fallback: just scroll to bottom
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <button 
      onClick={scrollToCTA}
      className="px-10 py-5 bg-primary hover:bg-blue-600 rounded-2xl font-black text-xl transition-all shadow-[0_20px_40px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95 uppercase italic"
    >
      {isAffiliate ? 'Ver Meu Código' : 'Quero ser Afiliado'}
    </button>
  );
}
