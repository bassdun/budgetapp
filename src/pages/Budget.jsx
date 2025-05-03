import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';
import { toast } from 'react-hot-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import {
  getBudgets,
  saveBudget,
  deleteBudget,
  getBudgetAnalysis,
  COMMON_CATEGORIES,
  getBudgetStatusColor,
  getBudgetStatusText
} from '../utils/budgetUtils';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function Budget() {
  const [user] = useAuthState(auth);
  const [budgets, setBudgets] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: '',
    monthlyLimit: ''
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');

      const [budgetsData, analysisData] = await Promise.all([
        getBudgets(user.uid),
        getBudgetAnalysis(user.uid, startDate, endDate)
      ]);

      setBudgets(budgetsData);
      setAnalysis(analysisData);
    } catch (error) {
      console.error('Error loading budget data:', error);
      toast.error('Error loading budget data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBudget = async () => {
    if (!newBudget.category || !newBudget.monthlyLimit) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await saveBudget(user.uid, newBudget.category, parseFloat(newBudget.monthlyLimit));
      toast.success('Budget added successfully');
      setShowAddBudget(false);
      setNewBudget({ category: '', monthlyLimit: '' });
      loadData();
    } catch (error) {
      toast.error('Error adding budget');
      console.error('Error adding budget:', error);
    }
  };

  const handleDeleteBudget = async (category) => {
    try {
      await deleteBudget(user.uid, category);
      toast.success('Budget deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Error deleting budget');
      console.error('Error deleting budget:', error);
    }
  };

  const chartData = {
    labels: Object.keys(analysis?.spendingByCategory || {}),
    datasets: [
      {
        data: Object.values(analysis?.spendingByCategory || {}).map(cat => cat.spent),
        backgroundColor: [
          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
          '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#8B5CF6'
        ]
      }
    ]
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Budget</h1>
        <button
          onClick={() => setShowAddBudget(true)}
          className="btn btn-primary flex items-center"
        >
          <FiPlus className="mr-2" />
          Add Budget
        </button>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Overview</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Budget</span>
              <span className="font-medium">R{analysis?.totalBudget.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Spent</span>
              <span className="font-medium text-red-600">
                R{analysis?.totalSpent.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-900 font-medium">Remaining</span>
              <span className={`font-medium ${
                analysis?.remaining < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                R{Math.abs(analysis?.remaining || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Daily Budget</span>
              <span className="font-medium">R{analysis?.dailyBudget.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>

        {/* Spending Distribution */}
        <div className="card md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending Distribution</h2>
          <div className="h-64">
            <Pie data={chartData} />
          </div>
        </div>
      </div>

      {/* Category Budgets */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Budgets</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {budgets.map((budget) => {
                const spent = analysis?.spendingByCategory[budget.category]?.spent || 0;
                const percentage = (spent / budget.monthly_limit) * 100;
                return (
                  <tr key={budget.category}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {budget.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      R{budget.monthly_limit.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      R{spent.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={getBudgetStatusColor(percentage)}>
                        {getBudgetStatusText(percentage)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleDeleteBudget(budget.category)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Budget Modal */}
      {showAddBudget && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Budget</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={newBudget.category}
                  onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                  className="input mt-1"
                >
                  <option value="">Select a category</option>
                  {COMMON_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Monthly Limit</label>
                <input
                  type="number"
                  value={newBudget.monthlyLimit}
                  onChange={(e) => setNewBudget({ ...newBudget, monthlyLimit: e.target.value })}
                  className="input mt-1"
                  placeholder="Enter monthly limit"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowAddBudget(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBudget}
                  className="btn btn-primary"
                >
                  Add Budget
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Budget; 