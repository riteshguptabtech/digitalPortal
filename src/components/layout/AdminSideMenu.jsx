import { BadgePercent, ClipboardList, LayoutDashboard, WalletCards, X } from 'lucide-react';

export default function AdminSideMenu({ open, onClose, onSelectSection, activeSection, user, pendingBills, pendingDeposits }) {
  const menuItems = [
    ['overview', 'Overview', LayoutDashboard],
    ['deposits', `Deposit Approvals (${pendingDeposits})`, WalletCards],
    ['bills', `Bill Approvals (${pendingBills})`, ClipboardList],
    ['discount', 'Discounts', BadgePercent],
  ];

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/40 transition ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        aria-label="Close menu overlay"
      />
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[min(82vw,19rem)] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-start justify-between border-b border-slate-200 p-5">
          <div>
            <img src="/das-digital-logo.jpeg" alt="DAS Digital Profile" className="h-14 w-14 rounded-full object-cover ring-1 ring-blue-200" />
            <p className="mt-4 text-sm font-bold uppercase text-slate-800">{user.name}</p>
            <p className="text-sm capitalize text-slate-500">{user.role}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-slate-500 hover:bg-slate-100" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">Admin Pages</p>
          <nav className="space-y-1">
            {menuItems.map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onSelectSection(key);
                  onClose();
                }}
                className={`flex h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium ${activeSection === key ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <Icon className="h-5 w-5 text-blue-800" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
