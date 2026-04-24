'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className="px-6 py-4 bg-primary hover:bg-blue-600 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_10px_20px_rgba(59,130,246,0.2)] shrink-0"
    >
      {copied ? (
        <>
          <Check className="w-5 h-5" /> Copiado!
        </>
      ) : (
        <>
          <Copy className="w-5 h-5" /> Copiar Link
        </>
      )}
    </button>
  );
}
