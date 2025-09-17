import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import KPICard from '../components/KPICard';
import LoadingSpinner from '../components/LoadingSpinner';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import api from '../lib/api';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [kpis, setKpis] = useState({ totalRevenue: 0, totalExpenses: 0, netProfit: 0 });
  const [monthlySales, setMonthlySales] = useState([]);
  const [expensesBreakdown, setExpensesBreakdown] = useState({ monthlyExpenses: [], monthlySupplierExpenses: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [kpisRes, salesRes, expensesRes] = await Promise.all([
        api.get('/dashboard/kpis'),
        api.get('/dashboard/monthly-sales'),
        api.get('/dashboard/expenses-breakdown')
      ]);

      setKpis(kpisRes.data);
      setMonthlySales(salesRes.data);
      setExpensesBreakdown(expensesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const salesChartData = {
    labels: monthlySales.map(item => `${item._id.month}/${item._id.year}`),
    datasets: [
      {
        label: 'Monthly Sales',
        data: monthlySales.map(item => item.total),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const expensesChartData = {
    labels: expensesBreakdown.monthlyExpenses.map(item => `${item._id.month}/${item._id.year}`),
    datasets: [
      {
        label: 'Salary Expenses',
        data: expensesBreakdown.monthlyExpenses.map(item => item.salaries),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Supplier Expenses',
        data: expensesBreakdown.monthlySupplierExpenses.map(item => item.suppliers),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'LKR ' + value.toLocaleString();
          }
        }
      }
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(kpis.totalRevenue)}
          icon={DollarSign}
          color="green"
        />
        <KPICard
          title="Total Expenses"
          value={formatCurrency(kpis.totalExpenses)}
          icon={TrendingDown}
          color="red"
        />
        <KPICard
          title="Net Profit"
          value={formatCurrency(kpis.netProfit)}
          icon={TrendingUp}
          color={kpis.netProfit >= 0 ? "green" : "red"}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Sales</h2>
          <Line data={salesChartData} options={chartOptions} />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Expenses Breakdown</h2>
          <Line data={expensesChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;