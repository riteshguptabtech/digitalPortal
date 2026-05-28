import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';

const STATES = ['West Bengal'];

export default function StateSelect({ value, onValueChange }) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger className="flex h-11 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100">
        <Select.Value placeholder="Select board state" />
        <Select.Icon>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="radix-select-content z-50 overflow-hidden rounded-md border border-slate-200 bg-white p-1 shadow-xl">
          <Select.Viewport>
            {STATES.map((state) => (
              <Select.Item
                key={state}
                value={state}
                className="relative flex cursor-pointer select-none items-center rounded px-8 py-2 text-sm text-slate-700 outline-none data-[highlighted]:bg-slate-100"
              >
                <Select.ItemIndicator className="absolute left-2">
                  <Check className="h-4 w-4" />
                </Select.ItemIndicator>
                <Select.ItemText>{state}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
