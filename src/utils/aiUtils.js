import OpenAI from 'openai';
import { db } from '../config/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for client-side development
});

// Transaction categories specific to South African context
const CATEGORIES = [
  'Groceries',
  'Transport',
  'Utilities',
  'Entertainment',
  'Dining Out',
  'Shopping',
  'Healthcare',
  'Education',
  'Insurance',
  'Investments',
  'Savings',
  'Rent/Mortgage',
  'Bank Fees',
  'Mobile/Internet',
  'Travel',
  'Gifts',
  'Charity',
  'Other'
];

// South African specific transaction patterns
const SA_PATTERNS = {
  'Groceries': [
    'checkers',
    'pick n pay',
    'woolworths',
    'spar',
    'food lovers',
    'shoprite',
    'ok foods',
    'boxer',
    'fruit & veg city'
  ],
  'Transport': [
    'uber',
    'bolt',
    'gautrain',
    'metrorail',
    'myciti',
    'reload',
    'petrol',
    'caltex',
    'engen',
    'shell',
    'bp',
    'total'
  ],
  'Utilities': [
    'eskom',
    'city power',
    'johannesburg water',
    'cape town water',
    'durban water',
    'telkom',
    'municipality',
    'rates',
    'levies'
  ],
  'Bank Fees': [
    'fnb',
    'standard bank',
    'absa',
    'nedbank',
    'capitec',
    'transaction fee',
    'service fee',
    'monthly fee',
    'atm fee'
  ],
  'Mobile/Internet': [
    'vodacom',
    'mtn',
    'cell c',
    'telkom mobile',
    'rain',
    'afrihost',
    'webafrica',
    'cool ideas',
    'supersonic'
  ]
};

/**
 * Saves user feedback for transaction categorization
 * @param {string} userId - User ID
 * @param {Object} feedback - Feedback data
 */
export async function saveCategorizationFeedback(userId, feedback) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      categorizationFeedback: arrayUnion({
        ...feedback,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Error saving feedback:', error);
  }
}

/**
 * Gets user's previous categorization feedback
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - List of feedback entries
 */
export async function getUserCategorizationFeedback(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await userRef.get();
    return userDoc.data()?.categorizationFeedback || [];
  } catch (error) {
    console.error('Error getting feedback:', error);
    return [];
  }
}

/**
 * Categorizes a transaction description using OpenAI
 * @param {string} description - The transaction description
 * @param {Array} recentTransactions - Recent transactions for context
 * @param {Array} userFeedback - User's previous feedback
 * @returns {Promise<Object>} - Categorization result
 */
export async function categorizeTransaction(description, recentTransactions = [], userFeedback = []) {
  try {
    // First check for exact matches in SA patterns
    const lowerDescription = description.toLowerCase();
    for (const [category, patterns] of Object.entries(SA_PATTERNS)) {
      if (patterns.some(pattern => lowerDescription.includes(pattern))) {
        return {
          category,
          confidence: 1.0,
          subcategory: null,
          explanation: 'Matched South African specific pattern',
          timestamp: new Date().toISOString(),
          source: 'pattern_match'
        };
      }
    }

    const context = recentTransactions.length > 0
      ? `Recent transactions: ${JSON.stringify(recentTransactions.slice(0, 5))}`
      : 'No recent transactions for context';

    const feedbackContext = userFeedback.length > 0
      ? `User's previous categorization feedback: ${JSON.stringify(userFeedback.slice(0, 3))}`
      : 'No previous feedback available';

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a financial transaction categorizer specialized in South African transactions.
          Available categories: ${CATEGORIES.join(', ')}.
          South African specific patterns: ${JSON.stringify(SA_PATTERNS)}.
          Return a JSON object with:
          - category: The most appropriate category
          - confidence: A number between 0 and 1
          - subcategory: A more specific classification if applicable
          - explanation: Brief reasoning for the categorization
          - source: Either 'ai' or 'pattern_match'`
        },
        {
          role: "user",
          content: `Context: ${context}\nFeedback: ${feedbackContext}\nCategorize this transaction: ${description}`
        }
      ],
      temperature: 0.3,
      max_tokens: 150
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      ...result,
      timestamp: new Date().toISOString(),
      source: result.source || 'ai'
    };
  } catch (error) {
    console.error('Error categorizing transaction:', error);
    return {
      category: 'Uncategorized',
      confidence: 0.0,
      subcategory: null,
      explanation: 'Error during categorization',
      timestamp: new Date().toISOString(),
      source: 'error'
    };
  }
}

/**
 * Analyzes spending patterns using OpenAI
 * @param {Array} transactions - List of transactions
 * @returns {Promise<Object>} - Analysis results
 */
export async function analyzeSpendingPatterns(transactions) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a financial analyst specialized in South African spending patterns.
          Consider common South African expenses and financial behaviors.
          Return a JSON object with:
          - insights: Array of spending pattern insights
          - recommendations: Array of personalized recommendations
          - trends: Array of identified spending trends
          - alerts: Array of potential concerns or opportunities`
        },
        {
          role: "user",
          content: `Analyze these transactions: ${JSON.stringify(transactions)}`
        }
      ]
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing spending patterns:', error);
    return {
      insights: [],
      recommendations: [],
      trends: [],
      alerts: []
    };
  }
} 