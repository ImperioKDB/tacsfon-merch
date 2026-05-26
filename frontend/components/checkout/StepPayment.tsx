'use client';
import { useState } from 'react';
import { Copy, Check, BellRing } from 'lucide-react';
import { toast } from 'sonner';

export default function StepPayment({ cart, deliveryData, onOrderCreated, onBack }: any) {
  const [copied, setCopied] = useState(false);
  const [isAlerting, setIsAlerting] = useState(false);

  const bankDetails = {
    bank: "Zenith Bank",
    account: "1012345678",
    name: "TACSFON MERCH STORE"
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bankDetails.account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Account number copied!");
  };

  const handlePaidSignal = async () => {
    setIsAlerting(true);
    try {
      // Create the order first
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delivery_address: deliveryData.deliveryAddress,
          phone: deliveryData.phone,
          signal_only: true // Flag for backend to send Telegram Alert
        })
      });
      const data = await res.json();
      if(data.success) {
        toast.info("Admin has been notified of your payment! Proceeding to proof upload.");
        onOrderCreated(data.data.id); // Move to Step 3 (Upload Proof)
      }
    } catch {
      toast.error("Failed to signal admin.");
    } finally {
      setIsAlerting(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-8 space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-gold font-bold uppercase tracking-widest text-sm mb-4">Step 2: Bank Transfer</h2>
        <p className="text-zinc-400 text-sm">Please transfer ₦{cart.total.toLocaleString()} to the account below.</p>
      </div>

      <div className="bg-black border border-zinc-800 p-6 space-y-4">
        <div>
          <p className="text-zinc-500 text-xs uppercase font-bold">Bank Name</p>
          <p className="text-white font-bold">{bankDetails.bank}</p>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-zinc-500 text-xs uppercase font-bold">Account Number</p>
            <p className="text-white font-mono text-xl font-bold tracking-widest">{bankDetails.account}</p>
          </div>
          <button onClick={copyToClipboard} className="bg-zinc-800 p-2 text-gold">
            {copied ? <Check size={18}/> : <Copy size={18}/>}
          </button>
        </div>
        <div>
          <p className="text-zinc-500 text-xs uppercase font-bold">Account Name</p>
          <p className="text-white font-bold">{bankDetails.name}</p>
        </div>
      </div>

      <div className="space-y-3 pt-4">
        <button onClick={handlePaidSignal} disabled={isAlerting} 
                className="w-full bg-gold text-black font-black uppercase py-4 tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-all">
          <BellRing size={18}/> {isAlerting ? 'Signalling Admin...' : 'I have completed payment'}
        </button>
        <button onClick={onBack} className="w-full text-zinc-500 font-bold uppercase text-xs tracking-widest">Go Back</button>
      </div>
    </div>
  );
}
