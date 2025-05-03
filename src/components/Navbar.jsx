import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { toast } from 'react-hot-toast';
import { FiHome, FiUpload, FiPieChart, FiMessageSquare, FiSettings, FiLogOut } from 'react-icons/fi';

function Navbar() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Error signing out');
      console.error('Sign out error:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary-600">
              HomeBudget
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="flex items-center px-3 py-2 text-gray-700 hover:text-primary-600">
              <FiHome className="mr-2" />
              Dashboard
            </Link>
            <Link to="/upload" className="flex items-center px-3 py-2 text-gray-700 hover:text-primary-600">
              <FiUpload className="mr-2" />
              Upload
            </Link>
            <Link to="/budget" className="flex items-center px-3 py-2 text-gray-700 hover:text-primary-600">
              <FiPieChart className="mr-2" />
              Budget
            </Link>
            <Link to="/budget/settings" className="flex items-center px-3 py-2 text-gray-700 hover:text-primary-600">
              <FiSettings className="mr-2" />
              Budget Settings
            </Link>
            <Link to="/assistant" className="flex items-center px-3 py-2 text-gray-700 hover:text-primary-600">
              <FiMessageSquare className="mr-2" />
              Assistant
            </Link>
            <div className="flex items-center px-3 py-2 text-gray-700">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
                T
              </div>
              <span className="ml-2">Test User</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center px-3 py-2 text-gray-700 hover:text-primary-600"
            >
              <FiLogOut className="mr-2" />
              Sign Out
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-primary-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 