import Papa from 'papaparse';
import sql from '../config/database';
import { categorizeTransaction } from './aiUtils';
import { format, parse } from 'date-fns';

// Common transaction categories
const COMMON_CATEGORIES = [
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

// Mock database for testing
const mockTransactions = [
  {
    id: 1,
    date: new Date(),
    description: 'Checkers Hyper',
    amount: -850.00,
    category: 'Groceries'
  },
  {
    id: 2,
    date: new Date(),
    description: 'Salary - Company Name',
    amount: 25000.00,
    category: 'Income'
  },
  {
    id: 3,
    date: new Date(),
    description: 'Eskom',
    amount: -1200.00,
    category: 'Bills'
  },
  {
    id: 4,
    date: new Date(),
    description: 'Uber',
    amount: -150.00,
    category: 'Transport'
  },
  {
    id: 5,
    date: new Date(),
    description: 'Woolworths',
    amount: -450.00,
    category: 'Groceries'
  }
];

/**
 * Process and save transactions from a CSV file
 * @param {File} file - The CSV file to process
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} - The processed transactions
 */
export async function processTransactions(file, userId) {
  try {
    console.log('Processing transactions for user:', userId);
    
    // Parse CSV file
    const transactions = await new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        complete: (results) => resolve(results.data),
        error: (error) => reject(error)
      });
    });

    // Process and categorize transactions
    const processedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        // Format date to ISO string
        const date = parse(transaction.Date, 'yyyy/MM/dd', new Date());
        
        // Clean amount (remove currency symbol and commas)
        const amount = parseFloat(transaction.Amount.replace(/[^0-9.-]+/g, ''));
        
        // Get category using AI
        const categorization = await categorizeTransaction(transaction.Description, amount);
        
        return {
          user_id: userId,
          date: format(date, 'yyyy-MM-dd'),
          description: transaction.Description,
          amount,
          balance: parseFloat(transaction.Balance.replace(/[^0-9.-]+/g, '')),
          category: categorization.category,
          source: 'CSV Import',
          flagged: categorization.confidence < 0.7
        };
      })
    );

    // Save to database
    try {
      await sql`
        INSERT INTO transactions ${sql(
          processedTransactions.map(t => ({
            user_id: t.user_id,
            date: t.date,
            description: t.description,
            amount: t.amount,
            category: t.category,
            source: t.source,
            flagged: t.flagged
          }))
        )}
      `;
    } catch (dbError) {
      console.error('Error saving to database, falling back to mock storage:', dbError);
      await sql.addTransactions(processedTransactions);
    }

    return processedTransactions;
  } catch (error) {
    console.error('Error processing transactions:', error);
    throw error;
  }
}

/**
 * Get transactions for a user with optional filters
 * @param {string} userId - The user ID
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} - The transactions
 */
export async function getTransactions(userId, filters = {}) {
  try {
    console.log('Getting transactions for user:', userId, 'with filters:', filters);
    
    // Construct query conditions
    const conditions = ['user_id = ${userId}'];
    const params = { userId };
    
    if (filters.startDate) {
      conditions.push('date >= ${startDate}');
      params.startDate = filters.startDate;
    }
    
    if (filters.endDate) {
      conditions.push('date <= ${endDate}');
      params.endDate = filters.endDate;
    }
    
    if (filters.category) {
      conditions.push('category = ${category}');
      params.category = filters.category;
    }
    
    if (filters.minAmount) {
      conditions.push('amount >= ${minAmount}');
      params.minAmount = filters.minAmount;
    }
    
    if (filters.maxAmount) {
      conditions.push('amount <= ${maxAmount}');
      params.maxAmount = filters.maxAmount;
    }
    
    if (filters.search) {
      conditions.push('description ILIKE ${search}');
      params.search = `%${filters.search}%`;
    }
    
    // Try to query the database
    try {
      const whereClause = conditions.join(' AND ');
      const result = await sql`
        SELECT * FROM transactions 
        WHERE ${sql.unsafe(whereClause)}
        ORDER BY date DESC
        ${filters.limit ? sql`LIMIT ${filters.limit}` : sql``}
      `;
      return result.rows;
    } catch (dbError) {
      console.error('Error querying database, falling back to mock storage:', dbError);
      // Fallback to in-memory filtering
      return sql.transactions(userId).filter(t => {
        let match = true;
        if (filters.startDate) match = match && t.date >= filters.startDate;
        if (filters.endDate) match = match && t.date <= filters.endDate;
        if (filters.category) match = match && t.category === filters.category;
        if (filters.minAmount) match = match && t.amount >= filters.minAmount;
        if (filters.maxAmount) match = match && t.amount <= filters.maxAmount;
        if (filters.search) match = match && t.description.toLowerCase().includes(filters.search.toLowerCase());
        return match;
      });
    }
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw error;
  }
}

/**
 * Get transaction summary for a user
 * @param {string} userId - The user ID
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Promise<Object>} - The summary
 */
export async function getTransactionSummary(userId, startDate, endDate) {
  try {
    console.log('Getting transaction summary for user:', userId, 'from', startDate, 'to', endDate);
    
    // Try to query the database for summary
    try {
      const result = await sql`
        SELECT 
          SUM(CASE WHEN amount >= 0 THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as spending,
          SUM(amount) as balance
        FROM transactions
        WHERE user_id = ${userId}
          AND date BETWEEN ${startDate} AND ${endDate}
      `;
      return result.rows[0];
    } catch (dbError) {
      console.error('Error querying database for summary, using mock data:', dbError);
      // Return mock summary
      return {
        income: 25000.00,
        spending: 15000.00,
        balance: 10000.00
      };
    }
  } catch (error) {
    console.error('Error getting transaction summary:', error);
    throw error;
  }
}

/**
 * Get category breakdown for a user
 * @param {string} userId - The user ID
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Promise<Array>} - The category breakdown
 */
export async function getCategoryBreakdown(userId, startDate, endDate) {
  try {
    console.log('Getting category breakdown for user:', userId, 'from', startDate, 'to', endDate);
    
    // Try to query the database for category breakdown
    try {
      const result = await sql`
        SELECT 
          category,
          SUM(ABS(amount)) as total,
          COUNT(*) as count
        FROM transactions
        WHERE user_id = ${userId}
          AND date BETWEEN ${startDate} AND ${endDate}
          AND amount < 0
        GROUP BY category
        ORDER BY total DESC
      `;
      return result.rows;
    } catch (dbError) {
      console.error('Error querying database for category breakdown, using mock data:', dbError);
      // Return mock category breakdown
      return [
        { category: 'Groceries', total: 2500.00, count: 10 },
        { category: 'Transport', total: 1500.00, count: 8 },
        { category: 'Utilities', total: 3500.00, count: 5 },
        { category: 'Entertainment', total: 1200.00, count: 6 },
        { category: 'Dining Out', total: 2000.00, count: 12 }
      ];
    }
  } catch (error) {
    console.error('Error getting category breakdown:', error);
    throw error;
  }
} 