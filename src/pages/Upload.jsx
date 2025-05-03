import { useState, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';
import { toast } from 'react-hot-toast';
import { FiUpload } from 'react-icons/fi';
import { processTransactions } from '../utils/transactionUtils';
import { useNavigate } from 'react-router-dom';

function Upload() {
  const [user] = useAuthState(auth);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
    if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
      setFile(droppedFile);
    } else {
      toast.error('Please upload a CSV file');
    }
  }, []);

  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv'))) {
      setFile(selectedFile);
    } else {
      toast.error('Please upload a CSV file');
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file || !user) return;

    try {
      setIsProcessing(true);
      await processTransactions(file, user.uid);
      toast.success('Transactions processed successfully');
      navigate('/transactions');
    } catch (error) {
      console.error('Error processing transactions:', error);
      toast.error('Error processing transactions');
    } finally {
      setIsProcessing(false);
    }
  }, [file, user, navigate]);

  const handleCancel = useCallback(() => {
    setFile(null);
    navigate('/transactions');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 px-10 py-3">
        <div className="flex items-center gap-4">
          <div className="w-4 h-4">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold">Budget Tracker</h2>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-9">
            <a href="/dashboard" className="text-sm font-medium">Home</a>
            <a href="/transactions" className="text-sm font-medium">Transactions</a>
            <a href="/reports" className="text-sm font-medium">Reports</a>
            <a href="/budgets" className="text-sm font-medium">Budgets</a>
            <a href="/goals" className="text-sm font-medium">Goals</a>
            <a href="/accounts" className="text-sm font-medium">Accounts</a>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center justify-center rounded-full h-10 px-4 bg-primary-600 text-white text-sm font-bold">
              Add Money
            </button>
            <button className="flex items-center justify-center rounded-full h-10 px-4 bg-slate-100 text-sm font-bold">
              Invite
            </button>
          </div>
          <div className="w-10 h-10 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${user?.photoURL || 'https://ui-avatars.com/api/?name=' + user?.email})` }} />
        </div>
      </header>

      <div className="px-40 flex flex-1 justify-center py-5">
        <div className="w-[512px] max-w-[512px] py-5">
          <div className="flex flex-col gap-3 p-4">
            <h1 className="text-3xl font-bold">Import transactions</h1>
            <p className="text-base text-slate-600">
              Drag and drop a CSV or Excel file to upload your transactions. We'll automatically categorise your transactions based on the data in your file.
            </p>
          </div>

          <div className="p-4">
            <div
              className={`w-full aspect-square rounded-xl border-2 border-dashed ${
                isDragging ? 'border-primary-600 bg-primary-50' : 'border-slate-200'
              } flex flex-col items-center justify-center gap-4 p-8`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FiUpload className="w-12 h-12 text-slate-400" />
              <div className="text-center">
                <p className="text-lg font-medium mb-2">Drop your file here</p>
                <p className="text-sm text-slate-600">or</p>
                <label className="mt-2 inline-block">
                  <span className="text-primary-600 font-medium cursor-pointer">browse files</span>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-4">
            <button
              onClick={handleCancel}
              className="flex items-center justify-center rounded-full h-10 px-4 bg-transparent text-sm font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || isProcessing}
              className={`flex items-center justify-center rounded-full h-10 px-4 text-white text-sm font-bold ${
                isProcessing ? 'bg-slate-400' : 'bg-primary-600'
              }`}
            >
              {isProcessing ? 'Processing...' : 'Auto-Categorise with AI'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Upload; 