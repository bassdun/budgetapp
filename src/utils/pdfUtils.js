import pdfParse from 'pdf-parse';

/**
 * Extracts text content from a PDF file
 * @param {File} pdfFile - The PDF file to process
 * @returns {Promise<string>} - The extracted text content
 */
export const extractTextFromPDF = async (pdfFile) => {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const pdfData = await pdfParse(data);
    return pdfData.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

/**
 * Parses FNB bank statement text into transactions
 * @param {string} text - The extracted text from the PDF
 * @returns {Array} - Array of parsed transactions
 */
const parseFNBStatement = (text) => {
  // FNB PDF statements typically have transactions in a specific format
  // Example pattern: "DD/MM/YYYY Description Amount"
  const transactionRegex = /(\d{2}\/\d{2}\/\d{4})\s+(.*?)\s+([-+]?\d+\.\d{2})/g;
  
  const transactions = [];
  let match;
  
  while ((match = transactionRegex.exec(text)) !== null) {
    const [_, date, description, amount] = match;
    
    // Clean up the description
    const cleanDescription = description
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
    
    // Convert amount to number
    const numericAmount = parseFloat(amount);
    
    // Create transaction object
    transactions.push({
      date,
      description: cleanDescription,
      amount: numericAmount,
      type: numericAmount >= 0 ? 'credit' : 'debit',
      bank: 'FNB'
    });
  }
  
  return transactions;
};

/**
 * Parses bank statement text into transactions
 * @param {string} text - The extracted text from the PDF
 * @param {string} bankName - The name of the bank
 * @returns {Array} - Array of parsed transactions
 */
export const parseBankStatement = (text, bankName) => {
  try {
    switch (bankName.toLowerCase()) {
      case 'fnb':
        return parseFNBStatement(text);
      // Add cases for other banks here
      default:
        throw new Error(`Unsupported bank format: ${bankName}`);
    }
  } catch (error) {
    console.error('Error parsing bank statement:', error);
    throw new Error('Failed to parse bank statement');
  }
};

/**
 * Validates if the extracted text matches the expected bank format
 * @param {string} text - The extracted text from the PDF
 * @param {string} bankName - The name of the bank
 * @returns {boolean} - Whether the text matches the expected format
 */
export const validateBankStatement = (text, bankName) => {
  try {
    switch (bankName.toLowerCase()) {
      case 'fnb':
        // Check for FNB-specific markers in the text
        return text.includes('First National Bank') || 
               text.includes('FNB Statement') ||
               text.includes('Account Number');
      // Add validation for other banks here
      default:
        return false;
    }
  } catch (error) {
    console.error('Error validating bank statement:', error);
    return false;
  }
}; 