import RegisterForm from '@/components/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md bg-[#0A0A0A] border border-[#222] rounded-2xl p-8 shadow-[0_0_40px_rgba(59,130,246,0.1)]">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 mx-auto mb-4">
            <span className="text-primary font-bold text-xl">D</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Criar Nova Conta</h1>
          <p className="text-sm text-gray-400 mt-2">Junte-se à DigiStore hoje mesmo</p>
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
