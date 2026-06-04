'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useUpdateTradeJournal } from '@/hooks/useTradeJournalMutations';
import { getApiErrorMessage } from '@/lib/api/errors';
import type { UpdateTradeJournalInput } from '@/lib/api/tradeJournals';
import type { TradeRow } from '@/constants/tradeJournalData';

interface EditTradeJournalModalProps {
  row: TradeRow;
  onClose: () => void;
}

// Pre-fill an input from a numeric row value (blank when not set yet).
const initial = (n: number | null) => (n === null ? '' : String(n));

// The fields RA can fill via update-trade-journal.
const FIELDS = [
  { key: 'points', label: 'Points' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'profit', label: 'Profit' },
  { key: 'exit_price', label: 'Exit Price' },
  { key: 'high_of', label: 'High Of' },
] as const;

type FieldKey = (typeof FIELDS)[number]['key'];

const EditTradeJournalModal = ({ row, onClose }: EditTradeJournalModalProps) => {
  const updateJournal = useUpdateTradeJournal();
  const [values, setValues] = useState<Record<FieldKey, string>>({
    points: initial(row.points),
    quantity: initial(row.lotSize),
    profit: initial(row.profit),
    exit_price: initial(row.exitPrice),
    high_of: initial(row.highOf),
  });

  const set = (key: FieldKey, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const save = () => {
    if (updateJournal.isPending) return;

    // Only send fields the RA actually entered. Quantity goes as a number; the
    // rest as strings, matching the API contract.
    const input: UpdateTradeJournalInput = {};
    if (values.points.trim() !== '') input.points = values.points.trim();
    if (values.quantity.trim() !== '') input.quantity = Number(values.quantity);
    if (values.profit.trim() !== '') input.profit = values.profit.trim();
    if (values.exit_price.trim() !== '') input.exit_price = values.exit_price.trim();
    if (values.high_of.trim() !== '') input.high_of = values.high_of.trim();

    if (Object.keys(input).length === 0) {
      toast.error('Enter at least one value to update');
      return;
    }
    if (input.quantity !== undefined && Number.isNaN(input.quantity)) {
      toast.error('Quantity must be a number');
      return;
    }

    updateJournal.mutate(
      { journalId: row.id, input },
      {
        onSuccess: () => {
          toast.success('Trade journal updated');
          onClose();
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-5 border-b border-slate-100">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900">Update Trade Journal</h2>
            <p className="text-sm text-slate-500 mt-0.5 truncate">{row.trade}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 grid grid-cols-2 gap-4">
          {FIELDS.map((f) => (
            <div key={f.key} className={f.key === 'high_of' ? 'col-span-2' : ''}>
              <label className="block text-[13px] font-medium text-slate-600 mb-1.5">
                {f.label}
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={values[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder="—"
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={updateJournal.isPending}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {updateJournal.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTradeJournalModal;
