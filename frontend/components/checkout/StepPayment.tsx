'use client';
import { useState } from 'react';
import { Copy, Check, BellRing, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api/fetch';

export default function StepPayment({ cart, deliveryData, onOrderCreated, onBack }: any) {
  const [copied, setCopied] = useState(false);
  const [isAlerting, setIsAlerting] = useState(false);

  // We map every possible variation of the key name to ensure it finds your Vercel variables
  const bankDetails = {
    bank: process.env.NEXT_PUBLIC_BANK_NAME || "Zenith Bank",
    account: process.env.NEXT_PUBLIC_BANK_ACCOUNT || process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || "1012345678",
    name: process.env.NEXT_PUBLIC_BANK_OWNER || process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "TACSFON MERCH STORE"
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bankDetails.account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Account number copied");
  };

  const handlePaidSignal = async () => {
    setIsAlerting(true);
    try {
      const data = await apiFetch<any>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          delivery_address: deliveryData.deliveryAddress,
          phone: deliveryData.phone
        })
      });

      if (data && data.id) {
        toast.success("Admin notified! Proceed to upload proof.");
        onOrderCreated(data.id); 
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to signal admin. Check your internet.");
    } finally {
      setIsAlerting(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-8 space-y-8 animate-fadeIn">
      <div className="bg-black border border-zinc-800 p-6 space-y-4">
        <div>
          <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-1">Bank Name</p>
          <p className="text-white font-bold">{bankDetails.bank}</p>
        </div>
        <div className="flex justify-between items-center bg-zinc-900/40 p-4 border border-zinc-800">
          <div>
            <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-1">Account Number</p>
            <p className="text-gold font-mono text-2xl font-black">{bankDetails.account}</p>
          </div>
          <button onClick={copyToClipboard} className="bg-zinc-800 p-3 text-gold hover:bg-white transition-colors">
            {copied ? <Check size={20}/> : <Copy size={20}/>}
          </button>
        </div>
        <div>
          <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-1">Account Name</p>
          <p className="text-white font-bold uppercase">{bankDetails.name}</p>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <button onClick={handlePaidSignal} disabled={isAlerting} 
                className="w-full bg-gold text-black font-black uppercase py-5 text-sm tracking-widest flex items-center justify-center gap-3 hover:bg-white transition-all disabled:opacity-50">
          {isAlerting ? <Loader2 className="animate-spin" size={18}/> : <BellRing size={18}/>}
          {isAlerting ? 'PROCESSING...' : 'I HAVE MADE PAYMENT'}
        </button>
        <button onClick={onBack} className="w-full text-zinc-500 font-black uppercase text-[10px] tracking-[0.3em] text-center">Go Back</button>
      </div>
    </div>
  );
}
