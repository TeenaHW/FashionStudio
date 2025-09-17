import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../lib/api';
import toast from 'react-hot-toast';



// --- NEW: Validation function for real-time feedback ---
const validateField = (name, value, formData) => {
  const principal = parseFloat(formData.principal);
  const installment = parseFloat(formData.installment_amount);

  switch (name) {
    case 'principal':
      if (value && parseFloat(value) <= 0) {
        return 'Principal amount must be greater than 0.';
      }
      break;
    case 'installment_amount':
      if (value && parseFloat(value) <= 0) {
        return 'Monthly installment must be greater than 0.';
      }
      if (value && principal && parseFloat(value) > principal) {
        return 'Monthly installment cannot be greater than the principal amount.';
      }
      break;
    case 'end_date':
      if (value && formData.start_date && new Date(value) <= new Date(formData.start_date)) {
        return 'The end date must be after the start date.';
      }
      break;
    default:
      return null;
  }
  return null;
};

const EditLoan = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employee_id: '',
    principal: '',
    installment_amount: '',
    remaining: '',
    start_date: '',
    end_date: '',
    status: 'active'
  });

  useEffect(() => {
    fetchEmployees();
    fetchLoan();
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

  const fetchLoan = async () => {
  try {
    const response = await api.get(`/loans/${id}`);
    const loan = response.data;
    setFormData({
      ...loan,
      // FIX: Extract the string ID from the employee_id object
      employee_id: loan.employee_id?._id || '', 
      start_date: loan.start_date ? new Date(loan.start_date).toISOString().split('T')[0] : '',
      end_date: loan.end_date ? new Date(loan.end_date).toISOString().split('T')[0] : ''
    });
  } catch (error) {
    console.error('Error fetching loan:', error);
    toast.error('Failed to load loan');
    navigate('/loan-management');
  } finally {
    setLoading(false);
  }
};
// --- NEW: Calculate the minimum date for the end_date input ---
const getMinEndDate = () => {
  if (!formData.start_date) return ''; // Return nothing if no start date is set
  const startDate = new Date(formData.start_date);
  startDate.setDate(startDate.getDate() + 1); // Set it to the next day
  return startDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

  // --- MODIFIED: A more robust handleInputChange function ---
const handleInputChange = (e) => {
  const { name, value } = e.target;
  
  // Use the updater function to ensure all logic runs on the newest state
  setFormData(prev => {
    // 1. Create the new state based on the previous state and the current change
    const newState = { ...prev, [name]: value };

    // 2. Apply business logic based on the change
    // Auto-calculate remaining amount when principal is entered
    if (name === 'principal') {
      newState.remaining = value;
    }
    
    // Clear the end_date if the start_date is changed to be after the current end_date
    if (name === 'start_date' && prev.end_date && new Date(value) >= new Date(prev.end_date)) {
      newState.end_date = '';
    }

    // 3. Run validations using the fully updated new state
    // Validate the field that was just changed
    const errorMessage = validateField(name, value, newState);
    if (errorMessage) {
      toast.error(errorMessage);
    }
    
    // Also, re-validate the installment if the principal changes, as it's a dependency
    if (name === 'principal' && newState.installment_amount) {
      const installmentError = validateField('installment_amount', newState.installment_amount, newState);
      if (installmentError) {
        toast.error(installmentError);
      }
    }

    // 4. Return the final new state to be set
    return newState;
  });
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    const principal = parseFloat(formData.principal);
  const installment = parseFloat(formData.installment_amount);
  const startDate = new Date(formData.start_date);
  const endDate = new Date(formData.end_date);

  // --- Start of new validations ---
  if (!formData.employee_id || !formData.principal || !formData.installment_amount || !formData.start_date || !formData.end_date) {
    toast.error('Please fill in all required fields');
    return;
  }

  if (principal <= 0) {
    toast.error('Principal amount must be greater than 0.');
    return;
  }

  if (installment <= 0) {
    toast.error('Monthly installment must be greater than 0.');
    return;
  }
  
  if (installment > principal) {
    toast.error('Monthly installment cannot be greater than the principal amount.');
    return;
  }

  if (endDate <= startDate) {
    toast.error('The end date must be after the start date.');
    return;
  }

    setSaving(true);

    try {
      await api.put(`/loans/${id}`, {
        ...formData,
        principal: parseFloat(formData.principal),
        installment_amount: parseFloat(formData.installment_amount),
        remaining: parseFloat(formData.remaining),
      });

      toast.success('Loan updated successfully');
      navigate('/loan-management');
    } catch (error) {
      console.error('Error updating loan:', error);
      toast.error('Failed to update loan');
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
          to="/loan-management"
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Loan</h1>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card-body">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Principal Amount (LKR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="principal"
                value={formData.principal}
                onChange={handleInputChange}
                required
                min="0.01"
                max="50000000"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Installment (LKR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="installment_amount"
                value={formData.installment_amount}
                onChange={handleInputChange}
                required
                min="0.01"
                max="50000000"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remaining Balance (LKR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="remaining"
                value={formData.remaining}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                required
                min={getMinEndDate()} // <-- CHANGE 1: Dynamically set the minimum date
                disabled={!formData.start_date} // <-- CHANGE 2: Disable if start_date is not set
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="complete">Complete</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Link
              to="/loan-management"
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
              <span>{saving ? 'Updating...' : 'Update Loan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLoan;