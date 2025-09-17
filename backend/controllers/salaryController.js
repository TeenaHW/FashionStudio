import SalaryRecord from "../models/SalaryRecord.js";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import Loan from "../models/Loan.js";
import Attendance from "../models/Attendance.js";
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';

// ===================================================================================
//  1. Reusable PDF Generation Function - The New Design Engine
// ===================================================================================
/**
 * Creates a beautifully designed, professional salary slip PDF document.
 * @param {object} salaryRecord - The fully populated salary record object.
 * @returns {PDFDocument} - The PDFKit document instance.
 */
const createSalarySlipPDF = (salaryRecord) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    // Define a consistent color and font palette
    const brandBlue = '#1E40AF';
    const textPrimary = '#111827';
    const textSecondary = '#4B5563';
    const borderLight = '#E5E7EB';
    let yCursor = 40;

    // === HEADER with "CHIC WORDMARK" LOGO ===
    doc.font('Times-Bold').fontSize(20).fillColor(textPrimary)
        .text('FASHION', 40, yCursor, { characterSpacing: 3, continued: true })
        .font('Helvetica-Bold').fillColor(brandBlue)
        .text('Studio', { characterSpacing: 0 });

    doc.font('Helvetica-Bold').fontSize(16).fillColor(textPrimary)
        .text('Payslip', 40, yCursor + 5, { align: 'right' });
    
    yCursor += 40;
    doc.moveTo(40, yCursor).lineTo(555, yCursor).lineWidth(0.5).stroke(borderLight);
    yCursor += 25;

    // === EMPLOYEE DETAILS BOX ===
    doc.font('Helvetica-Bold').fontSize(12).fillColor(textPrimary)
        .text('Employee Details', 40, yCursor);
    yCursor += 20;

    const empBoxY = yCursor;
    doc.roundedRect(40, empBoxY, 515, 60, 5).stroke(borderLight);

    doc.font('Helvetica').fontSize(10).fillColor(textSecondary)
        .text('EMPLOYEE NAME', 60, empBoxY + 15)
        .text('PAY PERIOD', 320, empBoxY + 15)
        .text('DESIGNATION', 60, empBoxY + 35)
        .text('PAY DATE', 320, empBoxY + 35);
    
    doc.font('Helvetica-Bold').fontSize(10).fillColor(textPrimary)
        .text(salaryRecord.employee_id.user_id.name, 160, empBoxY + 15)
        .text(salaryRecord.month, 420, empBoxY + 15)
        .text(salaryRecord.employee_id.designation || 'N/A', 160, empBoxY + 35)
        .text(new Date().toLocaleDateString(), 420, empBoxY + 35);

    yCursor += 85;

    // === EARNINGS & DEDUCTIONS TABLE ===
    const tableTop = yCursor;
    const itemX = 40;
    const earningsX = 300;
    const deductionsX = 450;

    doc.font('Helvetica-Bold').fontSize(10).fillColor(textSecondary)
        .text('DESCRIPTION', itemX, tableTop)
        .text('EARNINGS (LKR)', earningsX, tableTop, { width: 100, align: 'right' })
        .text('DEDUCTIONS (LKR)', deductionsX, tableTop, { width: 100, align: 'right' });

    yCursor = tableTop + 20;
    doc.moveTo(itemX, yCursor).lineTo(555, yCursor).lineWidth(0.5).stroke(borderLight);
    yCursor += 10;
    
    const addRow = (label, earning, deduction) => {
        doc.font('Helvetica').fontSize(10).fillColor(textPrimary)
            .text(label, itemX, yCursor);
        if (earning !== null) {
            doc.text(earning.toFixed(2), earningsX, yCursor, { width: 100, align: 'right' });
        }
        if (deduction !== null) {
            doc.text(deduction.toFixed(2), deductionsX, yCursor, { width: 100, align: 'right' });
        }
        yCursor += 20;
    };
    
    // Dynamically add rows only if the value is greater than 0
    addRow('Basic Salary', salaryRecord.basic_salary, null);
    if (salaryRecord.allowances > 0) addRow('Allowances', salaryRecord.allowances, null);
    if (salaryRecord.OT_amount_normal > 0) addRow('Overtime (Normal)', salaryRecord.OT_amount_normal, null);
    if (salaryRecord.OT_amount_holiday > 0) addRow('Overtime (Holiday)', salaryRecord.OT_amount_holiday, null);
    
    if (salaryRecord.EPF_employee > 0) addRow('EPF (Employee Contribution - 8%)', null, salaryRecord.EPF_employee);
    if (salaryRecord.tax_deduction > 0) addRow('Tax Deduction (PAYE)', null, salaryRecord.tax_deduction);
    if (salaryRecord.loan_deduction > 0) addRow('Loan Repayment', null, salaryRecord.loan_deduction);
    if (salaryRecord.short_hours_deduction > 0) addRow('Short Hours', null, salaryRecord.short_hours_deduction);

    // === TOTALS & SUMMARY ===
    yCursor += 10;
    doc.moveTo(40, yCursor).lineTo(555, yCursor).lineWidth(0.5).stroke(borderLight);
    yCursor += 10;
    
    const totalDeductions = salaryRecord.EPF_employee + salaryRecord.tax_deduction + salaryRecord.loan_deduction + salaryRecord.short_hours_deduction;

    doc.font('Helvetica-Bold').fontSize(10).fillColor(textPrimary)
        .text('Gross Earnings', itemX, yCursor)
        .text(salaryRecord.gross_salary.toFixed(2), earningsX, yCursor, { width: 100, align: 'right' })
        .text('Total Deductions', itemX, yCursor + 20)
        .text(totalDeductions.toFixed(2), deductionsX, yCursor + 20, { width: 100, align: 'right' });
    
    yCursor += 50;

    // === NET PAY HIGHLIGHT BOX ===
    doc.rect(40, yCursor, 515, 40).fill(brandBlue);
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#FFFFFF')
        .text('NET SALARY PAYABLE', 60, yCursor + 14)
        .fontSize(16)
        .text(`LKR ${salaryRecord.net_salary.toFixed(2)}`, 40, yCursor + 11, { width: 500, align: 'right' });

    // === FOOTER ===
    const pageHeight = doc.page.height;
    doc.font('Helvetica-Oblique').fontSize(8).fillColor(textSecondary)
        .text('This is a computer-generated document. No signature is required.', 40, pageHeight - 50, { align: 'center' });

    // Finalize the document
    doc.end();
    return doc;
};


// ===================================================================================
//  2. Your Existing Business Logic - Unchanged
// ===================================================================================

const calculateTax = (grossSalary) => {
  const annualSalary = grossSalary * 12;
  let tax = 0;
  
  if (annualSalary > 150000) {
    const taxableAmount = annualSalary - 150000;
    if (taxableAmount <= 83333) {
      tax = taxableAmount * 0.06;
    } else if (taxableAmount <= 125000) {
      tax = (83333 * 0.06) + ((taxableAmount - 83333) * 0.18);
    } else {
      tax = (83333 * 0.06) + (41667 * 0.18) + ((taxableAmount - 125000) * 0.24);
    }
  }
  return tax / 12;
};

const calculateSalaryComponents = async (employeeId, basicSalary, month) => {
  const employee = await Employee.findById(employeeId);
  const hourlyRate = basicSalary / (8 * 28);
  const startDate = new Date(month + "-01");
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
  
  const attendance = await Attendance.find({
    employee_id: employeeId,
    check_in: { $gte: startDate, $lte: endDate }
  });
  
  let OT_hours_normal = 0;
  let OT_hours_holiday = 0;
  let short_hours_deduction = 0;
  
  attendance.forEach(record => {
    const hoursWorked = (record.check_out - record.check_in) / (1000 * 60 * 60);
    if (record.isholiday) {
      if (hoursWorked > 8) OT_hours_holiday += hoursWorked - 8;
    } else {
      if (hoursWorked > 8) {
        OT_hours_normal += hoursWorked - 8;
      } else if (hoursWorked < 8) {
        short_hours_deduction += ((8 - hoursWorked) / 8) * basicSalary;
      }
    }
  });
  
  const activeLoan = await Loan.findOne({ employee_id: employeeId, status: "active" });
  const loan_deduction = activeLoan ? activeLoan.installment_amount : 0;
  
  return {
    OT_hours_normal,
    OT_hours_holiday,
    OT_amount_normal: hourlyRate * OT_hours_normal * 1.0,
    OT_amount_holiday: hourlyRate * OT_hours_holiday * 1.5,
    short_hours_deduction,
    loan_deduction
  };
};

