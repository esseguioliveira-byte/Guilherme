import RegisterForm from '@/components/RegisterForm';
import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-[#0A0A0A] border border-[#222] rounded-2xl p-8 shadow-[0_0_40px_rgba(59,130,246,0.1)] relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 flex justify-center">
            <img src="/content.png" alt="Bahia Store Logo" className="w-24 h-auto drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
          </div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Criar Conta</h1>
          <p className="text-sm text-gray-400 mt-2 font-medium">Junte-se à <span className="text-primary font-bold">Bahia Store</span> hoje mesmo</p>
        </div>
        
        <RegisterForm />

        <div className="mt-6 text-center text-sm text-gray-400">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Entrar aqui
          </Link>
        </div>
      </div>
    </div>
  );
}
