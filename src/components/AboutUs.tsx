import React from 'react';
import { ArrowLeft, Code, Heart, Target } from 'lucide-react';

interface AboutUsProps {
  onBack: () => void;
}

const AboutUs: React.FC<AboutUsProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-300">
        <div className="flex items-center px-6 py-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="ml-3 text-xl font-bold text-gray-900 dark:text-white">About Us</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* App Introduction */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm text-center transition-colors duration-300">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Expense Tracker</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            A simple, intuitive, and powerful expense tracking application designed to help you 
            take control of your finances. Track your daily expenses and income with just a few taps, 
            and gain valuable insights into your spending patterns.
          </p>
        </div>

        {/* Features */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <Target size={24} className="text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Key Features</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Quick Entry</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Add expenses and income with a simple counter interface</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Multi-Currency</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Support for multiple international currencies</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Detailed History</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">View transactions by month with comprehensive stats</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Smart Insights</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get personalized recommendations based on your spending</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Offline Storage</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">All data stored locally for privacy and speed</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Responsive Design</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Works seamlessly on all devices</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Developer Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <Code size={24} className="text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Development</h3>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Code size={32} className="text-white" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              This application was built with modern web technologies including React, TypeScript, 
              and Tailwind CSS. It follows best practices for performance, accessibility, and user experience.
            </p>
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Developer</h4>
              <p className="text-gray-600 dark:text-gray-300">Abhinav Vinod</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">CSE Student, Mar Athanasius College of Engineering</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Kothamangalam, Kerala, India</p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Built with ❤️ for better financial management
            </p>
          </div>
        </div>

        {/* Version Info */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white text-center">
          <p className="font-semibold mb-2">Expense Tracker v2.0</p>
          <p className="text-sm opacity-90">
            © 2025 • Built for simple and effective expense tracking
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;