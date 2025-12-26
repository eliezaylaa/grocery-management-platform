const { Invoice, InvoiceItem, Product, User } = require('../models');
const pdfService = require('../services/pdf.service');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Get invoice with all details
const getInvoiceWithDetails = async (invoiceId, userId, userRole) => {
  const whereClause = { id: invoiceId };
  
  // Customers can only access their own invoices
  if (userRole === 'customer') {
    whereClause.userId = userId;
  }

  const invoice = await Invoice.findOne({
    where: whereClause,
    include: [
      {
        model: InvoiceItem,
        as: 'items',
        include: [{ model: Product, as: 'product' }]
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'firstName', 'lastName', 'phoneNumber']
      }
    ]
  });

  return invoice;
};

// Download receipt as PDF
exports.downloadReceiptPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await getInvoiceWithDetails(id, req.user.id, req.user.role);

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const pdfBuffer = await pdfService.generateReceiptPDF(invoice);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${invoice.invoiceNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate receipt PDF' });
  }
};

// Send receipt via email
exports.sendReceiptEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const invoice = await getInvoiceWithDetails(id, req.user.id, req.user.role);

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const recipientEmail = email || invoice.user?.email || req.user.email;

    if (!recipientEmail) {
      return res.status(400).json({ error: 'No email address available' });
    }

    console.log('Sending receipt email to:', recipientEmail);

    // Generate PDF
    const pdfBuffer = await pdfService.generateReceiptPDF(invoice);
    const pdfBase64 = pdfBuffer.toString('base64');

    // Build items HTML
    const itemsHtml = invoice.items?.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product?.name || 'Product'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">€${parseFloat(item.unitPrice).toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">€${parseFloat(item.subtotal).toFixed(2)}</td>
      </tr>
    `).join('') || '';

    // Send email with PDF attachment
    const { data, error } = await resend.emails.send({
      from: 'Trinity Grocery <onboarding@resend.dev>',
      to: recipientEmail,
      subject: `Your Receipt - Order ${invoice.invoiceNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .order-info { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f3f4f6; padding: 10px; text-align: left; }
            .total { font-size: 18px; font-weight: bold; color: #2563eb; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛒 Trinity Grocery</h1>
            </div>
            <div class="content">
              <h2>Thank you for your order!</h2>
              
              <div class="order-info">
                <p><strong>Order Number:</strong> ${invoice.invoiceNumber}</p>
                <p><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
                <p><strong>Payment Method:</strong> ${invoice.paymentMethod?.toUpperCase() || 'N/A'}</p>
                <p><strong>Status:</strong> ${invoice.paymentStatus?.toUpperCase() || 'N/A'}</p>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Price</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="text-align: right; margin-top: 20px;">
                <p class="total">Total: €${parseFloat(invoice.totalAmount).toFixed(2)}</p>
              </div>

              <p style="margin-top: 20px; padding: 15px; background: #dbeafe; border-radius: 8px;">
                📎 Your receipt is attached as a PDF for your records.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Trinity Grocery. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `receipt-${invoice.invoiceNumber}.pdf`,
          content: pdfBase64,
        }
      ]
    });

    if (error) {
      console.error('Resend error:', error);
      
      // Check if it's a Resend free tier limitation
      if (error.message?.includes('only send testing emails')) {
        return res.status(400).json({ 
          error: 'Demo limitation: Can only send to verified email (eliezaylaa@gmail.com). In production, verify your domain on Resend.' 
        });
      }
      
      return res.status(500).json({ error: error.message || 'Failed to send email' });
    }

    console.log('Receipt email sent successfully:', data?.id);
    res.json({ message: 'Receipt sent successfully', emailId: data?.id });
  } catch (error) {
    console.error('Send receipt error:', error);
    res.status(500).json({ error: error.message || 'Failed to send receipt' });
  }
};
