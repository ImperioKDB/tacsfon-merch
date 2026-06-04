'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Link2, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import ReceiptPreview from '@/components/receipts/ReceiptPreview';
import ReceiptSkeleton from '@/components/receipts/ReceiptSkeleton';
import { apiFetch } from '@/lib/api/apiFetch';

interface OrderItem {
  id: string;
  product_name: string;
  variant_label: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface ReceiptData {
  order_id: string;
  date: string;
  customer_name: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  receipt_url: string | null;
  payment_confirmed: boolean;
}

export default function ReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchReceipt() {
      try {
        const data = await apiFetch<ReceiptData>(`/orders/${id}/receipt`);
        setReceipt(data);
      } catch (err: any) {
        if (err?.code === 'NOT_FOUND') {
          router.replace('/orders');
        } else {
          toast.error('Failed to load receipt. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchReceipt();
  }, [id, router]);

  async function handleDownload() {
    if (!receipt?.receipt_url) return;
    setDownloading(true);
    try {
      const response = await fetch(receipt.receipt_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TACSFON_Receipt_${receipt.order_id.slice(0, 8).toUpperCase()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Receipt downloaded!');
    } catch {
      toast.error('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  async function handleCopyLink() {
    if (!receipt?.receipt_url) return;
    try {
      await navigator.clipboard.writeText(receipt.receipt_url);
      setCopied(true);
      toast.success('Share link copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Could not copy link. Please try again.');
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6">

        {/* Back link */}
        <button
          onClick={() => router.push(`/orders/${id}`)}
          className="flex items-center gap-2 mb-8 text-sm transition-colors duration-150"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          aria-label="Back to order"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to Order
        </button>

        <h1
          className="text-2xl font-bold mb-6"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
        >
          Order Receipt
        </h1>

        {/* Loading state */}
        {loading && <ReceiptSkeleton />}

        {/* Receipt not yet available */}
        {!loading && receipt && !receipt.payment_confirmed && (
          <div
            className="flex flex-col items-center justify-center gap-4 py-16 rounded-2xl"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
            }}
          >
            <Clock size={40} strokeWidth={1.5} style={{ color: 'var(--color-warning)' }} />
            <p
              className="text-base font-medium text-center max-w-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              Receipt will be available after your payment is confirmed by the admin.
            </p>
          </div>
        )}

        {/* Receipt preview */}
        {!loading && receipt && receipt.payment_confirmed && (
          <>
            {/* Print styles */}
            <style>{`
              @media print {
                body { background: white !important; }
                .no-print { display: none !important; }
                .receipt-wrapper { box-shadow: none !important; }
              }
            `}</style>

            <div className="receipt-wrapper">
              <ReceiptPreview receipt={receipt} />
            </div>

            {/* Action bar */}
            <div className="no-print flex flex-col sm:flex-row gap-3 mt-6">
              {/* Download PDF */}
              <button
                onClick={handleDownload}
                disabled={downloading || !receipt.receipt_url}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                style={{
                  background: 'var(--accent)',
                  color: '#0A0A0F',
                }}
                onMouseEnter={e => {
                  if (!downloading) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-gold-light)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(61,186,111,0.3)';
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                }}
              >
                {downloading ? (
                  <>
                    <span
                      className="inline-block w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin"
                    />
                    Downloading…
                  </>
                ) : (
                  <>
                    <Download size={16} strokeWidth={1.5} />
                    Download PDF
                  </>
                )}
              </button>

              {/* Copy Share Link */}
              <button
                onClick={handleCopyLink}
                disabled={!receipt.receipt_url}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                style={{
                  background: 'transparent',
                  color: copied ? 'var(--success)' : 'var(--accent)',
                  border: `1px solid ${copied ? 'var(--success)' : 'var(--accent)'}`,
                }}
                onMouseEnter={e => {
                  if (!copied) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(61,186,111,0.10)';
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                {copied ? (
                  <>
                    <CheckCircle2 size={16} strokeWidth={1.5} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Link2 size={16} strokeWidth={1.5} />
                    Copy Share Link
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}