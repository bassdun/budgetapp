import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Upload from './pages/Upload';
import Budget from './pages/Budget';
import AIAssistant from './pages/AIAssistant';
import BudgetSettings from './pages/BudgetSettings';
import Transactions from './pages/Transactions';
import PrivateRoute from './components/PrivateRoute';
import { initializeDatabase } from './config/database';

function App() {
  useEffect(() => {
    // Initialize database on app startup
    initializeDatabase()
      .then(() => console.log('Database initialized'))
      .catch(error => console.error('Database initialization error:', error));
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/upload" element={<PrivateRoute><Upload /></PrivateRoute>} />
            <Route path="/budget" element={<PrivateRoute><Budget /></PrivateRoute>} />
            <Route path="/budget/settings" element={<PrivateRoute><BudgetSettings /></PrivateRoute>} />
            <Route path="/assistant" element={<PrivateRoute><AIAssistant /></PrivateRoute>} />
            <Route path="/transactions" element={<PrivateRoute><Transactions /></PrivateRoute>} />
          </Routes>
        </main>
        <Toaster position="bottom-right" />
      </div>
    </Router>
  );
}

export default App; 