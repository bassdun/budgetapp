import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';
import { toast } from 'react-hot-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { FiBell, FiSettings, FiUpload, FiPieChart, FiMessageSquare, FiFileText, FiUser } from 'react-icons/fi';
import { getTransactions, getTransactionSummary } from '../utils/transactionUtils';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
try {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );
  console.log('ChartJS components registered successfully');
} catch (error) {
  console.error('Error registering ChartJS components:', error);
}

// Mock data for testing
const mockTransactions = [
  {
    id: 1,
    date: new Date(),
    description: 'Grocery Store',
    amount: -50.00,
    category: 'Groceries'
  },
  {
    id: 2,
    date: new Date(),
    description: 'Salary',
    amount: 3000.00,
    category: 'Income'
  }
];

const mockSummary = {
  income: 3000.00,
  spending: 50.00,
  balance: 2950.00
};

function Dashboard() {
  console.log('Dashboard component rendering');
  
  const [user, loading, error] = useAuthState(auth);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [summary, setSummary] = useState(mockSummary);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('Auth state changed:', { user, loading, error });
  }, [user, loading, error]);

  // Mock data for the balance trend chart
  const balanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Balance',
        data: [2000, 2500, 2200, 2800, 2600, 2950],
        borderColor: 'rgb(99, 102, 241)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  if (loading) {
    console.log('Loading state active');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    console.error('Auth error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {error.message}</div>
      </div>
    );
  }

  try {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <h1 className="text-2xl font-bold text-primary-600">HomeBudget</h1>
                <nav className="hidden md:flex space-x-6">
                  <a href="#" className="text-gray-700 hover:text-primary-600">Home</a>
                  <a href="#" className="text-gray-700 hover:text-primary-600">Overview</a>
                  <a href="#" className="text-gray-700 hover:text-primary-600">Reports</a>
                  <a href="#" className="text-gray-700 hover:text-primary-600">Settings</a>
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-600 hover:text-primary-600">
                  <FiBell className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-primary-600">
                  <FiSettings className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <FiUser className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Test User</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500">Income</h3>
              <p className="text-2xl font-bold text-green-600">R{summary.income.toFixed(2)}</p>
              <p className="text-sm text-gray-500">This month</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500">Spending</h3>
              <p className="text-2xl font-bold text-red-600">R{summary.spending.toFixed(2)}</p>
              <p className="text-sm text-gray-500">This month</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500">Balance</h3>
              <p className="text-2xl font-bold text-primary-600">R{summary.balance.toFixed(2)}</p>
              <p className="text-sm text-gray-500">Current</p>
            </div>
          </div>

          {/* Balance Trend */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Balance Trend</h2>
            <div className="h-64">
              <Line data={balanceData} options={chartOptions} />
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{format(transaction.date, 'MMM d, yyyy')}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R{Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">{transaction.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Error rendering Dashboard:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error rendering dashboard: {error.message}</div>
      </div>
    );
  }
}

export default Dashboard; 