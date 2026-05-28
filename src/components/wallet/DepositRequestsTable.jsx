import { formatBillDate, formatMoney } from '../../utils/format.js';
import { useApp } from '../../context/AppContext.jsx';
import Button from '../ui/Button.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';

export default function DepositRequestsTable({ deposits, admin = false }) {
  const { approveDeposit, rejectDeposit } = useApp();

  if (!deposits.length) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        No deposit requests found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Deposit</th>
              {admin && <th className="px-4 py-3">User</th>}
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Transaction ID</th>
              <th className="px-4 py-3">Status</th>
              {admin && <th className="px-4 py-3">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {deposits.map((deposit) => (
              <tr key={deposit.id} className="hover:bg-slate-50">
                <td className="px-4 py-4">
                  <p className="font-semibold text-slate-900">{deposit.id.slice(-8)}</p>
                  <p className="text-xs text-slate-500">{formatBillDate(deposit.createdAt)}</p>
                </td>
                {admin && <td className="px-4 py-4 font-semibold text-slate-900">{deposit.userName}</td>}
                <td className="px-4 py-4 font-bold text-slate-950">{formatMoney(deposit.amount)}</td>
                <td className="px-4 py-4 text-slate-600">{deposit.transactionId}</td>
                <td className="px-4 py-4">
                  <StatusBadge status={deposit.status} />
                  {deposit.status === 'rejected' && deposit.rejectionReason && (
                    <p className="mt-1 text-xs text-rose-600">Reason: {deposit.rejectionReason}</p>
                  )}
                </td>
                {admin && (
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <Button
                        variant="success"
                        className="h-8 px-3 text-sm"
                        disabled={deposit.status !== 'pending'}
                        onClick={() => approveDeposit(deposit.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        className="h-8 px-3 text-sm"
                        disabled={deposit.status !== 'pending'}
                        onClick={() => {
                          const reason = prompt('Enter rejection reason:');
                          if (reason) rejectDeposit(deposit.id, reason);
                        }}
                      >
                        Reject
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
  );
}
