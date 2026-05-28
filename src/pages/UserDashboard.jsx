import { useState } from 'react';
import { BadgeCheck, Mail, Menu, MessageCircle, ReceiptText, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import BillRequestForm from '../components/bills/BillRequestForm.jsx';
import BillsTable from '../components/bills/BillsTable.jsx';
import MobileRechargeForm from '../components/bills/MobileRechargeForm.jsx';
import Shell from '../components/layout/Shell.jsx';
import UserSideMenu from '../components/layout/UserSideMenu.jsx';
import SummaryCard from '../components/ui/SummaryCard.jsx';
import DepositDialog from '../components/wallet/DepositDialog.jsx';
import DepositRequestsTable from '../components/wallet/DepositRequestsTable.jsx';
import { formatMoney } from '../utils/format.js';

const sectionMeta = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Deposit wallet money and submit service requests.',
  },
  wallet: {
    title: 'Wallet Management',
    subtitle: 'View wallet balance and add prepaid funds.',
  },
  bills: {
    title: 'Bill Requests',
    subtitle: 'Submit electricity bills and mobile recharges for admin approval.',
  },
  history: {
    title: 'Payment History',
    subtitle: 'Review your submitted bill requests and status updates.',
  },
  support: {
    title: 'Help Support',
    subtitle: 'Contact the support team for wallet, bill, or account help.',
  },
};

export default function UserDashboard() {
  const { currentUser, getUserWallet, getUserBills, getUserDeposits } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const bills = getUserBills(currentUser.id);
  const deposits = getUserDeposits(currentUser.id);
  const pendingDeposits = deposits.filter((deposit) => deposit.status === 'pending').length;
  const wallet = getUserWallet(currentUser.id);
  const activePage = sectionMeta[activeSection];

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
      <UserSideMenu
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSelectSection={setActiveSection}
        activeSection={activeSection}
        user={currentUser}
        wallet={wallet}
      />

      {activeSection === 'dashboard' && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            <SummaryCard icon={Wallet} label="Wallet balance" value={formatMoney(wallet)} accent="text-cyan-700 bg-cyan-50" action={<DepositDialog />} />
            <SummaryCard icon={ReceiptText} label="Requests raised" value={bills.length} accent="text-slate-700 bg-slate-100" />
            <SummaryCard icon={BadgeCheck} label="Pending deposits" value={pendingDeposits} accent="text-emerald-700 bg-emerald-50" />
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-4">
              <BillRequestForm />
              <MobileRechargeForm />
            </div>
            

            <section>
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-bold text-slate-950">My request history</h2>
                <span className="text-sm text-slate-500">{bills.length} records</span>
              </div>
              <BillsTable bills={bills} />
            </section>
          </div>
        </>
      )}

      {activeSection === 'wallet' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <SummaryCard icon={Wallet} label="Current balance" value={formatMoney(wallet)} accent="text-cyan-700 bg-cyan-50" action={<DepositDialog />} />
          <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-bold text-slate-950">Wallet management</h2>
            <p className="mt-2 text-sm text-slate-600">Scan the QR code, submit the transaction ID, and wait for admin approval. Approved deposits are added to your wallet.</p>
          </div>
          <section className="sm:col-span-2">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold text-slate-950">Deposit requests</h2>
              <span className="text-sm text-slate-500">{deposits.length} records</span>
            </div>
            <DepositRequestsTable deposits={deposits} />
          </section>
        </div>
      )}

      {activeSection === 'bills' && (
        <div className="grid gap-4">
          <BillRequestForm />
          <MobileRechargeForm />
          <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold text-slate-950">Your service requests</h2>
              <span className="text-sm text-slate-500">{bills.length} records</span>
            </div>
            <BillsTable bills={bills} />
          </section>
        </div>
      )}

      {activeSection === 'history' && (
        <section>
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-950">Payment history</h2>
            <p className="text-sm text-slate-500">All submitted bills, recharges, and their approval status.</p>
          </div>
          <BillsTable bills={bills} />
        </section>
      )}

      {activeSection === 'support' && (
        <section className="grid gap-4 sm:grid-cols-2">
          <a
            href="mailto:Chittad100@gmail.com"
            className="rounded-md border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cyan-200 hover:shadow-md sm:p-5"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-50 text-cyan-700">
              <Mail className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-lg font-bold text-slate-950">Email support</h2>
            <p className="mt-1 text-sm text-slate-500">Send your question or issue details by email.</p>
            <p className="mt-4 break-all text-sm font-semibold text-cyan-700">Chittad100@gmail.com</p>
          </a>

          <a
            href="https://wa.me/918346061915"
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md sm:p-5"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
              <MessageCircle className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-lg font-bold text-slate-950">WhatsApp support</h2>
            <p className="mt-1 text-sm text-slate-500">Start a WhatsApp chat with support.</p>
            <p className="mt-4 break-all text-sm font-semibold text-emerald-700">+91 83460 61915</p>
          </a>
        </section>
      )}
    </Shell>
  );
}
