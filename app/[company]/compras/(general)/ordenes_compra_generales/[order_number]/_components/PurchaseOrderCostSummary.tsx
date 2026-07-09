import { Building2, CreditCard, Wallet } from 'lucide-react';
import type { BankAccount, BankCard, PaymentMethod } from '@/types';

interface CostBreakdown {
  sub_total?: number | null;
  tax?: number | null;
  wire_fee?: number | null;
  handling_fee?: number | null;
  international_shipping?: number | null;
  shipping_fee?: number | null;
  total?: number | null;
}

interface PurchaseOrderCostSummaryProps {
  costs: CostBreakdown;
  paymentMethod?: PaymentMethod | null;
  bankAccount?: BankAccount | null;
  card?: BankCard | null;
  isAeronautical?: boolean;
}

const CostRow = ({ label, value }: { label: string; value: number | null | undefined }) => (
  <div className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="font-mono text-xs tabular-nums">${Number(value || 0).toFixed(2)}</span>
  </div>
);

const PurchaseOrderCostSummary = ({ costs, paymentMethod, bankAccount, card, isAeronautical }: PurchaseOrderCostSummaryProps) => {
  return (
    <div className="relative mx-auto max-w-md w-full rounded-xl border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-2.5 select-none">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
          COSTOS
        </span>
        <div className="h-px flex-1 bg-border/50" />
      </div>

      <div className="space-y-0">
        <CostRow label="Subtotal de artículos" value={costs.sub_total} />
        <CostRow label="Tax" value={costs.tax} />
        {!isAeronautical && <CostRow label="Wire Fee" value={costs.wire_fee} />}
        <CostRow label="Handling Fee" value={costs.handling_fee} />
        <CostRow label="Envío internacional" value={costs.international_shipping} />
        <CostRow label="Envío nacional" value={costs.shipping_fee} />
      </div>

      {/* Total */}
      <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-border/60">
        <span className="text-xs font-semibold uppercase tracking-wide text-foreground/80">Total</span>
        <span className="font-mono text-lg font-bold tabular-nums">
          ${Number(costs.total || costs.sub_total || 0).toFixed(2)}
        </span>
      </div>

      {/* Payment method */}
      {(paymentMethod || bankAccount || card) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 pt-2.5 border-t border-border/40 text-xs text-muted-foreground">
          {paymentMethod && (
            <span className="flex items-center gap-1.5">
              <Wallet className="size-3.5 shrink-0" />
              {paymentMethod.name}
            </span>
          )}
          {bankAccount && (
            <span className="flex items-center gap-1.5">
              <Building2 className="size-3.5 shrink-0" />
              {bankAccount.bank?.name ? `${bankAccount.bank.name} · ` : ''}
              {bankAccount.name}
              <span className="font-mono">({bankAccount.account_number})</span>
            </span>
          )}
          {card && (
            <span className="flex items-center gap-1.5">
              <CreditCard className="size-3.5 shrink-0" />
              {card.name}
              <span className="font-mono">{card.card_number}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderCostSummary;
