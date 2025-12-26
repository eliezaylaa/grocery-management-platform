const PDFDocument = require('pdfkit');

exports.generateReceiptPDF = (invoice) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fontSize(24).fillColor('#2563eb').text('Trinity Grocery', { align: 'center' });
      doc.fontSize(10).fillColor('#666').text('Your trusted grocery store', { align: 'center' });
      doc.moveDown(2);

      // Receipt title
      doc.fontSize(18).fillColor('#000').text('RECEIPT', { align: 'center' });
      doc.moveDown(0.5);
      
      // Invoice details box
      doc.fontSize(10).fillColor('#666');
      doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
      doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`);
      doc.text(`Payment Method: ${invoice.paymentMethod?.toUpperCase()}`);
      doc.text(`Payment Status: ${invoice.paymentStatus?.toUpperCase()}`);
      doc.moveDown(1);

      // Customer info
      if (invoice.user) {
        doc.fontSize(12).fillColor('#000').text('Customer Information:', { underline: true });
        doc.fontSize(10).fillColor('#666');
        const customerName = [invoice.user.firstName, invoice.user.lastName].filter(Boolean).join(' ') || 'N/A';
        doc.text(`Name: ${customerName}`);
        doc.text(`Email: ${invoice.user.email}`);
        if (invoice.user.phoneNumber) {
          doc.text(`Phone: ${invoice.user.phoneNumber}`);
        }
        doc.moveDown(1);
      }

      // Items table header
      doc.fontSize(12).fillColor('#000').text('Order Items:', { underline: true });
      doc.moveDown(0.5);

      // Table header
      const tableTop = doc.y;
      doc.fontSize(10).fillColor('#000');
      doc.text('Item', 50, tableTop, { width: 200 });
      doc.text('Qty', 260, tableTop, { width: 50, align: 'center' });
      doc.text('Price', 320, tableTop, { width: 80, align: 'right' });
      doc.text('Total', 410, tableTop, { width: 80, align: 'right' });

      // Divider line
      doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke('#ddd');

      // Items
      let y = tableTop + 25;
      doc.fontSize(10).fillColor('#333');

      if (invoice.items && invoice.items.length > 0) {
        invoice.items.forEach((item) => {
          const productName = item.product?.name || 'Product';
          const quantity = item.quantity;
          const unitPrice = parseFloat(item.unitPrice).toFixed(2);
          const subtotal = parseFloat(item.subtotal).toFixed(2);

          doc.text(productName.substring(0, 35), 50, y, { width: 200 });
          doc.text(quantity.toString(), 260, y, { width: 50, align: 'center' });
          doc.text(`€${unitPrice}`, 320, y, { width: 80, align: 'right' });
          doc.text(`€${subtotal}`, 410, y, { width: 80, align: 'right' });

          y += 20;

          // Add new page if needed
          if (y > 700) {
            doc.addPage();
            y = 50;
          }
        });
      }

      // Divider before totals
      doc.moveTo(50, y + 5).lineTo(545, y + 5).stroke('#ddd');
      y += 20;

      // Totals
      const subtotal = invoice.items?.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0) || 0;
      const tax = parseFloat(invoice.totalAmount) - subtotal;

      doc.fontSize(10).fillColor('#666');
      doc.text('Subtotal:', 320, y, { width: 80, align: 'right' });
      doc.text(`€${subtotal.toFixed(2)}`, 410, y, { width: 80, align: 'right' });
      y += 18;

      doc.text('VAT (20%):', 320, y, { width: 80, align: 'right' });
      doc.text(`€${tax.toFixed(2)}`, 410, y, { width: 80, align: 'right' });
      y += 18;

      // Total
      doc.fontSize(14).fillColor('#000');
      doc.text('TOTAL:', 320, y, { width: 80, align: 'right' });
      doc.text(`€${parseFloat(invoice.totalAmount).toFixed(2)}`, 410, y, { width: 80, align: 'right' });

      // Footer
      doc.fontSize(10).fillColor('#666');
      doc.text('Thank you for shopping with Trinity Grocery!', 50, 750, { align: 'center', width: 495 });
      doc.text('Questions? Contact us at support@trinity-grocery.com', 50, 765, { align: 'center', width: 495 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
