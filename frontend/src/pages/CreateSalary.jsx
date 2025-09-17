import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { getMonthOptions } from '../utils/formatters';
import api from '../lib/api';
import toast from 'react-hot-toast';

// --- NEW: Validation function for real-time feedback ---
const validateField = (name, value) => {
  switch (name) {
    case 'basic_salary':
      if (value && parseFloat(value) <= 0) {
        return 'Basic Salary must be greater than 0.';
      }
      if (value && parseFloat(value) > 10000000) {
        return 'Basic salary seems unrealistically high. Please check the value.';
      }
      break;
    case 'allowances':
      if (value && parseFloat(value) < 0) {
        return 'Allowances cannot be a negative number.';
      }
      break;
    default:
      return null;
  }
  return null;
};

const CreateSalary = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employee_id: '',
    month: '',
    basic_salary: '',
    allowances: '',
    payment_status: 'pending'
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    }
  };

  // --- MODIFIED: handleInputChange now includes real-time validation ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate the field that just changed
    const errorMessage = validateField(name, value);
    if (errorMessage) {
      toast.error(errorMessage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const basicSalary = parseFloat(formData.basic_salary);
  const allowances = parseFloat(formData.allowances) || 0;

  // --- Start of new validations ---
  if (!formData.employee_id || !formData.month || !formData.basic_salary) {
    toast.error('Please fill in all required fields');
    return;
  }
  
  if (basicSalary <= 0) {
    toast.error('Basic Salary must be greater than 0.');
    return;
  }

  if (basicSalary > 10000000) {
    toast.error('Basic salary seems unrealistically high. Please check the value.');
    return;
  }

  if (allowances < 0) {
    toast.error('Allowances cannot be a negative number.');
    return;
  }

    setLoading(true);

    try {
      await api.post('/salaries', {
        ...formData,
        basic_salary: parseFloat(formData.basic_salary),
        allowances: parseFloat(formData.allowances) || 0
      });

      toast.success('Salary record created successfully');
      navigate('/salary-management');
    } catch (error) {
      console.error('Error creating salary record:', error);
      toast.error('Failed to create salary record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          to="/salary-management"
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create Salary Record</h1>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card-body">
            {/* Employee Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                name="employee_id"
                value={formData.employee_id}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Employee</option>
                {employees.map(employee => (
                  <option key={employee._id} value={employee._id}>
                    {employee.user_id?.name} - {employee.designation}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month <span className="text-red-500">*</span>
              </label>
              <select
                name="month"
                value={formData.month}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Month</option>
                {getMonthOptions().map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Basic Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Basic Salary (LKR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="basic_salary"
                value={formData.basic_salary}
                onChange={handleInputChange}
                required
                min="0.01"
                max="10000000"
                step="0.01"
                placeholder="Enter basic salary"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Allowances */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allowances (LKR)
              </label>
              <input
                type="number"
                name="allowances"
                value={formData.allowances}
                onChange={handleInputChange}
                min="0"
                max="10000000"
                step="0.01"
                placeholder="Enter allowances"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                name="payment_status"
                value={formData.payment_status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Auto-calculated Fields:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Overtime hours and amounts will be calculated from attendance records</li>
              <li>• Short hours deduction will be applied for incomplete working days</li>
              <li>• Loan deductions will be fetched from active loans</li>
              <li>• Tax, EPF, and ETF will be calculated automatically</li>
              <li>• Gross and net salary will be computed based on all components</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              to="/salary-management"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? <LoadingSpinner size="small" /> : <Save className="w-4 h-4" />}
              <span>{loading ? 'Creating...' : 'Create Salary Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSalary;