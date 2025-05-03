import { createClient } from '@neondatabase/serverless';

// Create a PostgreSQL client
const sql = process.env.VITE_DATABASE_URL
  ? createClient(process.env.VITE_DATABASE_URL)
  : createMockClient();

/**
 * Initializes the database schema if needed
 */
export async function initializeDatabase() {
  try {
    // Check if tables exist, create them if they don't
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        date DATE NOT NULL,
        description TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(100),
        source VARCHAR(100),
        flagged BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS budgets (
        user_id UUID REFERENCES users(id),
        category VARCHAR(100),
        monthly_limit DECIMAL(10,2) NOT NULL,
        PRIMARY KEY (user_id, category)
      );

      CREATE TABLE IF NOT EXISTS income (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        source VARCHAR(100) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Database schema initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
    // Continue with mock database if we can't connect to real one
  }
}

/**
 * Creates a mock database client for development/testing
 */
function createMockClient() {
  console.warn('Using mock database client');
  
  // In-memory storage
  const users = [];
  const transactions = [];
  const budgets = [];
  const income = [];
  
  return {
    // Generic query method
    async query(strings, ...values) {
      console.log('Mock SQL query:', strings.join('?'), values);
      return { rows: [] };
    },
    
    // Transaction methods
    async transactions(userId) {
      return transactions.filter(t => t.user_id === userId);
    },
    
    // Method for adding transactions
    async addTransactions(newTransactions) {
      transactions.push(...newTransactions);
      return { rowCount: newTransactions.length };
    },
    
    // Method for querying users
    async users(email) {
      return users.filter(u => u.email === email);
    },
    
    // Method for adding a user
    async addUser(user) {
      users.push(user);
      return { rows: [user] };
    }
  };
}

export default sql; 