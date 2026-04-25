'use client';

import { useActionState } from 'react';
import { registerUser } from '@/app/actions/auth';
import { Loader2 } from 'lucide-react';

export default function RegisterForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    registerUser,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="name">
          Nome
        </label>
        <input
          id="name"
          type="text"
          name="name"
          placeholder="Seu Nome"
          required
          className="w-full bg-[#111] border border-[#333] rounded-lg p-3 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="exemplo@bahiastore.com"
          required
          className="w-full bg-[#111] border border-[#333] rounded-lg p-3 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="password">
          Senha
        </label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="••••••••"
          required
          minLength={6}
          className="w-full bg-[#111] border border-[#333] rounded-lg p-3 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
        />
      </div>

      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 mt-4 rounded-xl bg-primary hover:bg-blue-600 text-white font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(59,130,246,0.3)]"
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Criando conta...
          </>
        ) : (
          'Criar Conta'
        )}
      </button>
    </form>
  );
}
