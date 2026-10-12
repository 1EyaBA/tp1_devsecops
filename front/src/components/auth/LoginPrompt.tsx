import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, LogIn, UserPlus } from 'lucide-react';

interface LoginPromptProps {
  message?: string;
  redirectPath?: string;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({
  message = "Please log in to access this content",
  redirectPath = "/SignIn"
}) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate(redirectPath);
  };


   const handleSignUp = () => {
    navigate('/signUp');
    }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-indigo-100 dark:border-indigo-900">
        <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-8 flex items-center justify-center">
          <div className="h-20 w-20 rounded-full bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center shadow-inner border border-white border-opacity-30">
            <AlertCircle className="h-10 w-10 text-white" />
          </div>
        </div>
        
        <div className="p-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3 text-center">
            {message}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-center">
            Create an account or sign in to view your reviews and personalized content
          </p>
          
          <div className="flex flex-col space-y-4">
            <button 
              onClick={handleLogin}
              className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-md font-medium transition-colors duration-200 shadow-sm"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Log In
            </button>
            
            <button 
              onClick={handleSignUp}
              className="w-full flex items-center justify-center bg-white hover:bg-gray-50 text-indigo-600 border border-indigo-200 dark:bg-gray-700 dark:border-indigo-800 dark:hover:bg-gray-600 dark:text-indigo-300 py-3 px-6 rounded-md font-medium transition-colors duration-200 shadow-sm"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Create Account
            </button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt;