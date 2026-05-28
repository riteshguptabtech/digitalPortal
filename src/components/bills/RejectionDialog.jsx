import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useApp } from '../../context/AppContext.jsx';
import Button from '../ui/Button.jsx';
import Field from '../ui/Field.jsx';

export default function RejectionDialog({ billId, open, onOpenChange }) {
  const { rejectBill, addToast } = useApp();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReject = async (event) => {
    event.preventDefault();
    if (!reason.trim()) {
      addToast('Please provide a rejection reason.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await rejectBill(billId, reason.trim());
      onOpenChange(false);
      setReason('');
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/50" />
        <Dialog.Content className="radix-dialog-content fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-2xl">
          <Dialog.Title className="text-xl font-bold text-slate-950">Reject bill</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-slate-500">Provide a reason for rejecting this bill request.</Dialog.Description>
          <form className="mt-5 space-y-4" onSubmit={handleReject}>
            <Field label="Rejection reason">
              <textarea
                className="h-24 w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                placeholder="Enter the reason for rejection..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </Field>
            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <Button type="button" variant="secondary" onClick={() => setReason('')}>Cancel</Button>
              </Dialog.Close>
              <Button type="submit" variant="danger" disabled={isSubmitting}>
                {isSubmitting ? 'Rejecting...' : 'Reject bill'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
