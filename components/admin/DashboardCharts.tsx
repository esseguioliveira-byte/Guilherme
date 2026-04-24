'use client';

import { useRouter, usePathname } from 'next/navigation';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardChartsProps {
  salesData: any[];
  visitorCount: number;
  currentDays: number;
}

export default function DashboardCharts({ salesData, visitorCount, currentDays }: DashboardChartsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleRangeChange = (days: number) => {
    router.replace(`${pathname}?days=${days}`, { scroll: false });
  };

  const pieData = [
    { name: 'Visitantes', value: visitorCount },
    { name: 'Resto', value: 2000 }, // Mock rest for the circle
  ];

  const COLORS = ['#8B5CF6', '#1a1a1a'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sales Chart */}
      <div className="lg:col-span-2 glass-card p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="text-xl font-bold text-white italic uppercase tracking-tight">Gráfico de Vendas</h3>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Total para os últimos 7 dias</p>
          </div>
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
             <button 
               onClick={() => handleRangeChange(7)}
               className={`px-4 py-2 text-[10px] font-black uppercase transition-all rounded-lg ${currentDays === 7 ? 'text-white bg-white/5 shadow-sm' : 'text-gray-500 hover:text-white'}`}
             >
               7 Dias
             </button>
             <button 
               onClick={() => handleRangeChange(30)}
               className={`px-4 py-2 text-[10px] font-black uppercase transition-all rounded-lg ${currentDays === 30 ? 'text-white bg-white/5 shadow-sm' : 'text-gray-500 hover:text-white'}`}
             >
               30 Dias
             </button>
             <button 
               onClick={() => handleRangeChange(90)}
               className={`px-4 py-2 text-[10px] font-black uppercase transition-all rounded-lg ${currentDays === 90 ? 'text-white bg-white/5 shadow-sm' : 'text-gray-500 hover:text-white'}`}
             >
               90 Dias
             </button>
          </div>

        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#4b5563', fontSize: 10 }}
                dy={10}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #222', borderRadius: '16px' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                strokeWidth={3}
              />
              <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorSales)" 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center gap-6 mt-6">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black uppercase text-gray-400">Faturamento</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[10px] font-black uppercase text-gray-400">Vendas</span>
           </div>
        </div>
      </div>

      {/* Visitors Chart */}
      <div className="glass-card p-8 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute top-8 left-8 text-left">
           <h3 className="text-xl font-bold text-white italic uppercase tracking-tight">Visitantes</h3>
           <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Total acumulado</p>
        </div>

        <div className="relative w-48 h-48 mt-12">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-black text-white italic tracking-tighter">{visitorCount.toLocaleString()}</span>
            <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">visitantes</span>
          </div>
        </div>

        <div className="mt-8 space-y-2">
           <p className="text-xs font-bold text-white flex items-center justify-center gap-2">
              Crescimento de <span className="text-emerald-400">+100%</span> em comparação. 
              <span className="text-emerald-400">↗</span>
           </p>
           <p className="text-[10px] text-gray-500">Mostrando visitantes totais do mês atual</p>
        </div>
      </div>
    </div>
  );
}
