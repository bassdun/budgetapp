import sql from '../config/database';
import { getTransactions } from './transactionUtils';

// Common transaction categories
export const COMMON_CATEGORIES = [
  'Groceries',
  'Dining',
  'Transport',
  'Entertainment',
  'Shopping',
  'Bills',
  'Healthcare',
  'Education',
  'Travel',
  'Weed',
  'Loans',
  'Savings',
  'Income',
  'Other'
];

export async function getBudgets(userId) {
  try {
    const budgets = await sql`
      SELECT * FROM budgets 
      WHERE user_id = ${userId}
    `;
    return budgets;
  } catch (error) {
    console.error('Error fetching budgets:', error);
    throw error;
  }
}

export async function saveBudget(userId, category, monthlyLimit) {
  try {
    await sql`
      INSERT INTO budgets (user_id, category, monthly_limit)
      VALUES (${userId}, ${category}, ${monthlyLimit})
      ON CONFLICT (user_id, category) 
      DO UPDATE SET monthly_limit = ${monthlyLimit}
    `;
  } catch (error) {
    console.error('Error saving budget:', error);
    throw error;
  }
}

export async function deleteBudget(userId, category) {
  try {
    await sql`
      DELETE FROM budgets 
      WHERE user_id = ${userId} AND category = ${category}
    `;
  } catch (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
}

export async function getBudgetAnalysis(userId, startDate, endDate) {
  try {
    const [budgets, transactions] = await Promise.all([
      getBudgets(userId),
      getTransactions(userId, { startDate, endDate })
    ]);

    // Create a map of category to budget
    const budgetMap = budgets.reduce((acc, budget) => {
      acc[budget.category] = budget.monthly_limit;
      return acc;
    }, {});

    // Calculate spending by category
    const spendingByCategory = transactions.reduce((acc, transaction) => {
      if (transaction.amount < 0) { // Only count expenses
        const category = transaction.category;
        if (!acc[category]) {
          acc[category] = {
            spent: 0,
            budget: budgetMap[category] || 0,
            transactions: []
          };
        }
        acc[category].spent += Math.abs(transaction.amount);
        acc[category].transactions.push(transaction);
      }
      return acc;
    }, {});

    // Calculate total spending and budget
    const totalSpent = Object.values(spendingByCategory).reduce(
      (sum, category) => sum + category.spent,
      0
    );
    const totalBudget = Object.values(budgetMap).reduce(
      (sum, limit) => sum + limit,
      0
    );

    return {
      spendingByCategory,
      totalSpent,
      totalBudget,
      remaining: totalBudget - totalSpent,
      dailyBudget: (totalBudget - totalSpent) / 
        Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
    };
  } catch (error) {
    console.error('Error analyzing budget:', error);
    throw error;
  }
}

export function getBudgetStatusColor(percentage) {
  if (percentage >= 100) return 'text-red-600';
  if (percentage >= 80) return 'text-yellow-600';
  return 'text-green-600';
}

export function getBudgetStatusText(percentage) {
  if (percentage >= 100) return 'Over Budget';
  if (percentage >= 80) return 'Approaching Limit';
  return 'Within Budget';
} 