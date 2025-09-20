import React from "react";
import { useLocation } from "react-router-dom";
import jsPDF from "jspdf";

const InvoicePage = () => {
  const { state } = useLocation();
  if (!state) return <p className="p-8 text-center">No invoice data provided.</p>;

  const { transaction, items, userDetails, orderId, amountToPay } = state;

  const handleDownload = () => {
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const black = [17, 24, 39];
      const gray600 = [75, 85, 99];
      const gray300 = [209, 213, 219];

      const { transactionId } = transaction || {};

      // Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(26);
      doc.setTextColor(...black);
      doc.text('Fashion Studio', 50, 60);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...gray600);
      doc.text('123 Galle Road, Colombo 03, Sri Lanka', 50, 78);
      doc.text('Phone: +94 11 234 5678 | Email: support@fashionstudio.com', 50, 92);
      doc.text('Website: www.fashionstudio.com | Hotline: 1999 (24/7)', 50, 106);

      // Badge
      doc.setDrawColor(...black);
      doc.setFillColor(...black);
      doc.roundedRect(420, 40, 140, 26, 4, 4, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text('SALES INVOICE', 490, 57, { align: 'center' });
      doc.setTextColor(...gray600);
      doc.setFont('helvetica', 'normal');
      doc.text('Page 1', 540, 30, { align: 'right' });

      // Separator
      doc.setDrawColor(...black);
      doc.setLineWidth(1);
      doc.line(50, 120, 540, 120);

      // Meta
      const label = (txt, x, y) => { doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...black); doc.text(txt, x, y); };
      const value = (txt, x, y) => { doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(...gray600); doc.text(txt, x, y); };

      const todayIso = new Date().toISOString().slice(0, 10);
      const buyerName = userDetails?.name || 'Guest User';
      const billingAddr = [
        userDetails?.addressLine1,
        userDetails?.addressLine2,
        `${userDetails?.city || ''}${userDetails?.state ? ', ' + userDetails.state : ''}`.trim(),
        userDetails?.country || 'Sri Lanka',
      ].filter(Boolean).join(', ');

      label('Bill To:', 50, 145); value(buyerName, 140, 145);
      label('Billing Address:', 50, 165); value(billingAddr || '—', 140, 165);
      label('Delivery Address:', 50, 185); value(billingAddr || '—', 160, 185);

      label('Invoice No:', 380, 145); value(transactionId || 'N/A', 460, 145);
      label('Invoice Date:', 380, 165); value(todayIso, 460, 165);

      label('Order Information', 50, 220);
      value(`Order Date: ${todayIso}`, 50, 237);
      label('Seller Information', 50, 265);
      value('Sold By: Fashion Studio', 50, 282);
      value('Address: 123 Galle Road, Colombo 03, Sri Lanka', 320, 282);
      label('Invoice Detail', 50, 315);

      // Header bar
      doc.setFillColor(245, 158, 11);
      doc.rect(50, 328, 490, 24, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text('Description', 60, 345);
      doc.text('Quantity', 365, 345);
      doc.text('Amount (LKR)', 455, 345);

      // Rows + pagination
      let y = 370;
      let subtotal = 0;
      let pageNo = 1;
      const drawContinuationHeader = () => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...gray600);
        doc.text(`Page ${pageNo}`, 540, 30, { align: 'right' });
        doc.setFillColor(245, 158, 11);
        doc.rect(50, 60, 490, 24, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.text('Description', 60, 77);
        doc.text('Quantity', 365, 77);
        doc.text('Amount (LKR)', 455, 77);
      };

      (items || []).forEach((it) => {
        const qty = it.quantity || 1;
        const line = (it.price || 0) * qty;
        subtotal += line;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...black);
        const fallbackDesc = it.productId?.description || it.description || '';
        const productName = it.name || it.productName || it.productId?.title || it.title || (fallbackDesc ? fallbackDesc : 'Item');
        doc.text(productName, 60, y);

        const rawCategory = (it.productId?.category || it.category || '').toLowerCase();
        let categoryLabel = rawCategory || '';
        if (!categoryLabel) {
          const t = (productName || '').toLowerCase();
          categoryLabel = /(ring|earring|necklace|jewel|bracelet)/.test(t) ? 'jewelry' : 'outfit';
        }
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(...gray600);
        const categoryText = categoryLabel.charAt(0).toUpperCase() + categoryLabel.slice(1);
        doc.text(categoryText, 60, y + 16);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(...black);
        doc.text(String(qty), 390, y);
        doc.text((line).toFixed(2), 520, y, { align: 'right' });

        y += 44;
        doc.setDrawColor(...gray300);
        doc.line(50, y - 16, 540, y - 16);

        if (y > 720) {
          doc.addPage();
          pageNo += 1;
          y = 104;
          drawContinuationHeader();
        }
      });

      // Totals
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...black);
      const totalsY = Math.max(y + 10, 500);
      const currency = (n) => `LKR ${(Number(n) || 0).toFixed(2)}`;
      doc.text('Subtotal:', 405, totalsY);
      doc.text(currency(subtotal), 520, totalsY, { align: 'right' });
      doc.text('Grand Total:', 390, totalsY + 22);
      doc.text(currency(subtotal), 520, totalsY + 22, { align: 'right' });

      // Footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...gray600);
      doc.text('Thank you for shopping with Fashion Studio!', 300, 780, { align: 'center' });
      doc.text('For any inquiries, please contact:', 300, 796, { align: 'center' });
      doc.text('Email: support@fashionstudio.com | Phone: +94 11 234 5678 | Hotline: 1999', 300, 812, { align: 'center' });
      doc.text('Business Hours: Monday - Saturday, 9:00 AM - 8:00 PM', 300, 828, { align: 'center' });

      const fileName = `FashionStudio_Invoice_${transactionId}.pdf`;
      // Trigger browser download to the user's default Downloads folder
      doc.save(fileName);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Invoice</h1>
        <button
          onClick={handleDownload}
          className="px-4 py-2 rounded-md bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
        >
          Download Invoice
        </button>
      </div>
      <div className="max-w-6xl mx-auto px-4 pb-8 text-gray-300">
        <p>Click the button above to generate and download your invoice.</p>
      </div>
    </div>
  );
};

export default InvoicePage;
