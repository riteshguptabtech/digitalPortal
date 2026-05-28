export default function SummaryCard({ icon: Icon, label, value, accent, action }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${accent} sm:h-11 sm:w-11`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </span>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-500 sm:mt-4">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">{value}</p>
    </div>
  );
}
