// utils/invoiceGenerator.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a professional, vector-based, OCR-friendly PDF invoice
 * @param {Object} transactionData - Payment/order details
 * @param {Object} companyData - Buyer company details
 * @returns {Promise<Buffer>} - PDF buffer
 */
exports.generateInvoicePDF = (transactionData, companyData) => {
  return new Promise((resolve, reject) => {
    try {
      // A4 size, margins, metadata for accessibility
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Invoice ${transactionData.order_id}`,
          Author: 'Your Platform Pvt. Ltd.',
          Subject: 'Tax Invoice',
          Keywords: 'invoice, payment, GST, receipt',
          CreationDate: new Date()
        }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // ─────────────────────────────────────────────────────
      //  STYLES & HELPERS
      // ─────────────────────────────────────────────────────
      const COLORS = {
        primary: '#1a1a1a',
        secondary: '#666666',
        accent: '#2563eb',
        border: '#e5e7eb',
        success: '#059669'
      };

      const FONT = {
        bold: 'Helvetica-Bold',
        normal: 'Helvetica',
        mono: 'Courier'
      };

      const formatINR = (amount) => 
        `₹ ${parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

      const formatDate = (date) => 
        date ? new Date(date).toLocaleDateString('en-IN', {
          year: 'numeric', month: 'short', day: 'numeric'
        }) : '—';

      // ─────────────────────────────────────────────────────
      //  HEADER: Logo + Invoice Meta
      // ─────────────────────────────────────────────────────
      doc.fillColor(COLORS.primary).fontSize(22).font(FONT.bold)
        .text('TAX INVOICE', { align: 'center' });
      
      doc.moveDown(0.5);
      doc.fontSize(10).font(FONT.normal).fillColor(COLORS.secondary)
        .text('GST Compliant | E&OE', { align: 'center' });
      
      doc.moveDown(1);
      
      // Left: Supplier Details
      doc.fontSize(11).font(FONT.bold).fillColor(COLORS.primary)
        .text('Your Platform Pvt. Ltd.');
      doc.font(FONT.normal).fontSize(9).fillColor(COLORS.secondary)
        .text('123 Tech Park, Outer Ring Road')
        .text('Bangalore, Karnataka 560001, India')
        .text('GSTIN: 29ABCDE1234F1Z5')
        .text('CIN: U72900KA2020PTC123456')
        .text('billing@yourplatform.com | +91-9999111122');
      
      // Right: Invoice Details
      doc.fontSize(10).font(FONT.bold).fillColor(COLORS.primary)
        .text(`Invoice No: INV/${transactionData.order_id}`, { align: 'right', continued: true });
      doc.font(FONT.normal).fillColor(COLORS.secondary)
        .text(` | Date: ${formatDate(transactionData.created_at)}`, { align: 'right' });
      
      if (transactionData.razorpay?.payment_id) {
        doc.font(FONT.normal).fillColor(COLORS.secondary)
          .text(`Payment ID: ${transactionData.razorpay.payment_id}`, { align: 'right' });
      }
      
      doc.moveDown(1.5);
      
      // Horizontal rule
      doc.strokeColor(COLORS.border).moveTo(50, doc.y)
        .lineTo(545, doc.y).stroke();
      doc.moveDown(0.8);

      // ─────────────────────────────────────────────────────
      //  BILL TO: Customer Details
      // ─────────────────────────────────────────────────────
      doc.font(FONT.bold).fontSize(10).fillColor(COLORS.primary)
        .text('Bill To:', { underline: true });
      doc.font(FONT.normal).fontSize(9).fillColor(COLORS.secondary)
        .text(companyData.company_name || 'Registered Recruiter')
        .text(`User ID: ${companyData.user_id}`)
        .text(`Email: ${companyData.email || '—'}`)
        .text(`Phone: ${companyData.phone || '—'}`);
      
      doc.moveDown(1);

      // ─────────────────────────────────────────────────────
      //  ITEMS TABLE (Vector Text - OCR Friendly)
      // ─────────────────────────────────────────────────────
      const tableTop = doc.y;
      const tableLeft = 50;
      const col1Width = 380;
      const col2Width = 80;
      const col3Width = 85;
      
      // Table Header
      doc.font(FONT.bold).fontSize(9).fillColor(COLORS.primary);
      doc.text('Description', tableLeft, tableTop, { width: col1Width });
      doc.text('Qty', tableLeft + col1Width, tableTop, { width: col2Width, align: 'center' });
      doc.text('Amount (₹)', tableLeft + col1Width + col2Width, tableTop, { width: col3Width, align: 'right' });
      
      // Header underline
      doc.moveTo(tableLeft, doc.y + 5)
        .lineTo(tableLeft + col1Width + col2Width + col3Width, doc.y + 5)
        .strokeColor(COLORS.border).stroke();
      
      doc.moveDown(0.8);
      
      // Table Row: Service Item
      const itemDescription = transactionData.type === 'subscription'
        ? `${transactionData.plan?.name || 'Subscription Plan'} - ${transactionData.sub_type?.toUpperCase()}`
        : `${transactionData.job?.title || 'Job Posting'} (${transactionData.sub_type?.toUpperCase()})${transactionData.college_count > 0 ? ` • ${transactionData.college_count} Colleges` : ''}`;
      
      doc.font(FONT.normal).fontSize(9).fillColor(COLORS.primary);
      doc.text(itemDescription, tableLeft, doc.y, { width: col1Width, align: 'left' });
      doc.text('1', tableLeft + col1Width, doc.y, { width: col2Width, align: 'center' });
      doc.text(formatINR(transactionData.amount_breakup.base), tableLeft + col1Width + col2Width, doc.y, { width: col3Width, align: 'right' });
      
      doc.moveDown(1);
      
      // Subtotal line
      doc.moveTo(tableLeft, doc.y)
        .lineTo(tableLeft + col1Width + col2Width + col3Width, doc.y)
        .strokeColor(COLORS.border).stroke();
      doc.moveDown(0.5);

      // ─────────────────────────────────────────────────────
      //  TOTALS SECTION (Right-Aligned)
      // ─────────────────────────────────────────────────────
      const totalSectionX = 380;
      
      // Subtotal
      doc.font(FONT.normal).fontSize(9).fillColor(COLORS.secondary)
        .text('Subtotal:', totalSectionX, doc.y, { width: 80, align: 'right' });
      doc.font(FONT.normal).fillColor(COLORS.primary)
        .text(formatINR(transactionData.amount_breakup.base), totalSectionX + 85, doc.y, { width: 85, align: 'right' });
      doc.moveDown(0.4);
      
      // GST
      doc.font(FONT.normal).fontSize(9).fillColor(COLORS.secondary)
        .text('GST (18%):', totalSectionX, doc.y, { width: 80, align: 'right' });
      doc.font(FONT.normal).fillColor(COLORS.primary)
        .text(formatINR(transactionData.amount_breakup.tax), totalSectionX + 85, doc.y, { width: 85, align: 'right' });
      doc.moveDown(0.6);
      
      // TOTAL (Bold + Accent)
      doc.font(FONT.bold).fontSize(11).fillColor(COLORS.accent)
        .text('Total Amount:', totalSectionX, doc.y, { width: 80, align: 'right' });
      doc.font(FONT.bold).fontSize(12)
        .text(formatINR(transactionData.amount_breakup.total), totalSectionX + 85, doc.y, { width: 85, align: 'right' });
      
      doc.moveDown(1);
      
      // Amount in Words (Indian Format)
      doc.font(FONT.normal).fontSize(9).fillColor(COLORS.secondary)
        .text(`Amount in Words: ${numberToWordsIndian(parseFloat(transactionData.amount_breakup.total))} Rupees Only`, { align: 'center' });
      
      doc.moveDown(1.5);

      // ─────────────────────────────────────────────────────
      //  PAYMENT DETAILS
      // ─────────────────────────────────────────────────────
      doc.font(FONT.bold).fontSize(10).fillColor(COLORS.primary)
        .text('Payment Details:', { underline: true });
      doc.font(FONT.normal).fontSize(9).fillColor(COLORS.secondary)
        .text(`Status: ${transactionData.payment_status?.toUpperCase() || 'PENDING'}`)
        .text(`Method: ${transactionData.payment_method?.toUpperCase() || '—'}`)
        .text(`Paid On: ${formatDate(transactionData.paid_at)} ${transactionData.paid_at ? new Date(transactionData.paid_at).toLocaleTimeString('en-IN') : ''}`);
      
      if (transactionData.razorpay?.order_id) {
        doc.text(`Razorpay Order: ${transactionData.razorpay.order_id}`);
      }
      
      doc.moveDown(1.5);

      // ─────────────────────────────────────────────────────
      //  LEGAL FOOTER (GST Compliant)
      // ─────────────────────────────────────────────────────
      doc.moveTo(50, doc.y).lineTo(545, doc.y)
        .strokeColor(COLORS.border).stroke();
      doc.moveDown(0.5);
      
      doc.font(FONT.normal).fontSize(7).fillColor(COLORS.secondary)
        .text('This is a computer-generated invoice and does not require a physical signature.', { align: 'center' })
        .text('For queries: billing@yourplatform.com | GSTIN: 29ABCDE1234F1Z5 | SAC: 998314 (IT Services)', { align: 'center' })
        .text('E&OE: Errors and Omissions Excepted', { align: 'center' });
      
      // Optional: QR Code placeholder (you can add real QR with 'qr-image' package)
      // doc.image('path/to/qr.png', 450, doc.y + 20, { width: 80, height: 80 });
      
      doc.end();
      
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Convert number to Indian English words (Lakh/Crore format)
 * Simplified version - use 'indian-number-to-words' package for production
 */
function numberToWordsIndian(num) {
  if (num === 0) return 'Zero';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const toWords = (n) => {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n/10)] + (n%10 !== 0 ? ' ' + ones[n%10] : '');
    if (n < 1000) return ones[Math.floor(n/100)] + ' Hundred' + (n%100 !== 0 ? ' and ' + toWords(n%100) : '');
    if (n < 100000) return toWords(Math.floor(n/1000)) + ' Thousand' + (n%1000 !== 0 ? ' ' + toWords(n%1000) : '');
    if (n < 10000000) return toWords(Math.floor(n/100000)) + ' Lakh' + (n%100000 !== 0 ? ' ' + toWords(n%100000) : '');
    return toWords(Math.floor(n/10000000)) + ' Crore' + (n%10000000 !== 0 ? ' ' + toWords(n%10000000) : '');
  };
  
  const [intPart] = num.toString().split('.');
  return toWords(parseInt(intPart));
}