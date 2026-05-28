import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, QrCode } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { formatMoney } from '../../utils/format.js';
import Button from '../ui/Button.jsx';
import Field from '../ui/Field.jsx';
import Input from '../ui/Input.jsx';

export default function DepositDialog() {
  const { currentUser, paymentQr, requestDeposit, addToast } = useApp();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('1000');
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const value = Number(amount) || 0;
  const qrSrc = paymentQr?.dataUrl || '/payment-qr.svg';

  const deposit = async (event) => {
    event.preventDefault();

    if (value <= 0) {
      addToast('Enter a valid amount', 'error');
      return;
    }

    if (!transactionId.trim()) {
      addToast('Enter the transaction ID after payment', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await requestDeposit(currentUser.id, value, transactionId.trim());
      setOpen(false);
      setAmount('1000');
      setTransactionId('');
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Deposit
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/50" />
        <Dialog.Content className="radix-dialog-content fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-md bg-white p-6 shadow-2xl">
          <Dialog.Title className="text-xl font-bold text-slate-950">Deposit money</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-slate-500">Enter amount, scan the QR, then submit your transaction ID for admin approval.</Dialog.Description>
          <form className="mt-5 space-y-4" onSubmit={deposit}>
            <Field label="Amount">
              <Input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </Field>

            <div className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[160px_1fr]">
              <div className="rounded-md bg-white p-3 ring-1 ring-slate-200">
                <img src={qrSrc} alt="DAS Digital payment QR code" className="aspect-square w-full object-contain" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-50 text-cyan-700">
                  <QrCode className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-950">Scan to pay DAS Digital</p>
                <p className="mt-1 text-sm text-slate-500">Pay exactly {formatMoney(value)} and enter the transaction ID below.</p>
              </div>
            </div>

            <Field label="Transaction ID">
              <Input
                required
                placeholder="Enter UPI / bank transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </Field>

            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </Dialog.Close>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit request'}</Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
