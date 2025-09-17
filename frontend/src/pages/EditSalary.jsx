import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { getMonthOptions, formatCurrency } from '../utils/formatters';
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


const EditSalary = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employee_id: '',
    month: '',
    basic_salary: '',
    allowances: '',
    payment_status: 'pending',
    // Read-only calculated fields
    OT_hours_normal: 0,
    OT_hours_holiday: 0,
    OT_amount_normal: 0,
    OT_amount_holiday: 0,
    short_hours_deduction: 0,
    loan_deduction: 0,
    tax_deduction: 0,
    EPF_employee: 0,
    EPF_company: 0,
    ETF_company: 0,
    gross_salary: 0,
    net_salary: 0,
    is_payable: true
  });

  useEffect(() => {
    fetchEmployees();
    fetchSalaryRecord();
  }, [id]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    }
  };

  const fetchSalaryRecord = async () => {
  try {
    const response = await api.get(`/salaries/${id}`);
    const salaryData = response.data;
    // FIX: Set the state with the corrected employee_id string
    setFormData({
      ...salaryData,
      employee_id: salaryData.employee_id?._id || ''
    });
  } catch (error) {
    console.error('Error fetching salary record:', error);
    toast.error('Failed to load salary record');
    navigate('/salary-management');
  } finally {
    setLoading(false);
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

    setSaving(true);

    try {
      await api.put(`/salaries/${id}`, {
        employee_id: formData.employee_id,
        month: formData.month,
        basic_salary: parseFloat(formData.basic_salary),
        allowances: parseFloat(formData.allowances) || 0,
        payment_status: formData.payment_status
      });

      toast.success('Salary record updated successfully');
      navigate('/salary-management');
    } catch (error) {
      console.error('Error updating salary record:', error);
      toast.error('Failed to update salary record');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          to="/salary-management"
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Salary Record</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Is Payable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Is Payable
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  formData.is_payable
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {formData.is_payable ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Auto-calculated Fields (Read-only) */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Auto-calculated Fields</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">OT Amount (Normal)</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  {formatCurrency(formData.OT_amount_normal)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">OT Amount (Holiday)</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  {formatCurrency(formData.OT_amount_holiday)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Short Hours Deduction</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  {formatCurrency(formData.short_hours_deduction)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loan Deduction</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  {formatCurrency(formData.loan_deduction)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tax Deduction</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  {formatCurrency(formData.tax_deduction)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">EPF Employee (8%)</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  {formatCurrency(formData.EPF_employee)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">EPF Company (12%)</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  {formatCurrency(formData.EPF_company)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ETF Company (3%)</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  {formatCurrency(formData.ETF_company)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gross Salary</label>
                <div className="px-3 py-2 bg-blue-50 border border-blue-300 rounded-lg font-semibold">
                  {formatCurrency(formData.gross_salary)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Net Salary</label>
                <div className="px-3 py-2 bg-green-50 border border-green-300 rounded-lg font-semibold text-green-800">
                  {formatCurrency(formData.net_salary)}
                </div>
              </div>
            </div>
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
              disabled={saving}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saving ? <LoadingSpinner size="small" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Updating...' : 'Update Salary Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSalary;