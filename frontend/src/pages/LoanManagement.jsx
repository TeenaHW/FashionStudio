import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, CreditCard } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/formatters';
import api from '../lib/api';
import toast from 'react-hot-toast';

const LoanManagement = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchEmployee, setSearchEmployee] = useState('');

  useEffect(() => {
    fetchLoans();
  }, [searchEmployee]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchEmployee) params.employee = searchEmployee;

      const response = await api.get('/loans', { params });
      setLoans(response.data);
    } catch (error) {
      console.error('Error fetching loans:', error);
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this loan?')) return;

    try {
      await api.delete(`/loans/${id}`);
      setLoans(prev => prev.filter(loan => loan._id !== id));
      toast.success('Loan deleted successfully');
    } catch (error) {
      console.error('Error deleting loan:', error);
      toast.error('Failed to delete loan');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Loan Management</h1>
            <Link
            to="/loan/create"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2 transition-colors"
            >
            <Plus className="w-4 h-4" />
            <span>Add New Loan</span>
            </Link>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="relative max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by employee name..."
            value={searchEmployee}
            onChange={(e) => setSearchEmployee(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <LoadingSpinner size="large" />
            <p className="text-gray-500 mt-2">Loading loans...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Principal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Installment Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remaining Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loans.length > 0 ? (
                  loans.map((loan) => (
                    <tr key={loan._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {loan.employee_id?.user_id?.name || 'N/A'}
                        <div className="text-xs text-gray-500">
                          {loan.employee_id?.designation || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(loan.principal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(loan.installment_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`font-semibold ${
                          loan.remaining > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {formatCurrency(loan.remaining)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(loan.start_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(loan.end_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          loan.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            to={`/loan/edit/${loan._id}`}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded transition-colors"
                            title="Edit Loan"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(loan._id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                            title="Delete Loan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center space-y-2">
                        <CreditCard className="w-12 h-12 text-gray-300" />
                        <p className="text-lg font-medium">No loans found</p>
                        <p className="text-sm">
                          {searchEmployee 
                            ? `No loans found for "${searchEmployee}"`
                            : 'Start by creating a new loan for an employee'
                          }
                        </p>
                        <Link
                          to="/loan/create"
                          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
                        >
                          Create First Loan
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {loans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800">Total Active Loans</h3>
            <p className="text-2xl font-bold text-blue-900">
              {loans.filter(loan => loan.status === 'active').length}
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h3 className="text-sm font-medium text-green-800">Completed Loans</h3>
            <p className="text-2xl font-bold text-green-900">
              {loans.filter(loan => loan.status === 'complete').length}
            </p>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h3 className="text-sm font-medium text-yellow-800">Total Outstanding</h3>
            <p className="text-xl font-bold text-yellow-900">
              {formatCurrency(
                loans
                  .filter(loan => loan.status === 'active')
                  .reduce((sum, loan) => sum + loan.remaining, 0)
              )}
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <h3 className="text-sm font-medium text-purple-800">Monthly Installments</h3>
            <p className="text-xl font-bold text-purple-900">
              {formatCurrency(
                loans
                  .filter(loan => loan.status === 'active')
                  .reduce((sum, loan) => sum + loan.installment_amount, 0)
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanManagement;