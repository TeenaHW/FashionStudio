import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import SalaryManagement from './pages/SalaryManagement';
import CreateSalary from './pages/CreateSalary';
import EditSalary from './pages/EditSalary';
import LoanManagement from './pages/LoanManagement';
import CreateLoan from './pages/CreateLoan';
import EditLoan from './pages/EditLoan';
import CreatePage from "./pages/CreatePage";
import NoteDetailPage from "./pages/NoteDetailPage";
import DetailPage from "./pages/DetailPage";
import TransactionPage from "./pages/TransactionPage";
import SupplierTransaction from './pages/SupplierTransaction';
import Reports from './pages/Reports';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Sidebar /> {/* Sidebar is now a direct child, not in a flexbox */}

        {/* The main content is pushed over to make space for the sidebar */}
        <main className="ml-64 mt-16 p-8"> 
          <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/salary-management" element={<SalaryManagement />} />
              <Route path="/salary/create" element={<CreateSalary />} />
              <Route path="/salary/edit/:id" element={<EditSalary />} />
              <Route path="/loan-management" element={<LoanManagement />} />
              <Route path="/loan/create" element={<CreateLoan />} />
              <Route path="/loan/edit/:id" element={<EditLoan />} />
              <Route path="/supplier-transactions" element={<SupplierTransaction />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/create" element={<CreatePage />} />
              <Route path="/product/:id" element={<NoteDetailPage />} />
              <Route path="/product/:id/details" element={<DetailPage />} />
              <Route path="/transaction" element={<TransactionPage />} />
              <Route path="/hompageP" element={<HomePageP />} />
          </Routes>
        </main>
        
        <Footer />
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;