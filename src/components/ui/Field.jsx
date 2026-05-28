import * as Label from '@radix-ui/react-label';

export default function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <Label.Root className="text-sm font-semibold text-slate-700">{label}</Label.Root>
      {children}
    </div>
  );
}
