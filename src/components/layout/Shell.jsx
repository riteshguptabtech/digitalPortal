import { BellElectric, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import Button from '../ui/Button.jsx';
import Toasts from '../ui/Toasts.jsx';

export default function Shell({ title, subtitle, children, logoSrc, leadingAction }) {
  const { currentUser, logout } = useApp();

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:py-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            {leadingAction}
            {logoSrc ? (
              <img src={logoSrc} alt="DAS Digital Profile" className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-cyan-200 sm:h-11 sm:w-11" />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-950 text-cyan-300 sm:h-11 sm:w-11">
                <BellElectric className="h-5 w-5 sm:h-6 sm:w-6" />
              </span>
            )}
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold text-slate-950 sm:text-base lg:text-xl">{title}</h1>
              <p className="hidden text-xs text-slate-500 sm:block lg:text-sm">{subtitle}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            <div className="hidden rounded-md bg-slate-100 px-2 py-1 text-xs sm:block sm:px-3 sm:py-2 sm:text-sm">
              <span className="font-semibold text-slate-900">{currentUser.name}</span>
              <span className="ml-1 capitalize text-slate-500 sm:ml-2">{currentUser.role}</span>
            </div>
            <Button variant="secondary" className="h-8 px-2 sm:h-10 sm:px-4" onClick={logout}>
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">{children}</div>
      <Toasts />
    </main>
  );
}
