import PDFDocument from "pdfkit";
import fs from "fs";
import nodemailer from "nodemailer";

// Generate and return invoice PDF directly to the client (download)
export async function generateInvoice(req, res) {
  try {
    const { transaction, items = [], userDetails = {}, orderId, amountToPay } = req.body || {};
    if (!transaction?.transactionId) {
      return res.status(400).json({ error: "transaction.transactionId is required" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="FashionStudio_Invoice_${transaction.transactionId}.pdf"`
    );

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    doc.pipe(res);

    // Colors
    const orange = "#f59e0b";
    const gray600 = "#4b5563";
    const black = "#111827";

    // Header
    doc.fillColor(black).fontSize(24).font("Helvetica-Bold").text("Fashion Studio", 40, 40);
    doc.fontSize(10).font("Helvetica").fillColor(gray600);
    doc.text("123 Galle Road, Colombo 03, Sri Lanka", 40, 65);
    doc.text("Phone: +94 11 234 5678 | Email: support@fashionstudio.com", 40, 80);
    doc.text("Website: www.fashionstudio.com | Hotline: 1999 (24/7)", 40, 95);

    // Badge
    doc.roundedRect(420, 36, 140, 26, 4).fill(black);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(11).text("SALES INVOICE", 425, 44, { width: 130, align: "center" });
    doc.fillColor(gray600).font("Helvetica").fontSize(10).text("Page 1", 520, 28, { width: 40, align: "right" });

    // Separator
    doc.moveTo(40, 115).lineTo(555, 115).lineWidth(1).stroke(black);

    const label = (txt, x, y) => doc.fillColor(black).font("Helvetica-Bold").fontSize(11).text(txt, x, y);
    const value = (txt, x, y) => doc.fillColor(gray600).font("Helvetica").fontSize(11).text(txt, x, y);

    const todayIso = new Date().toISOString().slice(0, 10);
    const buyerName = userDetails.name || "Guest User";
    const addressParts = [
      userDetails.addressLine1,
      userDetails.addressLine2,
      [userDetails.city, userDetails.state].filter(Boolean).join(", "),
      userDetails.country || "Sri Lanka",
    ].filter(Boolean);
    const fullAddress = addressParts.join(", ");

    label("Bill To:", 40, 130); value(buyerName, 120, 130);
    label("Billing Address:", 40, 150); value(fullAddress || "—", 150, 150);
    label("Delivery Address:", 40, 170); value(fullAddress || "—", 160, 170);

    label("Invoice No:", 380, 130); value(transaction.transactionId, 460, 130);
    label("Invoice Date:", 380, 150); value(todayIso, 460, 150);

    label("Invoice Detail", 40, 205);
    // Table header bar
    doc.fillColor(orange).rect(40, 218, 515, 22).fill();
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(11);
    doc.text("Description", 48, 222);
    doc.text("Quantity", 385, 222);
    doc.text("Amount (LKR)", 470, 222);

    // Rows
    let y = 248;
    let subtotal = 0;
    const categoryOf = (name, cat) => {
      const raw = (cat || "").toLowerCase();
      if (raw) return raw.charAt(0).toUpperCase() + raw.slice(1);
      const t = (name || "").toLowerCase();
      return /(ring|earring|necklace|jewel|bracelet)/.test(t) ? "Jewelry" : "Outfit";
    };

    items.forEach((it) => {
      const qty = it.quantity || 1;
      const line = (it.price || 0) * qty;
      subtotal += line;
      const fallbackDesc = it.productId?.description || it.description || "";
      const productName = it.name || it.productName || it.productId?.title || it.title || (fallbackDesc || "Item");
      const cat = categoryOf(productName, it.productId?.category || it.category);

      doc.fillColor(black).font("Helvetica-Bold").fontSize(11).text(productName, 48, y);
      doc.fillColor(gray600).font("Helvetica-Oblique").fontSize(9).text(cat, 48, y + 14);
      doc.fillColor(black).font("Helvetica").fontSize(11).text(String(qty), 400, y);
      doc.text(line.toFixed(2), 540, y, { align: "right" });

      y += 40;
      doc.strokeColor("#e5e7eb").moveTo(40, y - 12).lineTo(555, y - 12).stroke();
    });

    // Totals
    const totalsY = Math.max(y + 8, 500);
    const currency = (n) => `LKR ${(Number(n) || 0).toFixed(2)}`;
    doc.fillColor(black).font("Helvetica-Bold").fontSize(11);
    doc.text("Subtotal:", 420, totalsY);
    doc.text(currency(subtotal), 540, totalsY, { align: "right" });
    doc.text("Grand Total:", 400, totalsY + 20);
    doc.text(currency(subtotal), 540, totalsY + 20, { align: "right" });

    // Footer
    doc.fillColor(gray600).font("Helvetica").fontSize(10);
    doc.text("Thank you for shopping with Fashion Studio!", 297, 770, { align: "center" });
    doc.text("For any inquiries, please contact:", 297, 786, { align: "center" });
    doc.text("Email: support@fashionstudio.com | Phone: +94 11 234 5678 | Hotline: 1999", 297, 802, { align: "center" });
    doc.text("Business Hours: Monday - Saturday, 9:00 AM - 8:00 PM", 297, 818, { align: "center" });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate invoice" });
  }
}

export async function sendInvoice(req, res) {
  try {
    const { order, payment, email } = req.body;
    const doc = new PDFDocument();
    const filePath = `./invoices/invoice_${payment.transactionId}.pdf`;
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(20).text("Invoice", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Order ID: ${order._id}`);
    doc.text(`Payment ID: ${payment.transactionId}`);
    doc.text(`Payment Method: ${payment.method}`);
    doc.text(`Amount: Rs. ${payment.amount}`);
    doc.end();

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Invoice",
      text: "Please find attached invoice",
      attachments: [{ filename: "invoice.pdf", path: filePath }],
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}
