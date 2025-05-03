// For development/testing, we'll use a simple in-memory database
const transactions = [];

export const sql = {
  async query(strings, ...values) {
    // For now, just return mock data
    return transactions;
  },
  async insert(data) {
    transactions.push(...data);
    return { rowCount: data.length };
  }
};

export default sql; 