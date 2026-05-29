import { Button } from '@/components/ui/Button';

interface QuoteSummaryProps {
  quote: {
    track_price: number;
    coach_price?: number | null;
    subtotal: number;
    tax: number;
    total: number;
    availability_available: boolean;
  };
  submitting: boolean;
  onConfirm: () => void;
}

export function QuoteSummary({ quote, submitting, onConfirm }: QuoteSummaryProps) {
  return (
    <div className="bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/25 rounded-2xl p-6 mb-6">
      <h2 className="text-lg font-bold text-white mb-4">Quote summary</h2>

      <div className="space-y-2 text-sm">
        <Row label="Track" value={`$${quote.track_price}`} />
        {quote.coach_price != null && quote.coach_price > 0 && (
          <Row label="Coach" value={`$${quote.coach_price}`} />
        )}
        <Row label="Subtotal" value={`$${quote.subtotal}`} />
        {quote.tax > 0 && <Row label="Tax" value={`$${quote.tax}`} />}
        <div className="border-t border-orange-500/20 pt-3 flex justify-between items-center">
          <span className="font-semibold text-white">Total</span>
          <span className="text-2xl font-bold text-orange-400">${quote.total}</span>
        </div>
      </div>

      {!quote.availability_available && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
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
          {submitting ? 'Confirming...' : `Confirm booking · $${quote.total}`}
        </Button>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-gray-300">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
