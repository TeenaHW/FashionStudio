import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";

// Route imports
import salaryRoutes from "./routes/salaryRoutes.js";
import loanRoutes from "./routes/loanRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import rateLimiter from "./middleware/rateLimiter.js";
dotenv.config();

const PORT = process.env.PORT || 5001;
const app = express();

// CORS configuration
app.use(cors({
   origin: ["http://localhost:5173"],
  //  origin: ["http://localhost:5173", "http://localhost:3000"],
   credentials: true
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'FashionStudio Finance Management API',
    status: 'Running',
    timestamp: new Date().toISOString()
  });
});

// API Routes

app.use("/api/salaries", salaryRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/invoices", invoiceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'API endpoint not found',
    availableEndpoints: [
      
      '/api/salaries',
      '/api/loans',
      '/api/reports',
      '/api/dashboard'
    ]
  });
});

// Database connection and server start
connectDB().then(() => { 
  app.listen(PORT, () => {
    console.log(`🚀 Server running on PORT: ${PORT}`);
    console.log(`📊 Finance Management API is ready!`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

