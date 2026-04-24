import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';
import { User, Edit, DollarSign, ShieldCheck } from 'lucide-react';

export default async function AdminCustomersPage() {
  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Clientes & Afiliados</h1>
          <p className="text-gray-400 mt-1">Gerencie usuários e suas configurações de comissão.</p>
        </div>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222] bg-[#1a1a1a]">
                <th className="p-4 text-sm font-medium text-gray-400">Usuário</th>
                <th className="p-4 text-sm font-medium text-gray-400">Status</th>
                <th className="p-4 text-sm font-medium text-gray-400">Afiliado</th>
                <th className="p-4 text-sm font-medium text-gray-400">Saldo</th>
                <th className="p-4 text-sm font-medium text-gray-400">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {allUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#1a1a1a] transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                        {u.image ? (
                          <img src={u.image} alt="" className="w-full h-full rounded-full" />
                        ) : (
                          <User className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{u.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      Ativo
                    </span>
                  </td>
                  <td className="p-4">
                    {u.isAffiliate ? (
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
                         <ShieldCheck className="w-3 h-3" /> Sim ({Number(u.commissionRate)}%)
                      </div>
                    ) : (
                      <span className="text-gray-600 text-xs uppercase tracking-widest">Não</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-black italic text-white">R$ {Number(u.balance).toFixed(2).replace('.', ',')}</span>
                  </td>
                  <td className="p-4">
                    <Link 
                      href={`/admin/customers/${u.id}`}
                      className="p-2 bg-[#222] hover:bg-primary text-gray-400 hover:text-white rounded-lg transition-all flex items-center gap-2 w-fit"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase">Editar</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
