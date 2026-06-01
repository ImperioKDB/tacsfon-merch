'use client'
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Receipt, Upload, Truck } from 'lucide-react';
import { StatusBadge } from './OrderCard';
import StatusTimeline from './StatusTimeline';
import MarkReceivedDialog from './MarkReceivedDialog';
import StepUploadProof from '@/components/checkout/StepUploadProof';
import { resolveImageUrl } from '@/lib/utils/formatters';
import type { Order, OrderItem } from '@/types';

type Props = { orderId: string }
interface ExtendedOrder extends Order { order_items?: OrderItem[]; }

export default function OrderDetailClient({ orderId }: Props) {
  const [order, setOrder] = useState<ExtendedOrder | null>(null);
  const [loadState, setLoadState] = useState('loading');
  const [showReceive, setShowReceive] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { cache: 'no-store' });
      const body = await res.json();
      if (res.status === 404) { setLoadState('not_found'); return; }
      if (body?.success) { setOrder(body.data); setLoadState('ready'); }
      else { setLoadState('error'); }
    } catch { setLoadState('error'); }
  }, [orderId]);

  useEffect(() => { fetchOrder() }, [fetchOrder]);

  if (loadState === 'loading') return <div className="min-h-screen bg-black" />;
  if (loadState === 'not_found' || !order) return <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-500 uppercase font-black tracking-widest">Order Not Found<Link href="/orders" className="text-gold mt-4 underline">Back</Link></div>;

  const displayItems = order.items || order.order_items || [];
  const showUploadBtn = order.status === 'pending_payment' && !order.proof_url;
  const showReceiveBtn = order.status === 'dispatched';
  const showReceiptBtn = order.status === 'received' && order.payment_status === 'paid';

  return (
    <main className="min-h-screen px-4 py-24 md:px-8 bg-[#0A0A0F] text-[#F7F5F0]">
      <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
        <Link href="/orders" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors flex items-center gap-2"><ArrowLeft size={12}/> Back to manifest</Link>
        
        <div className="p-8 bg-[#13131A] border border-[#2A2A38] space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-[#C9A84C] uppercase tracking-widest mb-2">Identity Hub</p>
              <h2 className="text-2xl font-black text-white font-mono uppercase">#{order.id.slice(0, 8)}</h2>
            </div>
            <StatusBadge status={order.status} />
          </div>
          <StatusTimeline status={order.status} />
        </div>

        <div className="bg-black border border-[#2A2A38] overflow-hidden">
          <div className="divide-y divide-[#2A2A38]">
            {displayItems.map((item, i) => (
              <div key={i} className="p-6 flex justify-between items-center bg-[#13131A]/5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#0A0A0F] border border-[#2A2A38] overflow-hidden">
                    {item.variant?.product?.image_url && <Image src={resolveImageUrl(item.variant.product.image_url)!} alt="Merch" width={64} height={64} className="object-cover" unoptimized />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white uppercase">{item.variant?.product?.name}</p>
                    <p className="text-[10px] font-black text-[#C9A84C] uppercase mt-1">{item.variant?.size} • {item.variant?.color}</p>
                  </div>
                </div>
                <p className="font-mono font-bold text-[#C9A84C]">₦{(item.unit_price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="p-6 bg-[#13131A] flex justify-between items-center border-t border-[#2A2A38]">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Grand Total</span>
            <span className="text-2xl font-black text-[#C9A84C]">₦{Number(order.total).toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-4 pt-4 pb-20">
          {showUploadBtn && <button onClick={() => setShowUpload(true)} className="w-full py-5 bg-[#C9A84C] text-[#0A0A0F] font-black uppercase text-xs tracking-[0.2em] hover:bg-white transition-all"><Upload size={14} className="inline mr-2"/> Transmit Proof</button>}
          {showReceiveBtn && <button onClick={() => setShowReceive(true)} className="w-full py-5 bg-[#F7F5F0] text-[#0A0A0F] font-black uppercase text-xs tracking-[0.2em] hover:bg-[#C9A84C] transition-all"><Truck size={14} className="inline mr-2"/> Confirm Receipt</button>}
          {showReceiptBtn && <Link href={`/orders/${orderId}/receipt`} className="block w-full py-5 border border-[#2A2A38] text-[#C9A84C] text-center font-black uppercase text-xs tracking-[0.2em] hover:bg-[#13131A] transition-all"><Receipt size={14} className="inline mr-2"/> View Receipt</Link>}
        </div>
      </div>
      {showUpload && <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90"><div className="w-full max-w-md bg-[#13131A] p-8 border border-[#2A2A38]"><button onClick={() => setShowUpload(false)} className="text-zinc-500 mb-4 hover:text-white">✕ Close</button><StepUploadProof orderId={orderId} /></div></div>}
      {showReceive && <MarkReceivedDialog orderId={orderId} onSuccess={() => { setShowReceive(false); fetchOrder(); }} onCancel={() => setShowReceive(false)} />}
    </main>
  );
}
