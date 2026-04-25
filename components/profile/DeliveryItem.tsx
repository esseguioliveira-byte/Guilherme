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
    <div className="flex items-center justify-between gap-2 p-2 sm:p-3 bg-black/40 border border-white/5 rounded-xl group/item w-full overflow-hidden">
      <div className="flex-1 min-w-0">
        <code className="text-[10px] sm:text-[11px] font-mono text-gray-400 break-all whitespace-pre-wrap line-clamp-3 group-hover/item:line-clamp-none transition-all">
          {content}
        </code>
      </div>
      <button 
        onClick={handleCopy}
        className={`p-2 rounded-lg transition-all flex-shrink-0 ${copied ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 border border-white/5'}`}
        title="Copiar"
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
