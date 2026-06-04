import { Button } from '@/components/ui/Button';

interface QuoteSummaryProps {
  quote: {
    track_price: number;
    coach_price?: number | null;
    subtotal: number;
    total: number;
    availability_available: boolean;
  };
  submitting: boolean;
  onConfirm: () => void;
}

export function QuoteSummary({ quote, submitting, onConfirm }: QuoteSummaryProps) {
  return (
    <div className="quote-summary rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-5 shadow-xl shadow-orange-100/70 dark:border-orange-500/25 dark:from-orange-500/10 dark:to-slate-900 dark:shadow-black/25">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700 dark:text-orange-300">
        Quote summary
      </p>
      <h2 className="mt-2 text-xl font-black text-slate-950 dark:text-white">
        Ready to confirm
      </h2>

      <div className="mt-5 space-y-3 text-sm">
        <Row label="Track" value={`$${quote.track_price}`} />
        {quote.coach_price != null && quote.coach_price > 0 && (
          <Row label="Coach" value={`$${quote.coach_price}`} />
        )}
        <Row label="Subtotal" value={`$${quote.subtotal}`} />
        <div className="flex items-center justify-between border-t border-orange-200 pt-4 dark:border-orange-500/20">
          <span className="font-black text-slate-950 dark:text-white">Total</span>
          <span className="text-3xl font-black text-orange-600 dark:text-orange-300">
            ${quote.total}
          </span>
        </div>
      </div>

      {!quote.availability_available && (
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-300">
          This time slot is no longer available. Please choose another.
        </div>
      )}

      {quote.availability_available && (
        <Button
          variant="primary"
          fullWidth
          size="lg"
          className="mt-6"
          onClick={onConfirm}
          isLoading={submitting}
          disabled={submitting}
        >
          {submitting ? 'Confirming...' : `Confirm booking - $${quote.total}`}
        </Button>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="quote-card flex justify-between rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-600 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-300">
      <span>{label}</span>
      <span className="font-black text-slate-950 dark:text-white">{value}</span>
    </div>
  );
}
