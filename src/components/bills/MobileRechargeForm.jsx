import { useState } from 'react';
import { ClipboardList, Smartphone } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { formatMoney } from '../../utils/format.js';
import Button from '../ui/Button.jsx';
import Field from '../ui/Field.jsx';
import Input from '../ui/Input.jsx';

const operators = ['Jio', 'Airtel', 'Vi', 'BSNL'];
const circles = ['West Bengal', 'Kolkata', 'Bihar & Jharkhand', 'Odisha', 'Assam', 'Delhi NCR', 'Mumbai', 'Maharashtra'];
const plans = [
  { name: 'Talktime top-up', amount: 99 },
  { name: 'Data booster', amount: 149 },
  { name: 'Unlimited 28 days', amount: 299 },
  { name: 'Unlimited 56 days', amount: 579 },
];

export default function MobileRechargeForm() {
  const { rechargeDiscountPercent, submitRecharge, addToast } = useApp();
  const [recharge, setRecharge] = useState({
    mobileNumber: '',
    operator: operators[0],
    circle: circles[0],
    planName: plans[2].name,
    amount: String(plans[2].amount),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const amount = Number(recharge.amount) || 0;
  const discountAmount = Math.round((amount * rechargeDiscountPercent) / 100);
  const payableAmount = Math.max(amount - discountAmount, 0);
  const choosePlan = (planName) => {
    const plan = plans.find((item) => item.name === planName);
    setRecharge({
      ...recharge,
      planName,
      amount: plan ? String(plan.amount) : recharge.amount,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!/^[6-9]\d{9}$/.test(recharge.mobileNumber.trim())) {
      addToast('Enter a valid 10 digit mobile number', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitRecharge({
        ...recharge,
        mobileNumber: recharge.mobileNumber.trim(),
        amount,
      });
      setRecharge({
        mobileNumber: '',
        operator: operators[0],
        circle: circles[0],
        planName: plans[2].name,
        amount: String(plans[2].amount),
      });
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
          <Smartphone className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-slate-950">Mobile recharge</h2>
          <p className="text-sm text-slate-500">Recharge requests debit the wallet and enter admin approval.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Mobile number">
          <Input
            required
            inputMode="numeric"
            maxLength="10"
            pattern="[6-9][0-9]{9}"
            placeholder="9876543210"
            value={recharge.mobileNumber}
            onChange={(event) => setRecharge({ ...recharge, mobileNumber: event.target.value.replace(/\D/g, '') })}
          />
        </Field>
        <Field label="Operator">
          <select
            className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            value={recharge.operator}
            onChange={(event) => setRecharge({ ...recharge, operator: event.target.value })}
          >
            {operators.map((operator) => (
              <option key={operator} value={operator}>{operator}</option>
            ))}
          </select>
        </Field>
        <Field label="Circle">
          <select
            className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            value={recharge.circle}
            onChange={(event) => setRecharge({ ...recharge, circle: event.target.value })}
          >
            {circles.map((circle) => (
              <option key={circle} value={circle}>{circle}</option>
            ))}
          </select>
        </Field>
        <Field label="Plan">
          <select
            className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            value={recharge.planName}
            onChange={(event) => choosePlan(event.target.value)}
          >
            {plans.map((plan) => (
              <option key={plan.name} value={plan.name}>{plan.name} - {formatMoney(plan.amount)}</option>
            ))}
            <option value="Custom recharge">Custom recharge</option>
          </select>
        </Field>
        <Field label="Recharge amount">
          <Input
            required
            type="number"
            min="1"
            placeholder="299"
            value={recharge.amount}
            onChange={(event) => setRecharge({ ...recharge, amount: event.target.value, planName: 'Custom recharge' })}
          />
        </Field>
      </div>

      <div className="mt-4 grid gap-2 rounded-md bg-slate-50 p-3 text-sm text-slate-600 sm:grid-cols-3">
        <p>
          Discount
          <span className="block font-bold text-slate-950">{rechargeDiscountPercent}%</span>
        </p>
        <p>
          Savings
          <span className="block font-bold text-emerald-700">{formatMoney(discountAmount)}</span>
        </p>
        <p>
          Wallet debit
          <span className="block font-bold text-slate-950">{formatMoney(payableAmount)}</span>
        </p>
      </div>

      <div className="mt-5 flex w-full justify-end">
        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
          <ClipboardList className="h-4 w-4" />
          {isSubmitting ? 'Submitting...' : 'Submit recharge'}
        </Button>
      </div>
    </form>
  );
}
