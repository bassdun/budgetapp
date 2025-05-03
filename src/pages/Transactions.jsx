import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';
import { getTransactions } from '../utils/transactionUtils';
import { format } from 'date-fns';
import { FiFilter, FiSearch, FiEdit, FiTrash2, FiDownload, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import TransactionFeedback from '../components/TransactionFeedback';

function Transactions() {
  const [user, loading] = useAuthState(auth);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    category: '',
    minAmount: '',
    maxAmount: ''
  });

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user, currentPage]);

  const loadTransactions = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Add pagination limit
      const pageFilters = {
        ...filters,
        limit: 10,
        offset: (currentPage - 1) * 10
      };
      
      const result = await getTransactions(user.uid, pageFilters);
      setTransactions(result);
      
      // For a real app, we'd fetch the count separately
      // For now, assume we have more if we got a full page
      setTotalPages(Math.max(1, Math.ceil(result.length / 10)));
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const applyFilters = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when filtering
    loadTransactions();
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      startDate: '',
      endDate: '',
      category: '',
      minAmount: '',
      maxAmount: ''
    });
    setCurrentPage(1);
    loadTransactions();
  };

  const exportTransactions = () => {
    // Create CSV content
    const headers = ['Date', 'Description', 'Amount', 'Category'];
    const rows = transactions.map(t => [
      format(new Date(t.date), 'yyyy-MM-dd'),
      t.description,
      t.amount,
      t.category
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    toast.success('Transactions exported successfully');
  };

  const deleteTransaction = async (transactionId) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      // Delete logic would go here
      // await deleteTransaction(transactionId);
      
      // For now, just filter locally
      setTransactions(transactions.filter(t => t.id !== transactionId));
      toast.success('Transaction deleted');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  const handleFeedbackSubmitted = (newCategory) => {
    if (selectedTransaction) {
      // Update the local state
      setTransactions(transactions.map(t => 
        t.id === selectedTransaction.id ? { ...t, category: newCategory } : t
      ));
      
      setShowFeedback(false);
      setSelectedTransaction(null);
      toast.success('Transaction category updated');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center text-sm"
          >
            <FiFilter className="mr-2" />
            Filters
          </button>
          <button
            onClick={exportTransactions}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center text-sm"
          >
            <FiDownload className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  id="search"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search transactions..."
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="px-3 py-2 w-full border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="px-3 py-2 w-full border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="px-3 py-2 w-full border border-gray-300 rounded-md"
              >
                <option value="">All Categories</option>
                <option value="Groceries">Groceries</option>
                <option value="Transport">Transport</option>
                <option value="Utilities">Utilities</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Dining Out">Dining Out</option>
                <option value="Shopping">Shopping</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Insurance">Insurance</option>
                <option value="Investments">Investments</option>
                <option value="Savings">Savings</option>
                <option value="Rent/Mortgage">Rent/Mortgage</option>
                <option value="Bank Fees">Bank Fees</option>
                <option value="Mobile/Internet">Mobile/Internet</option>
                <option value="Travel">Travel</option>
                <option value="Gifts">Gifts</option>
                <option value="Charity">Charity</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="minAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Min Amount
              </label>
              <input
                type="number"
                id="minAmount"
                name="minAmount"
                value={filters.minAmount}
                onChange={handleFilterChange}
                placeholder="0"
                className="px-3 py-2 w-full border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label htmlFor="maxAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Max Amount
              </label>
              <input
                type="number"
                id="maxAmount"
                name="maxAmount"
                value={filters.maxAmount}
                onChange={handleFilterChange}
                placeholder="1000"
                className="px-3 py-2 w-full border border-gray-300 rounded-md"
              />
            </div>
            <div className="md:col-span-3 flex justify-end space-x-2">
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                Apply Filters
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(transaction.date), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-sm truncate">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {transaction.category}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                      transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      R{Math.abs(transaction.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowFeedback(true);
                          }}
                          className="text-primary-600 hover:text-primary-900"
                          title="Categorize"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => deleteTransaction(transaction.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-500 mb-4">No transactions found</p>
            <a href="/upload" className="text-primary-600 font-medium">
              Upload transactions
            </a>
          </div>
        )}
      </div>

      {/* Pagination */}
      {transactions.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{transactions.length}</span> transactions
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 border rounded-md ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 border rounded-md ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">Edit Transaction Category</h3>
              <button 
                onClick={() => {
                  setShowFeedback(false);
                  setSelectedTransaction(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="p-4">
              <TransactionFeedback 
                transaction={selectedTransaction} 
                onFeedbackSubmitted={handleFeedbackSubmitted} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions; 