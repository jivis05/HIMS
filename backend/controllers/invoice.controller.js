const Invoice = require('../models/Invoice');
const { logAction } = require('../utils/auditLog');

// Generate a new invoice
exports.createInvoice = async (req, res) => {
  try {
    const { patient, items, dueDate } = req.body;
    
    if (!patient || !items || items.length === 0) {
      return res.status(400).json({ message: 'Patient and items are required' });
    }

    const totalAmount = items.reduce((sum, item) => sum + Number(item.amount), 0);

    const invoice = new Invoice({
      patient,
      issuedBy: req.user.id,
      items,
      totalAmount,
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default 7 days
    });

    await invoice.save();
    res.status(201).json({ message: 'Invoice created successfully', invoice });
  } catch (error) {
    res.status(500).json({ message: 'Error creating invoice', error: error.message });
  }
};

// Get all invoices (can be filtered by patient or status)
exports.getInvoices = async (req, res) => {
  try {
    const { patient, status } = req.query;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip  = (page - 1) * limit;

    let query = {};
    if (patient) query.patient = patient;
    if (status) query.status = status;

    // If user is a patient, they can only see their own invoices
    if (req.user.role === 'Patient') {
      query.patient = req.user.id;
    }

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .populate('patient', 'firstName lastName email phoneNumber')
        .populate('issuedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Invoice.countDocuments(query)
    ]);
      
    res.json({ invoices, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoices', error: error.message });
  }
};

// Record a payment
exports.recordPayment = async (req, res) => {
  try {
    const { amount, method } = req.body;
    if (!amount || !method) {
      return res.status(400).json({ message: 'Amount and payment method are required' });
    }

    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (invoice.status === 'Paid') return res.status(400).json({ message: 'Invoice is already fully paid' });

    invoice.payments.push({
      amount: Number(amount),
      method,
      collectedBy: req.user.id
    });

    invoice.amountPaid += Number(amount);

    if (invoice.amountPaid >= invoice.totalAmount) {
      invoice.status = 'Paid';
    } else if (invoice.amountPaid > 0) {
      invoice.status = 'Partial';
    }

    await invoice.save();

    await logAction(
      req.user.id, 'PAYMENT', 'Invoice',
      `Payment of ${amount} (${method}) recorded for invoice ${req.params.id}`,
      'Info', req.ip
    );

    res.json({ message: 'Payment recorded successfully', invoice });
  } catch (error) {
    res.status(500).json({ message: 'Error recording payment', error: error.message });
  }
};
