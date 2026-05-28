import { statusStyles } from '../../utils/format';

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${statusStyles[status]}`}>
      {status}
    </span>
  );
}
