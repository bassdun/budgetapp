// Bank statement format configurations
export const BANK_FORMATS = {
  FNB: {
    name: 'First National Bank',
    dateFormat: 'yyyy/MM/dd',
    columns: {
      date: 'Date',
      description: 'Description',
      amount: 'Amount',
      balance: 'Balance'
    },
    amountFormat: (amount) => parseFloat(amount.replace(/[^0-9.-]+/g, '')),
    balanceFormat: (balance) => parseFloat(balance.replace(/[^0-9.-]+/g, ''))
  },
  STANDARD_BANK: {
    name: 'Standard Bank',
    dateFormat: 'dd/MM/yyyy',
    columns: {
      date: 'Transaction Date',
      description: 'Transaction Description',
      amount: 'Transaction Amount',
      balance: 'Balance'
    },
    amountFormat: (amount) => parseFloat(amount.replace(/[^0-9.-]+/g, '')),
    balanceFormat: (balance) => parseFloat(balance.replace(/[^0-9.-]+/g, ''))
  },
  ABSA: {
    name: 'ABSA',
    dateFormat: 'dd/MM/yyyy',
    columns: {
      date: 'Transaction Date',
      description: 'Transaction Description',
      amount: 'Amount',
      balance: 'Balance'
    },
    amountFormat: (amount) => parseFloat(amount.replace(/[^0-9.-]+/g, '')),
    balanceFormat: (balance) => parseFloat(balance.replace(/[^0-9.-]+/g, ''))
  }
};

// Detect bank format from CSV headers
export function detectBankFormat(headers) {
  for (const [bank, format] of Object.entries(BANK_FORMATS)) {
    const requiredColumns = Object.values(format.columns);
    if (requiredColumns.every(col => headers.includes(col))) {
      return bank;
    }
  }
  return null;
}

// Parse transaction data according to bank format
export function parseTransaction(row, bankFormat) {
  const format = BANK_FORMATS[bankFormat];
  if (!format) return null;

  return {
    date: row[format.columns.date],
    description: row[format.columns.description],
    amount: format.amountFormat(row[format.columns.amount]),
    balance: format.balanceFormat(row[format.columns.balance])
  };
} 