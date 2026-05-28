import { useApp } from '../../context/AppContext.jsx';

export default function Toasts() {
  const { toasts } = useApp();

  return (
    <div className="fixed right-2 top-2 z-50 space-y-3 sm:right-5 sm:top-5 sm:space-y-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`w-[calc(100vw-1rem)] max-w-[28rem] rounded-md border-2 bg-white p-4 text-base font-bold leading-6 shadow-2xl sm:p-5 sm:text-lg ${
            toast.type === 'error' ? 'border-rose-200 text-rose-800' : 'border-emerald-200 text-emerald-800'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
