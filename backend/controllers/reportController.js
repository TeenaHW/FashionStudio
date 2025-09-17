import PDFDocument from 'pdfkit';
import SalaryRecord from "../models/SalaryRecord.js";
import SupplierTransaction from "../models/SupplierTransaction.js";
import Payment from "../models/Payment.js";
import Loan from "../models/Loan.js";

/**
 * GENERIC SINGLE-COLUMN RENDERER (for Profit & Loss)
 * This version uses absolute positioning with a manual 'yCursor' to override
 * the PDF library's automatic page-breaking.
 */
const generateReportPDF = (res, title, month, year, sections) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50, autoFirstPage: true });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${title.toLowerCase().replace(/ /g, '-')}-${month}-${year}.pdf`);

  doc.pipe(res);

  let yCursor = 50;

  // === HEADER ===
  doc.font('Times-Bold').fontSize(20).fillColor('#111827').text('FASHION', 50, yCursor, { characterSpacing: 3, continued: true });
  doc.font('Helvetica-Bold').fontSize(20).fillColor('#1E40AF').text('Studio', { characterSpacing: 0 });
  doc.font('Helvetica').fontSize(9).fillColor('#374151').text('123 Style Avenue, Design District, 54321', 50, yCursor + 5, { align: 'right' }).text('contact@fashionstudio.com', 50, yCursor + 18, { align: 'right' });
  yCursor = 100;

  // === DOCUMENT TITLE ===
  doc.font('Helvetica-Bold').fontSize(16).fillColor('#111827').text(title, 50, yCursor, { align: 'center' });
  yCursor += 25;
  doc.font('Helvetica').fontSize(11).fillColor('#6B7280').text(`For the Period Ending ${new Date(year, month, 0).toLocaleDateString()}`, 50, yCursor, { align: 'center' });
  yCursor += 20;
  doc.moveTo(50, yCursor).lineTo(550, yCursor).lineWidth(0.5).strokeColor('#E5E7EB').stroke();
  yCursor += 20;

  // === CONTENT SECTIONS (Single Column) ===
  const itemX = 50;
  const amountX = 350;
  const colWidth = 200;

  sections.forEach(section => {
    if (!section) return;
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#1E40AF').text(section.title, itemX, yCursor);
    yCursor += 22;
    if (section.items && section.items.length > 0) {
      section.items.forEach(item => {
        doc.font('Helvetica').fontSize(11).fillColor('#111827').text(item.label, itemX, yCursor, { width: 300 });
        doc.font('Helvetica').fontSize(11).fillColor('#111827').text(`LKR ${item.amount.toFixed(2)}`, amountX, yCursor, { width: colWidth, align: 'right' });
        yCursor += 18;
      });
    }
    if (section.total) {
      yCursor += 5;
      doc.moveTo(itemX, yCursor).lineTo(550, yCursor).lineWidth(0.5).strokeColor('#374151').stroke();
      yCursor += 10;
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827').text(section.total.label, itemX, yCursor);
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827').text(`LKR ${section.total.amount.toFixed(2)}`, amountX, yCursor, { width: colWidth, align: 'right' });
      yCursor += 18;
    }
    yCursor += 15;
  });

  // === FOOTER ===
  const pageHeight = doc.page.height;
  doc.font('Helvetica-Oblique').fontSize(8).fillColor('#6B7280').text(`Generated on: ${new Date().toLocaleDateString()}`, 50, pageHeight - 60, { align: 'center' });
  doc.font('Helvetica').fontSize(8).fillColor('#6B7280').text('This is a computer-generated document.', 50, pageHeight - 50, { align: 'center' });
  doc.end();
};

/**
 * --- NEW ---
 * SPECIALIZED TWO-COLUMN RENDERER (for Balance Sheet)
 * This function handles the side-by-side layout.
 */
const generateBalanceSheetPDF = (res, title, month, year, assets, liabilities, equity) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=balance-sheet-${month}-${year}.pdf`);
    doc.pipe(res);

    let yCursor = 50;

    // === HEADER (Same as before) ===
    doc.font('Times-Bold').fontSize(20).fillColor('#111827').text('FASHION', 50, yCursor, { characterSpacing: 3, continued: true });
    doc.font('Helvetica-Bold').fontSize(20).fillColor('#1E40AF').text('Studio', { characterSpacing: 0 });
    doc.font('Helvetica').fontSize(9).fillColor('#374151').text('123 Style Avenue, Design District, 54321', 50, yCursor + 5, { align: 'right' }).text('contact@fashionstudio.com', 50, yCursor + 18, { align: 'right' });
    yCursor = 100;

    // === DOCUMENT TITLE (Same as before) ===
    doc.font('Helvetica-Bold').fontSize(16).fillColor('#111827').text(title, 50, yCursor, { align: 'center' });
    yCursor += 25;
    doc.font('Helvetica').fontSize(11).fillColor('#6B7280').text(`For the Period Ending ${new Date(year, month, 0).toLocaleDateString()}`, 50, yCursor, { align: 'center' });
    yCursor += 30; // A bit more space before columns start

    // === TWO-COLUMN LAYOUT ===
    const leftX = 50;
    const rightX = 320;
    const colWidth = 230;
    let yLeft = yCursor;
    let yRight = yCursor;

    // --- LEFT COLUMN: ASSETS ---
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#1E40AF').text(assets.title, leftX, yLeft);
    yLeft += 22;
    assets.items.forEach(item => {
        doc.font('Helvetica').fontSize(11).fillColor('#111827').text(item.label, leftX, yLeft, { width: colWidth - 80 });
        doc.font('Helvetica').fontSize(11).fillColor('#111827').text(`LKR ${item.amount.toFixed(2)}`, leftX, yLeft, { width: colWidth, align: 'right' });
        yLeft += 18;
    });
    yLeft += 5;
    doc.moveTo(leftX, yLeft).lineTo(leftX + colWidth, yLeft).lineWidth(0.5).strokeColor('#374151').stroke();
    yLeft += 10;
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827').text(assets.total.label, leftX, yLeft);
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827').text(`LKR ${assets.total.amount.toFixed(2)}`, leftX, yLeft, { width: colWidth, align: 'right' });

    // --- RIGHT COLUMN: LIABILITIES & EQUITY ---
    // Liabilities
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#1E40AF').text(liabilities.title, rightX, yRight);
    yRight += 22;
    liabilities.items.forEach(item => {
        doc.font('Helvetica').fontSize(11).fillColor('#111827').text(item.label, rightX, yRight, { width: colWidth - 80 });
        doc.font('Helvetica').fontSize(11).fillColor('#111827').text(`LKR ${item.amount.toFixed(2)}`, rightX, yRight, { width: colWidth, align: 'right' });
        yRight += 18;
    });
    yRight += 5;
    doc.moveTo(rightX, yRight).lineTo(rightX + colWidth, yRight).lineWidth(0.5).strokeColor('#374151').stroke();
    yRight += 10;
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827').text(liabilities.total.label, rightX, yRight);
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827').text(`LKR ${liabilities.total.amount.toFixed(2)}`, rightX, yRight, { width: colWidth, align: 'right' });
    yRight += 25; // Space between Liabilities and Equity

    // Equity
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#1E40AF').text(equity.title, rightX, yRight);
    yRight += 22;
    equity.items.forEach(item => {
        doc.font('Helvetica').fontSize(11).fillColor('#111827').text(item.label, rightX, yRight, { width: colWidth - 80 });
        doc.font('Helvetica').fontSize(11).fillColor('#111827').text(`LKR ${item.amount.toFixed(2)}`, rightX, yRight, { width: colWidth, align: 'right' });
        yRight += 18;
    });
    yRight += 5;
    doc.moveTo(rightX, yRight).lineTo(rightX + colWidth, yRight).lineWidth(0.5).strokeColor('#374151').stroke();
    yRight += 10;
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827').text(equity.total.label, rightX, yRight);
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827').text(`LKR ${equity.total.amount.toFixed(2)}`, rightX, yRight, { width: colWidth, align: 'right' });
    yRight += 25;

    // Total Liabilities & Equity
    const totalLiabilitiesAndEquity = liabilities.total.amount + equity.total.amount;
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827').text('Total Liabilities and Equity', rightX, yRight);
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827').text(`LKR ${totalLiabilitiesAndEquity.toFixed(2)}`, rightX, yRight, { width: colWidth, align: 'right' });


    // === FOOTER (Same as before) ===
    const pageHeight = doc.page.height;
    doc.font('Helvetica-Oblique').fontSize(8).fillColor('#6B7280').text(`Generated on: ${new Date().toLocaleDateString()}`, 50, pageHeight - 60, { align: 'center' });
    doc.font('Helvetica').fontSize(8).fillColor('#6B7280').text('This is a computer-generated document.', 50, pageHeight - 50, { align: 'center' });
    doc.end();
};


export const generateBalanceSheet = async (req, res) => {
    try {
        const { month, year } = req.query;
        const endDate = new Date(year, month, 0);

        // --- Data Fetching (Same as before) ---
        const totalRevenue = await Payment.aggregate([{ $match: { createdAt: { $lte: endDate } } }, { $group: { _id: null, total: { $sum: "$final_amount" } } }]);
        const paidSalaries = await SalaryRecord.aggregate([{ $match: { payment_status: "paid", updatedAt: { $lte: endDate } } }, { $group: { _id: null, total: { $sum: "$net_salary" } } }]);
        const paidSupplierTransactions = await SupplierTransaction.aggregate([{ $match: { paid_status: "Paid", paid_date: { $lte: endDate } } }, { $group: { _id: null, total: { $sum: "$total_amount" } } }]);
        const cashBank = (totalRevenue[0]?.total || 0) - ((paidSalaries[0]?.total || 0) + (paidSupplierTransactions[0]?.total || 0));

        const loansPayable = await Loan.aggregate([{ $match: { status: "active" } }, { $group: { _id: null, total: { $sum: "$remaining" } } }]);
        const accountsPayable = await SupplierTransaction.aggregate([{ $match: { paid_status: "Not Paid" } }, { $group: { _id: null, total: { $sum: "$total_amount" } } }]);
        const salariesPayable = await SalaryRecord.aggregate([{ $match: { payment_status: "pending" } }, { $group: { _id: null, total: { $sum: "$net_salary" } } }]);
        const totalLiabilities = (loansPayable[0]?.total || 0) + (accountsPayable[0]?.total || 0) + (salariesPayable[0]?.total || 0);

        const retainedEarnings = cashBank - totalLiabilities;
        
        // --- UPDATED: Prepare data objects for the new two-column function ---
        const assetsData = {
            title: 'ASSETS',
            items: [{ label: 'Cash and Cash Equivalents (Bank)', amount: cashBank }],
            total: { label: 'Total Assets', amount: cashBank }
        };

        const liabilitiesData = {
            title: 'LIABILITIES',
            items: [
                { label: 'Loans Payable', amount: loansPayable[0]?.total || 0 },
                { label: 'Accounts Payable (Suppliers)', amount: accountsPayable[0]?.total || 0 },
                { label: 'Salaries Payable', amount: salariesPayable[0]?.total || 0 }
            ],
            total: { label: 'Total Liabilities', amount: totalLiabilities }
        };

        const equityData = {
            title: 'EQUITY',
            items: [{ label: 'Retained Earnings', amount: retainedEarnings }],
            total: { label: 'Total Equity', amount: retainedEarnings }
        };
        
        // --- UPDATED: Call the new, specialized PDF generator ---
        generateBalanceSheetPDF(res, 'Balance Sheet', month, year, assetsData, liabilitiesData, equityData);

    } catch (error) {
        console.error("Error generating balance sheet:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const generateProfitLossStatement = async (req, res) => {
    try {
        const { month, year } = req.query;
        const startDate = new Date(`${year}-${month}-01`);
        const endDate = new Date(year, month, 0);

        const revenue = await Payment.aggregate([{ $match: { createdAt: { $gte: startDate, $lte: endDate } } }, { $group: { _id: null, total: { $sum: "$final_amount" } } }]);
        const cogs = await SupplierTransaction.aggregate([{ $match: { paid_status: "Paid", paid_date: { $gte: startDate, $lte: endDate } } }, { $group: { _id: null, total: { $sum: "$total_amount" } } }]);
        const operatingExpenses = await SalaryRecord.aggregate([{ $match: { payment_status: "paid", updatedAt: { $gte: startDate, $lte: endDate } } }, { $group: { _id: null, total: { $sum: "$net_salary" } } }]);

        const totalRevenue = revenue[0]?.total || 0;
        const totalCOGS = cogs[0]?.total || 0;
        const totalOpExpenses = operatingExpenses[0]?.total || 0;
        const grossProfit = totalRevenue - totalCOGS;
        const netProfit = grossProfit - totalOpExpenses;

        const sections = [
            {
                title: 'Revenue',
                items: [{ label: 'Total Sales Revenue', amount: totalRevenue }],
                total: { label: 'Total Revenue', amount: totalRevenue }
            },
            {
                title: 'Cost of Goods Sold (COGS)',
                items: [{ label: 'Supplier and Material Costs', amount: totalCOGS }],
                total: { label: 'Total Cost of Goods Sold', amount: totalCOGS }
            },
            {
                title: 'Gross Profit',
                items: [],
                total: { label: 'Gross Profit', amount: grossProfit }
            },
            {
                title: 'Operating Expenses',
                items: [{ label: 'Salaries and Employee Wages', amount: totalOpExpenses }],
                total: { label: 'Total Operating Expenses', amount: totalOpExpenses }
            },
            {
                title: 'Net Profit',
                items: [],
                total: { label: 'Net Profit', amount: netProfit }
            }
        ];
        
        // No changes here, it still uses the original single-column generator
        generateReportPDF(res, 'Profit & Loss Statement', month, year, sections);
    } catch (error) {
        console.error("Error generating P&L statement:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};