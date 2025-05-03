import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';
import { toast } from 'react-hot-toast';
import { FiSearch, FiMessageCircle } from 'react-icons/fi';

const CATEGORIES = [
  { name: 'Groceries', amount: 300 },
  { name: 'Restaurants', amount: 100 },
  { name: 'Clothing', amount: 150 },
  { name: 'Transportation', amount: 80 },
  { name: 'Hobbies', amount: 120 },
  { name: 'Health', amount: 50 },
  { name: 'Entertainment', amount: 60 },
  { name: 'Travel', amount: 100 },
  { name: 'Education', amount: 70 },
  { name: 'Charity', amount: 40 }
];

function BudgetSettings() {
  const [user] = useAuthState(auth);
  const [budgets, setBudgets] = useState(CATEGORIES);
  const [viewMode, setViewMode] = useState('essential');
  const [defaultAmount, setDefaultAmount] = useState('200');

  const handleSave = async () => {
    try {
      // TODO: Implement save to database
      toast.success('Budget settings saved successfully');
    } catch (error) {
      console.error('Error saving budget settings:', error);
      toast.error('Error saving budget settings');
    }
  };

  const handleSetAll = (amount) => {
    setBudgets(prev => prev.map(budget => ({
      ...budget,
      amount: parseInt(amount.replace('$', ''))
    })));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 px-10 py-3">
        <div className="flex items-center gap-4">
          <div className="w-4 h-4">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold">Budget Tracker</h2>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-9">
            <a href="#" className="text-sm font-medium">Overview</a>
            <a href="#" className="text-sm font-medium">Spending</a>
            <a href="#" className="text-sm font-medium">Income</a>
            <a href="#" className="text-sm font-medium">Saving</a>
            <a href="#" className="text-sm font-medium">Settings</a>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center justify-center rounded-full h-10 px-2.5 bg-slate-100">
              <FiSearch className="w-5 h-5" />
            </button>
            <button className="flex items-center justify-center rounded-full h-10 px-2.5 bg-slate-100">
              <FiMessageCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="px-40 flex flex-1 justify-center py-5">
        <div className="w-[512px] max-w-[512px] py-5">
          <div className="flex flex-col gap-3 p-4">
            <h1 className="text-3xl font-bold">Set your monthly limits</h1>
            <p className="text-sm text-slate-600">
              Set your monthly limits for each category. We'll help you stick to your plan.
            </p>
          </div>

          <h3 className="text-lg font-bold px-4 pb-2 pt-4">Set limits</h3>
          <div className="p-4 grid grid-cols-2 gap-4">
            {budgets.map((budget, index) => (
              <div key={budget.name} className={`flex flex-col gap-1 border-t border-slate-200 py-4 ${index % 2 === 0 ? 'pr-2' : 'pl-2'}`}>
                <p className="text-sm text-slate-600">{budget.name}</p>
                <p className="text-sm">${budget.amount}</p>
              </div>
            ))}
          </div>

          <div className="px-4 py-3">
            <div className="flex items-end gap-4">
              <div className="flex flex-col flex-1">
                <p className="text-base font-medium pb-2">Set all to</p>
                <select
                  value={defaultAmount}
                  onChange={(e) => handleSetAll(e.target.value)}
                  className="w-full h-14 rounded-xl bg-slate-100 px-4 text-base focus:outline-none focus:ring-0 border-none"
                >
                  <option value="200">$200</option>
                  <option value="300">$300</option>
                  <option value="400">$400</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 p-4">
            <label className="flex items-center justify-center rounded-xl border border-slate-200 px-4 h-11 cursor-pointer">
              <input
                type="radio"
                name="viewMode"
                value="essential"
                checked={viewMode === 'essential'}
                onChange={() => setViewMode('essential')}
                className="hidden"
              />
              <span className="text-sm font-medium">Essential vs Non-Essential</span>
            </label>
            <label className="flex items-center justify-center rounded-xl border border-slate-200 px-4 h-11 cursor-pointer">
              <input
                type="radio"
                name="viewMode"
                value="custom"
                checked={viewMode === 'custom'}
                onChange={() => setViewMode('custom')}
                className="hidden"
              />
              <span className="text-sm font-medium">Custom</span>
            </label>
          </div>
        </div>
      </div>

      <footer className="flex justify-center">
        <div className="w-[512px] max-w-[512px]">
          <div className="px-4 py-3">
            <button
              onClick={handleSave}
              className="flex items-center justify-center rounded-full h-10 px-4 bg-primary-600 text-white text-sm font-bold w-full"
            >
              Save
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default BudgetSettings; 