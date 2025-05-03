import { useState, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';
import { toast } from 'react-hot-toast';
import { FiUpload, FiX, FiCheck, FiFileText, FiFile } from 'react-icons/fi';
import { processTransactions } from '../utils/transactionUtils';
import { detectBankFormat, parseTransaction, BANK_FORMATS } from '../utils/bankFormats';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';

function Upload() {
  const [user] = useAuthState(auth);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [bankFormat, setBankFormat] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [fileType, setFileType] = useState(null);
  const navigate = useNavigate();

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  }, []);

  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  }, []);

  const validateAndSetFile = useCallback((file) => {
    if (!file) return;

    const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
    const isPDF = file.type === 'application/pdf' || file.name.endsWith('.pdf');

    if (isCSV || isPDF) {
      setFile(file);
      setFileType(isCSV ? 'csv' : 'pdf');
      if (isCSV) {
        parseAndPreviewCSV(file);
      } else {
        // For PDF, we'll need to extract text first
        extractAndPreviewPDF(file);
      }
    } else {
      toast.error('Please upload a CSV or PDF file');
    }
  }, []);

  const parseAndPreviewCSV = useCallback((file) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const headers = results.meta.fields;
        const detectedBank = detectBankFormat(headers);
        
        if (!detectedBank) {
          toast.error('Unsupported bank statement format');
          return;
        }

        setBankFormat(detectedBank);
        const parsedData = results.data
          .slice(0, 10) // Preview first 10 rows
          .map(row => parseTransaction(row, detectedBank))
          .filter(Boolean);

        setPreviewData(parsedData);
        setSelectedRows(new Set(parsedData.map((_, index) => index)));
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        toast.error('Error parsing CSV file');
      }
    });
  }, []);

  const extractAndPreviewPDF = useCallback(async (file) => {
    try {
      setIsProcessing(true);
      // TODO: Implement PDF text extraction
      // This would typically involve:
      // 1. Using a PDF parsing library (e.g., pdf.js)
      // 2. Extracting text content
      // 3. Parsing the text to identify transactions
      // 4. Converting to the same format as CSV transactions
      
      // For now, we'll show a message
      toast.info('PDF processing is coming soon!');
      setFile(null);
      setFileType(null);
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast.error('Error processing PDF file');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file || !user || !previewData) return;

    try {
      setIsProcessing(true);
      const transactionsToProcess = previewData.filter((_, index) => selectedRows.has(index));
      await processTransactions(transactionsToProcess, user.uid);
      toast.success('Transactions processed successfully');
      navigate('/transactions');
    } catch (error) {
      console.error('Error processing transactions:', error);
      toast.error('Error processing transactions');
    } finally {
      setIsProcessing(false);
    }
  }, [file, user, previewData, selectedRows, navigate]);

  const handleCancel = useCallback(() => {
    setFile(null);
    setPreviewData(null);
    setBankFormat(null);
    setFileType(null);
    setSelectedRows(new Set());
    navigate('/transactions');
  }, [navigate]);

  const toggleRowSelection = useCallback((index) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(index)) {
      newSelectedRows.delete(index);
    } else {
      newSelectedRows.add(index);
    }
    setSelectedRows(newSelectedRows);
  }, [selectedRows]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-primary-600">HomeBudget</h1>
              <nav className="hidden md:flex space-x-6">
                <a href="/dashboard" className="text-gray-700 hover:text-primary-600">Home</a>
                <a href="/transactions" className="text-gray-700 hover:text-primary-600">Transactions</a>
                <a href="/budget" className="text-gray-700 hover:text-primary-600">Budget</a>
                <a href="/settings" className="text-gray-700 hover:text-primary-600">Settings</a>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Import Transactions</h1>
            <p className="text-gray-600 mb-6">
              Upload your bank statement to automatically categorize your transactions.
              Supported formats: CSV (FNB, Standard Bank, ABSA) and PDF (coming soon)
            </p>

            {/* Upload Area */}
            <div
              className={`w-full rounded-xl border-2 border-dashed ${
                isDragging ? 'border-primary-600 bg-primary-50' : 'border-gray-200'
              } flex flex-col items-center justify-center gap-4 p-8 mb-6`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  {fileType === 'csv' ? (
                    <FiFileText className="w-12 h-12 text-primary-600" />
                  ) : (
                    <FiFile className="w-12 h-12 text-primary-600" />
                  )}
                  <p className="text-lg font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {fileType === 'csv' ? 'CSV File' : 'PDF File'}
                  </p>
                </div>
              ) : (
                <>
                  <FiUpload className="w-12 h-12 text-gray-400" />
                  <div className="text-center">
                    <p className="text-lg font-medium mb-2">Drop your bank statement here</p>
                    <p className="text-sm text-gray-600">or</p>
                    <label className="mt-2 inline-block">
                      <span className="text-primary-600 font-medium cursor-pointer">browse files</span>
                      <input
                        type="file"
                        accept=".csv,.pdf"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </>
              )}
            </div>

            {/* Preview Section */}
            {previewData && bankFormat && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Preview ({BANK_FORMATS[bankFormat].name})
                  </h2>
                  <span className="text-sm text-gray-500">
                    {selectedRows.size} of {previewData.length} selected
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Select
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.map((transaction, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleRowSelection(index)}
                              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                selectedRows.has(index)
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              {selectedRows.has(index) ? <FiCheck size={16} /> : <FiX size={16} />}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.date}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {transaction.description}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                            transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            R{Math.abs(transaction.amount).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || isProcessing || !selectedRows.size || fileType === 'pdf'}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  isProcessing || !selectedRows.size || fileType === 'pdf'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Import Selected Transactions'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Upload; 