export const getAllSalaryRecords = async (req, res) => {
  try {
    const { employee, month } = req.query;
    let filter = {};
    if (employee) {
      const emp = await Employee.findOne().populate('user_id', 'name').where('user_id.name').regex(new RegExp(employee, 'i'));
      if (emp) filter.employee_id = emp._id;
    }
    if (month) filter.month = month;
    const salaryRecords = await SalaryRecord.find(filter).populate({ path: 'employee_id', populate: { path: 'user_id', select: 'name email' } }).sort({ createdAt: -1 });
    res.json(salaryRecords);
  } catch (error) {
    console.error("Error in getAllSalaryRecords:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSalaryRecordById = async (req, res) => {
  try {
    const salaryRecord = await SalaryRecord.findById(req.params.id).populate({ path: 'employee_id', populate: { path: 'user_id', select: 'name email' } });
    if (!salaryRecord) return res.status(404).json({ message: "Salary record not found" });
    res.json(salaryRecord);
  } catch (error) {
    console.error("Error in getSalaryRecordById:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createSalaryRecord = async (req, res) => {
  try {
    const { employee_id, month, basic_salary, allowances } = req.body;
    const components = await calculateSalaryComponents(employee_id, basic_salary, month);
    const gross_salary = basic_salary + allowances + components.OT_amount_normal + components.OT_amount_holiday;
    const tax_deduction = calculateTax(gross_salary);
    const EPF_employee = basic_salary * 0.08;
    const EPF_company = basic_salary * 0.12;
    const ETF_company = basic_salary * 0.03;
    const net_salary = gross_salary - (EPF_employee + components.loan_deduction + tax_deduction + components.short_hours_deduction);
    
    const salaryRecord = new SalaryRecord({ employee_id, month, basic_salary, allowances, ...components, tax_deduction, EPF_employee, EPF_company, ETF_company, gross_salary, net_salary, is_payable: true });
    
    const savedRecord = await salaryRecord.save();
    await savedRecord.populate({ path: 'employee_id', populate: { path: 'user_id', select: 'name email' } });
    res.status(201).json(savedRecord);
  } catch (error) {
    console.error("Error in createSalaryRecord:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateSalaryRecord = async (req, res) => {
  try {
    const { employee_id, month, basic_salary, allowances, payment_status } = req.body;
    let updateData = { employee_id, month, basic_salary, allowances };
    if (basic_salary) {
      const components = await calculateSalaryComponents(employee_id, basic_salary, month);
      const gross_salary = basic_salary + allowances + components.OT_amount_normal + components.OT_amount_holiday;
      const tax_deduction = calculateTax(gross_salary);
      const EPF_employee = basic_salary * 0.08;
      const EPF_company = basic_salary * 0.12;
      const ETF_company = basic_salary * 0.03;
      const net_salary = gross_salary - (EPF_employee + components.loan_deduction + tax_deduction + components.short_hours_deduction);
      updateData = { ...updateData, ...components, tax_deduction, EPF_employee, EPF_company, ETF_company, gross_salary, net_salary };
    }
    if (payment_status) {
      updateData.payment_status = payment_status;
      updateData.is_payable = payment_status === "pending";
    }
    const updatedRecord = await SalaryRecord.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate({ path: 'employee_id', populate: { path: 'user_id', select: 'name email' } });
    if (!updatedRecord) return res.status(404).json({ message: "Salary record not found" });
    res.json(updatedRecord);
  } catch (error) {
    console.error("Error in updateSalaryRecord:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteSalaryRecord = async (req, res) => {
  try {
    const deletedRecord = await SalaryRecord.findByIdAndDelete(req.params.id);
    if (!deletedRecord) return res.status(404).json({ message: "Salary record not found" });
    res.json({ message: "Salary record deleted successfully" });
  } catch (error) {
    console.error("Error in deleteSalaryRecord:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ===================================================================================
//  3. Your PDF Handlers - Now Refactored, Clean, and Powerful
// ===================================================================================

export const generateSalarySlip = async (req, res) => {
  try {
    const salaryRecord = await SalaryRecord.findById(req.params.id)
      .populate({ path: 'employee_id', populate: { path: 'user_id', select: 'name email' } });
    
    if (!salaryRecord) {
      return res.status(404).json({ message: "Salary record not found" });
    }
    
    // Call the new design function
    const doc = createSalarySlipPDF(salaryRecord); 

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Payslip-${salaryRecord.employee_id.user_id.name}-${salaryRecord.month}.pdf`);
    
    doc.pipe(res);

  } catch (error) {
    console.error("Error generating salary slip:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const emailSalarySlip = async (req, res) => {
  try {
    const salaryRecord = await SalaryRecord.findById(req.params.id)
      .populate({ path: 'employee_id', populate: { path: 'user_id', select: 'name email' } });

    if (!salaryRecord) {
      return res.status(404).json({ message: "Salary record not found" });
    }
    if (!salaryRecord.employee_id?.user_id?.email) {
      return res.status(400).json({ message: "Cannot send email: Employee email address not found." });
    }

    // Call the same new design function
    const doc = createSalarySlipPDF(salaryRecord); 

    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      try {
        const pdfBuffer = Buffer.concat(buffers);
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        await transporter.sendMail({
          from: `"FashionStudio HR" <${process.env.EMAIL_USER}>`,
          to: salaryRecord.employee_id.user_id.email,
          subject: `Your Payslip for ${salaryRecord.month}`,
          text: `Dear ${salaryRecord.employee_id.user_id.name},\n\nPlease find your payslip for ${salaryRecord.month} attached.\n\nBest regards,\nFashionStudio HR`,
          attachments: [{
            filename: `Payslip-${salaryRecord.month}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }]
        });

        res.json({ message: "Salary slip emailed successfully" });
      } catch (emailError) {
        console.error("Nodemailer failed to send email:", emailError);
        res.status(500).json({ message: "Failed to send salary slip via email." });
      }
    });

  } catch (error) {
    console.error("Error preparing to email salary slip:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};