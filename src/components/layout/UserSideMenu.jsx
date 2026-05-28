import { ClipboardList, Headphones, LayoutDashboard, ReceiptText, Wallet, X } from 'lucide-react';
import { formatMoney } from '../../utils/format.js';

export default function UserSideMenu({ open, onClose, onSelectSection, activeSection, user, wallet }) {
  const menuItems = [
    ['dashboard', 'Dashboard', LayoutDashboard],
    ['wallet', 'Wallet Management', Wallet],
    ['bills', 'Bill Requests', ReceiptText],
    ['history', 'Payment History', ClipboardList],
    ['support', 'Help Support', Headphones],
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
            <p className="text-sm text-slate-500">{formatMoney(wallet)}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-slate-500 hover:bg-slate-100" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">Services Pages</p>
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
