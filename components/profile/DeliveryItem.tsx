'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function DeliveryItem({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between gap-3 p-3 bg-black/50 border border-white/10 rounded-xl group/item">
      <code className="text-[10px] font-mono text-gray-300 break-all">{content}</code>
      <button 
        onClick={handleCopy}
        className={`p-1.5 rounded-lg transition-all flex-shrink-0 ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'}`}
        title="Copiar"
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      </button>
    </div>
  );
}
