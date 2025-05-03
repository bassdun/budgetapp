import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';
import { saveCategorizationFeedback } from '../utils/aiUtils';
import { toast } from 'react-hot-toast';

function TransactionFeedback({ transaction, onFeedbackSubmitted }) {
  const [user] = useAuthState(auth);
  const [selectedCategory, setSelectedCategory] = useState(transaction.category);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !selectedCategory) return;

    try {
      setIsSubmitting(true);
      await saveCategorizationFeedback(user.uid, {
        originalDescription: transaction.description,
        originalCategory: transaction.category,
        correctedCategory: selectedCategory,
        confidence: transaction.confidence,
        source: transaction.source
      });
      
      toast.success('Feedback submitted successfully');
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(selectedCategory);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Help improve categorization
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Was this transaction categorized correctly? If not, please select the correct category.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transaction Description
          </label>
          <p className="text-sm text-gray-900 bg-white p-2 rounded border">
            {transaction.description}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Category
          </label>
          <p className="text-sm text-gray-900 bg-white p-2 rounded border">
            {transaction.category} ({Math.round(transaction.confidence * 100)}% confidence)
          </p>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Correct Category
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="">Select a category</option>
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

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !selectedCategory}
            className={`inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              isSubmitting || !selectedCategory ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TransactionFeedback; 