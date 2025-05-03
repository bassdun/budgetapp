import Papa from 'papaparse';
import sql from '../config/database';
import openai from '../config/openai';
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
        
        // Get category using OpenAI
        const category = await categorizeTransaction(transaction.Description, amount);
        
        return {
          user_id: userId,
          date: format(date, 'yyyy-MM-dd'),
          description: transaction.Description,
          amount,
          balance: parseFloat(transaction.Balance.replace(/[^0-9.-]+/g, '')),
          category,
          source: 'FNB', // Default to FNB, could be made configurable
          flagged: category === 'Review'
        };
      })
    );

    // Save to mock database
    mockTransactions.push(...processedTransactions);
    console.log('Saved transactions:', processedTransactions);

    return processedTransactions;
  } catch (error) {
    console.error('Error processing transactions:', error);
    throw error;
  }
}

async function categorizeTransaction(description, amount) {
  try {
    console.log('Categorizing transaction:', { description, amount });
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a financial transaction categorizer. Categorize the following transaction into one of these categories: ${COMMON_CATEGORIES.join(', ')}. If you're not confident, return 'Review'.`
        },
        {
          role: "user",
          content: `Description: ${description}, Amount: ${amount}`
        }
      ],
      temperature: 0.3,
      max_tokens: 10
    });

    const category = response.choices[0].message.content.trim();
    console.log('Categorized as:', category);
    return COMMON_CATEGORIES.includes(category) ? category : 'Review';
  } catch (error) {
    console.error('Error categorizing transaction:', error);
    return 'Review';
  }
}

export async function getTransactions(userId, filters = {}) {
  try {
    console.log('Getting transactions for user:', userId, 'with filters:', filters);
    // For testing, return mock transactions
    return mockTransactions;
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw error;
  }
}

export async function getTransactionSummary(userId, startDate, endDate) {
  try {
    console.log('Getting transaction summary for user:', userId, 'from', startDate, 'to', endDate);
    // For testing, return mock summary with realistic South African amounts
    return {
      income: 25000.00, // Typical monthly salary
      spending: 15000.00, // Typical monthly expenses
      balance: 10000.00 // Remaining balance
    };
  } catch (error) {
    console.error('Error getting transaction summary:', error);
    throw error;
  }
} 