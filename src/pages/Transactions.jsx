import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';
import { toast } from 'react-hot-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { FiQuestion, FiMessageSquare, FiEdit2 } from 'react-icons/fi';
import { getTransactions } from '../utils/transactionUtils';
import { COMMON_CATEGORIES } from '../utils/budgetUtils';

function Transactions() {
  const [user] = useAuthState(auth);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    month: format(new Date(), 'yyyy-MM'),
    category: '',
    flagged: ''
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, filters]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const startDate = format(startOfMonth(new Date(filters.month)), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(new Date(filters.month)), 'yyyy-MM-dd');

      const transactionsData = await getTransactions(user.uid, {
        startDate,
        endDate,
        category: filters.category || undefined,
        flagged: filters.flagged || undefined
      });

      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Error loading transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleEditTransaction = (transaction) => {
    // TODO: Implement edit functionality
    console.log('Edit transaction:', transaction);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

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
            <a href="/dashboard" className="text-sm font-medium">Dashboard</a>
            <a href="/transactions" className="text-sm font-medium">Transactions</a>
            <a href="/insights" className="text-sm font-medium">Insights</a>
            <a href="/settings" className="text-sm font-medium">Settings</a>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center justify-center rounded-full h-10 bg-slate-100 text-sm font-bold px-2.5">
              <FiQuestion className="w-5 h-5" />
            </button>
            <button className="flex items-center justify-center rounded-full h-10 bg-slate-100 text-sm font-bold px-2.5">
              <FiMessageSquare className="w-5 h-5" />
            </button>
          </div>
          <div className="w-10 h-10 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${user?.photoURL || 'https://ui-avatars.com/api/?name=' + user?.email})` }} />
        </div>
      </header>

      <div className="px-10 py-5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-3 mb-4">
            <h1 className="text-3xl font-bold">All transactions</h1>
            <p className="text-sm text-slate-600">Showing all transactions for this month</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-base font-medium mb-2">Month</label>
              <select
                name="month"
                value={filters.month}
                onChange={handleFilterChange}
                className="w-full rounded-xl border border-slate-200 bg-white p-4 text-base focus:outline-none focus:border-slate-300"
              >
                <option value={format(new Date(), 'yyyy-MM')}>Current Month</option>
                <option value={format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM')}>
                  Last Month
                </option>
              </select>
            </div>

            <div>
              <label className="block text-base font-medium mb-2">Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full rounded-xl border border-slate-200 bg-white p-4 text-base focus:outline-none focus:border-slate-300"
              >
                <option value="">All Categories</option>
                {COMMON_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-base font-medium mb-2">Flagged</label>
              <select
                name="flagged"
                value={filters.flagged}
                onChange={handleFilterChange}
                className="w-full rounded-xl border border-slate-200 bg-white p-4 text-base focus:outline-none focus:border-slate-300"
              >
                <option value="">All Transactions</option>
                <option value="true">Flagged Only</option>
                <option value="false">Not Flagged</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-t border-slate-200">
                    <td className="px-4 py-2 text-sm text-slate-600">
                      {format(new Date(transaction.date), 'MMM d')}
                    </td>
                    <td className="px-4 py-2 text-sm">{transaction.description}</td>
                    <td className="px-4 py-2 text-sm text-slate-600">
                      {transaction.amount >= 0 ? '+' : ''}R{Math.abs(transaction.amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-2">
                      <button className="w-full rounded-full h-8 px-4 bg-slate-100 text-sm font-medium">
                        {transaction.category}
                      </button>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEditTransaction(transaction)}
                        className="text-slate-600 text-sm font-bold tracking-wide"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-600">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Transactions; 