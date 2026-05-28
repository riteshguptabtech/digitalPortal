import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { formatBillDate, formatMoney } from '../../utils/format.js';
import Button from '../ui/Button.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import RejectionDialog from './RejectionDialog.jsx';

export default function BillsTable({ bills, admin = false }) {
  const { approveBill } = useApp();
  const [rejectingBillId, setRejectingBillId] = useState(null);

  if (!bills.length) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        No requests found.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Request</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Service area</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">Status</th>
                {admin && <th className="px-4 py-3">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-900">{bill.id.slice(-8)}</p>
                    <p className="text-xs text-slate-500">{bill.requestType === 'mobile_recharge' ? 'Mobile recharge' : 'Electricity bill'}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-900">{admin ? bill.userName : bill.customerId}</p>
                    {admin && (
                      <p className="text-xs text-slate-500">
                        {bill.requestType === 'mobile_recharge' ? 'Mobile' : 'Customer ID'}: {bill.customerId}
                      </p>
                    )}
                    <p className="text-xs text-slate-500">{bill.date || formatBillDate(bill.createdAt)}</p>
                    {bill.status === 'rejected' && bill.rejectionReason && (
                      <p className="mt-1 text-xs text-rose-600">Reason: {bill.rejectionReason}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{bill.state}</td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-slate-950">{formatMoney(bill.amount)}</p>
                    {bill.discountAmount > 0 && (
                      <p className="text-xs text-emerald-700">
                        {bill.discountPercent}% off from {formatMoney(bill.originalAmount)}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {bill.requestType === 'mobile_recharge' ? `${bill.operator} - ${bill.planName}` : 'Electricity bill'}
                  </td>
                  <td className="px-4 py-4"><StatusBadge status={bill.status} /></td>
                  {admin && (
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1 sm:flex-row sm:gap-2">
                        <Button variant="success" className="h-7 px-2 text-xs sm:h-8 sm:px-3 sm:text-sm" disabled={bill.status !== 'pending'} onClick={() => approveBill(bill.id)}>
                          <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="ml-1 hidden sm:inline">Approve</span>
                        </Button>
                        <Button variant="danger" className="h-7 px-2 text-xs sm:h-8 sm:px-3 sm:text-sm" disabled={bill.status !== 'pending'} onClick={() => setRejectingBillId(bill.id)}>
                          <X className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="ml-1 hidden sm:inline">Reject</span>
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <RejectionDialog
        billId={rejectingBillId}
        open={!!rejectingBillId}
        onOpenChange={(open) => !open && setRejectingBillId(null)}
      />
    </>
  );
}
