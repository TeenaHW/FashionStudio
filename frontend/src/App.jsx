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
import SupplierTransaction from './pages/SupplierTransaction';
import Reports from './pages/Reports';
import './index.css';
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import PaymentPage from "./pages/PaymentPage";
import OrderPage from "./pages/OrderPage";
import InvoicePage from "./pages/InvoicePage";
import ProductList from "./pages/ProductList";
import ProductDetails from "./pages/ProductDetails";

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
              <Route path="/ProductList" element={<ProductList />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/order" element={<OrderPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/invoice" element={<InvoicePage />} />
            </Routes>
        </main>
        
        <Footer />
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;