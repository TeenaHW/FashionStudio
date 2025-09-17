import React, { useState } from 'react';
import { Download } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../lib/api';
import toast from 'react-hot-toast';

const Reports = () => {
  const [loading, setLoading] = useState({ balanceSheet: false, profitLoss: false });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const handleDownloadBalanceSheet = async () => {
    try {
      setLoading(prev => ({ ...prev, balanceSheet: true }));
      
      const response = await api.get('/reports/balance-sheet', {
        params: { month: selectedMonth, year: selectedYear },
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `balance-sheet-${selectedMonth}-${selectedYear}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Balance sheet downloaded successfully');
    } catch (error) {
      console.error('Error downloading balance sheet:', error);
      toast.error('Failed to download balance sheet');
    } finally {
      setLoading(prev => ({ ...prev, balanceSheet: false }));
    }
  };

  const handleDownloadProfitLoss = async () => {
    try {
      setLoading(prev => ({ ...prev, profitLoss: true }));
      
      const response = await api.get('/reports/profit-loss', {
        params: { month: selectedMonth, year: selectedYear },
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `profit-loss-${selectedMonth}-${selectedYear}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Profit & Loss statement downloaded successfully');
    } catch (error) {
      console.error('Error downloading P&L statement:', error);
      toast.error('Failed to download P&L statement');
    } finally {
      setLoading(prev => ({ ...prev, profitLoss: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
      </div>

      {/* Date Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Report Period Selection</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance Sheet */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Balance Sheet</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Generate a comprehensive balance sheet showing assets, liabilities, and equity for the selected period.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Includes:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Cash/Bank balances</li>
                <li>• Loans payable</li>
                <li>• Accounts payable</li>
                <li>• Salaries payable</li>
                <li>• Retained earnings</li>
              </ul>
            </div>

            <button
              onClick={handleDownloadBalanceSheet}
              disabled={loading.balanceSheet}
              className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading.balanceSheet ? (
                <LoadingSpinner size="small" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              <span>
                {loading.balanceSheet ? 'Generating...' : 'Download Balance Sheet'}
              </span>
            </button>
          </div>
        </div>

        {/* Profit & Loss Statement */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Profit & Loss Statement</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Generate a detailed income statement showing revenue, expenses, and net profit for the selected period.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-800 mb-2">Includes:</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Total revenue</li>
                <li>• Cost of goods sold</li>
                <li>• Gross profit</li>
                <li>• Operating expenses</li>
                <li>• Net profit</li>
              </ul>
            </div>

            <button
              onClick={handleDownloadProfitLoss}
              disabled={loading.profitLoss}
              className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading.profitLoss ? (
                <LoadingSpinner size="small" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              <span>
                {loading.profitLoss ? 'Generating...' : 'Download P&L Statement'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;