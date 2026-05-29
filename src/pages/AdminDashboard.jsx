import { useMemo, useState } from 'react';
import { CircleDollarSign, ClipboardList, IndianRupee, LayoutDashboard, Menu, Plus, QrCode, Search, Trash2, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import BillsTable from '../components/bills/BillsTable.jsx';
import AdminSideMenu from '../components/layout/AdminSideMenu.jsx';
import Shell from '../components/layout/Shell.jsx';
import Button from '../components/ui/Button.jsx';
import Field from '../components/ui/Field.jsx';
import Input from '../components/ui/Input.jsx';
import SummaryCard from '../components/ui/SummaryCard.jsx';
import DepositRequestsTable from '../components/wallet/DepositRequestsTable.jsx';
import { formatMoney } from '../utils/format.js';

const operators = ['Jio', 'Airtel', 'Vi', 'BSNL'];

const sectionMeta = {
  overview: {
    title: 'Admin Panel',
    subtitle: 'Review totals and move into approval queues.',
  },
  deposits: {
    title: 'Deposit Approvals',
    subtitle: 'Approve wallet deposits after checking transaction IDs.',
  },
  bills: {
    title: 'Bill Approvals',
    subtitle: 'Approve or reject submitted bill and recharge requests.',
  },
  discount: {
    title: 'Discounts',
    subtitle: 'Change discounts applied to new bill and recharge requests.',
  },
  rechargePlans: {
    title: 'Recharge Plans',
    subtitle: 'Add or remove mobile recharge plans shown to users.',
  },
};

export default function AdminDashboard() {
  const { addToast, currentUser, discountPercent, rechargeDiscountPercent, rechargePlans, paymentQr, getAllBills, getAllDeposits, updateDiscountPercent, updatePaymentQr, updateRechargePlans, wallet } = useApp();
  const [activeSection, setActiveSection] = useState('overview');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [discountDraft, setDiscountDraft] = useState(String(discountPercent));
  const [rechargeDiscountDraft, setRechargeDiscountDraft] = useState(String(rechargeDiscountPercent));
  const [planDraft, setPlanDraft] = useState({ operator: operators[0], name: '', amount: '' });
  const [isSavingDiscount, setIsSavingDiscount] = useState(false);
  const [isSavingQr, setIsSavingQr] = useState(false);
  const [isSavingPlans, setIsSavingPlans] = useState(false);
  const allBills = getAllBills();
  const allDeposits = getAllDeposits();
  const filteredBills = useMemo(
    () => allBills.filter((bill) => `${bill.customerId || ''} ${bill.state || ''} ${bill.operator || ''} ${bill.status || ''}`.toLowerCase().includes(query.toLowerCase())),
    [allBills, query],
  );
  const pending = allBills.filter((bill) => bill.status === 'pending').length;
  const pendingDeposits = allDeposits.filter((deposit) => deposit.status === 'pending').length;
  const approvedTotal = allBills.filter((bill) => bill.status === 'approved').reduce((sum, bill) => sum + bill.amount, 0);
  const totalWallet = Object.values(wallet).reduce((sum, value) => sum + Number(value || 0), 0);
  const activePage = sectionMeta[activeSection];

  const saveDiscount = async (event) => {
    event.preventDefault();
    setIsSavingDiscount(true);
    try {
      await updateDiscountPercent(Number(discountDraft), Number(rechargeDiscountDraft));
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setIsSavingDiscount(false);
    }
  };

  const uploadPaymentQr = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      addToast('Upload a PNG, JPG, WEBP, or SVG QR image', 'error');
      return;
    }

    if (file.size > 1024 * 1024) {
      addToast('QR image must be 1 MB or smaller', 'error');
      return;
    }

    setIsSavingQr(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Could not read QR image'));
        reader.readAsDataURL(file);
      });

      await updatePaymentQr({
        dataUrl,
        fileName: file.name,
        mimeType: file.type,
      });
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setIsSavingQr(false);
    }
  };

  const addRechargePlan = async (event) => {
    event.preventDefault();
    setIsSavingPlans(true);
    try {
      await updateRechargePlans([
        ...rechargePlans,
        {
          operator: planDraft.operator,
          name: planDraft.name,
          amount: Number(planDraft.amount),
        },
      ]);
      setPlanDraft({ operator: planDraft.operator, name: '', amount: '' });
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setIsSavingPlans(false);
    }
  };

  const removeRechargePlan = async (operator, planName) => {
    if (rechargePlans.length <= 1) {
      addToast('Keep at least one recharge plan', 'error');
      return;
    }

    setIsSavingPlans(true);
    try {
      await updateRechargePlans(rechargePlans.filter((plan) => plan.operator !== operator || plan.name !== planName));
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setIsSavingPlans(false);
    }
  };

  const menuButton = (
    <button
      type="button"
      onClick={() => setIsMenuOpen(true)}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-800 text-white shadow-sm hover:bg-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-100"
      aria-label="Open menu"
      aria-expanded={isMenuOpen}
    >
      <Menu className="h-5 w-5" />
    </button>
  );

  return (
    <Shell
      title={activePage.title}
      subtitle={activePage.subtitle}
      logoSrc="/das-digital-logo.jpeg"
      leadingAction={menuButton}
    >
      <AdminSideMenu
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSelectSection={setActiveSection}
        activeSection={activeSection}
        user={currentUser}
        pendingBills={pending}
        pendingDeposits={pendingDeposits}
      />

      {activeSection === 'overview' && (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          <SummaryCard icon={LayoutDashboard} label="Total requests" value={allBills.length} accent="text-slate-700 bg-slate-100" />
          <SummaryCard icon={ClipboardList} label="Pending requests" value={pending} accent="text-amber-700 bg-amber-50" />
          <SummaryCard icon={CircleDollarSign} label="Approved value" value={formatMoney(approvedTotal)} accent="text-emerald-700 bg-emerald-50" />
          <SummaryCard icon={IndianRupee} label="Deposit approvals" value={pendingDeposits} accent="text-cyan-700 bg-cyan-50" />
        </div>
      )}

      {activeSection === 'discount' && (
        <form onSubmit={saveDiscount} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:flex sm:items-end sm:justify-between sm:gap-4 sm:p-5">
          <div className="max-w-xl">
            <h2 className="text-lg font-bold text-slate-950">Service discounts</h2>
            <p className="mt-1 text-sm text-slate-500">These percentages are applied to new requests. The discounted payable amount is debited from the user wallet immediately.</p>
          </div>
          <div className="mt-4 grid gap-3 sm:mt-0 sm:grid-cols-[auto_auto_auto] sm:items-end">
            <Field label="Electricity discount %">
              <Input
                className="w-full sm:w-36"
                type="number"
                min="0"
                max="100"
                value={discountDraft}
                onChange={(event) => setDiscountDraft(event.target.value)}
              />
            </Field>
            <Field label="Recharge discount %">
              <Input
                className="w-full sm:w-36"
                type="number"
                min="0"
                max="100"
                value={rechargeDiscountDraft}
                onChange={(event) => setRechargeDiscountDraft(event.target.value)}
              />
            </Field>
            <Button type="submit" className="self-end" disabled={isSavingDiscount}>
              {isSavingDiscount ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      )}

      {activeSection === 'rechargePlans' && (
        <section className="grid gap-5 lg:grid-cols-[1fr_22rem]">
          <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
              <h2 className="text-lg font-bold text-slate-950">Mobile recharge plans</h2>
              <p className="text-sm text-slate-500">These plans appear in the user recharge form.</p>
            </div>
            <div className="divide-y divide-slate-100">
              {rechargePlans.map((plan) => (
                <div key={`${plan.operator}-${plan.name}`} className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{plan.name}</p>
                    <p className="text-sm text-slate-500">{plan.operator} SIM - {formatMoney(plan.amount)}</p>
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    className="h-9 px-3"
                    disabled={isSavingPlans || rechargePlans.length <= 1}
                    onClick={() => removeRechargePlan(plan.operator, plan.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={addRechargePlan} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-bold text-slate-950">Add plan</h2>
            <div className="mt-4 space-y-3">
              <Field label="SIM">
                <select
                  className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  value={planDraft.operator}
                  onChange={(event) => setPlanDraft({ ...planDraft, operator: event.target.value })}
                >
                  {operators.map((operator) => (
                    <option key={operator} value={operator}>{operator}</option>
                  ))}
                </select>
              </Field>
              <Field label="Plan name">
                <Input
                  required
                  value={planDraft.name}
                  onChange={(event) => setPlanDraft({ ...planDraft, name: event.target.value })}
                />
              </Field>
              <Field label="Amount">
                <Input
                  required
                  type="number"
                  min="1"
                  value={planDraft.amount}
                  onChange={(event) => setPlanDraft({ ...planDraft, amount: event.target.value })}
                />
              </Field>
              <Button type="submit" className="w-full" disabled={isSavingPlans}>
                <Plus className="h-4 w-4" />
                {isSavingPlans ? 'Saving...' : 'Add plan'}
              </Button>
            </div>
          </form>
        </section>
      )}

      {activeSection === 'deposits' && (
        <section>
          <div className="mb-5 grid gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[180px_1fr] sm:p-5">
            <div className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-200">
              <img
                src={paymentQr?.dataUrl || '/payment-qr.svg'}
                alt="Current payment QR code"
                className="aspect-square w-full object-contain"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-50 text-cyan-700">
                <QrCode className="h-5 w-5" />
              </span>
              <h2 className="mt-3 text-lg font-bold text-slate-950">Deposit payment QR</h2>
              <p className="mt-1 text-sm text-slate-500">Upload the QR shown to users when they deposit wallet money. A new upload replaces the old QR in MongoDB.</p>
              {paymentQr?.fileName && (
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  Current file: {paymentQr.fileName}
                </p>
              )}
              <label className="mt-4 inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-blue-800 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900 focus-within:outline-none focus-within:ring-4 focus-within:ring-blue-100">
                <Upload className="h-4 w-4" />
                {isSavingQr ? 'Uploading...' : 'Upload QR'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="sr-only"
                  disabled={isSavingQr}
                  onChange={uploadPaymentQr}
                />
              </label>
            </div>
          </div>
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Wallet deposit approvals</h2>
              <p className="text-sm text-slate-500">Approve a submitted transaction ID to credit the user wallet.</p>
            </div>
            <span className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
              Total wallet: {formatMoney(totalWallet)}
            </span>
          </div>
          <DepositRequestsTable deposits={allDeposits} admin />
        </section>
      )}

      {activeSection === 'bills' && (
        <section>
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Approval queue</h2>
              <p className="text-sm text-slate-500">Submitting a request debits the wallet. Rejecting a request refunds it.</p>
            </div>
            <label className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                placeholder="Search requests"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          </div>
          <BillsTable bills={filteredBills} admin />
        </section>
      )}
    </Shell>
  );
}
