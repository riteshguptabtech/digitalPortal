import { useState } from 'react';
import { ClipboardList, ReceiptText } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import Button from '../ui/Button.jsx';
import Field from '../ui/Field.jsx';
import Input from '../ui/Input.jsx';
import StateSelect from '../ui/StateSelect.jsx';
import { formatMoney } from '../../utils/format.js';

export default function BillRequestForm() {
  const { discountPercent, submitBill, addToast } = useApp();
  const [bill, setBill] = useState({ state: 'West Bengal', customerId: '', amount: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const originalAmount = Number(bill.amount) || 0;
  const discountAmount = Math.round((originalAmount * discountPercent) / 100);
  const payableAmount = Math.max(originalAmount - discountAmount, 0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await submitBill({
        ...bill,
        amount: Number(bill.amount),
      });
      setBill({ state: 'West Bengal', customerId: '', amount: '' });
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-cyan-50 text-cyan-700">
          <ReceiptText className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-slate-950">Raise electricity bill</h2>
          <p className="text-sm text-slate-500">Submitted bills enter the admin approval queue.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Board state">
          <StateSelect value={bill.state} onValueChange={(state) => setBill({ ...bill, state })} />
        </Field>
        <Field label="Customer ID">
          <Input required placeholder="WB-1234-5678" value={bill.customerId} onChange={(e) => setBill({ ...bill, customerId: e.target.value })} />
        </Field>
        <Field label="Bill amount">
          <Input required type="number" min="1" placeholder="1250" value={bill.amount} onChange={(e) => setBill({ ...bill, amount: e.target.value })} />
        </Field>
      </div>
      <div className="mt-4 grid gap-2 rounded-md bg-slate-50 p-3 text-sm text-slate-600 sm:grid-cols-3">
        <p>
          Discount
          <span className="block font-bold text-slate-950">{discountPercent}%</span>
        </p>
        <p>
          Savings
          <span className="block font-bold text-emerald-700">{formatMoney(discountAmount)}</span>
        </p>
        <p>
          Wallet debit
          <span className="block font-bold text-slate-950">{formatMoney(payableAmount)}</span>
        </p>
      </div>
      <div className="mt-5 flex w-full justify-end">
        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
          <ClipboardList className="h-4 w-4" />
          {isSubmitting ? 'Submitting...' : 'Submit for approval'}
        </Button>
      </div>
    </form>
  );
}
