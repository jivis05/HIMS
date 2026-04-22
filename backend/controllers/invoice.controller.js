const Invoice = require('../models/Invoice');
const { logAction } = require('../utils/auditLog');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * @route   POST /api/invoices
 * @desc    Generate a new invoice
 */
const createInvoice = async (req, res) => {
  try {
    const { patient, items, dueDate } = req.body;
    
    if (!patient || !items || items.length === 0) {
      return sendError(res, 'Patient and items are required', 400);
    }

    const totalAmount = items.reduce((sum, item) => sum + Number(item.amount), 0);

    const invoice = new Invoice({
      patient,
      issuedBy: req.user._id,
      organizationId: req.user.organizationId,
      items,
      totalAmount,
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    await invoice.save();
    return sendSuccess(res, invoice, 'Invoice created successfully', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   GET /api/invoices
 * @desc    Get invoices (scoped by organization)
 */
const getInvoices = async (req, res) => {
  try {
    const { patient, status } = req.query;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip  = (page - 1) * limit;

    const query = {};
    
    // Multi-tenant scoping
    if (req.user.role === 'SUPER_ADMIN') {
      if (req.query.organizationId) query.organizationId = req.query.organizationId;
    } else {
      query.organizationId = req.user.organizationId;
    }

    if (patient) query.patient = patient;
    if (status) query.status = status;

    // Role-based filtering
    if (req.user.role === 'PATIENT') {
      query.patient = req.user._id;
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
      
    return sendSuccess(res, {
      invoices,
      total,
      page,
      pages: Math.ceil(total / limit)
    }, `Found ${invoices.length} invoices`);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   POST /api/invoices/:id/payment
 * @desc    Record a payment
 */
const recordPayment = async (req, res) => {
  try {
    const { amount, method } = req.body;
    if (!amount || !method) {
      return sendError(res, 'Amount and payment method are required', 400);
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return sendError(res, 'Invoice not found', 404);

    // Security check
    if (req.user.role !== 'SUPER_ADMIN' && invoice.organizationId?.toString() !== req.user.organizationId?.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    if (invoice.status === 'Paid') return sendError(res, 'Invoice is already fully paid', 400);

    invoice.payments.push({
      amount: Number(amount),
      method,
      collectedBy: req.user._id
    });

    invoice.amountPaid += Number(amount);

    if (invoice.amountPaid >= invoice.totalAmount) {
      invoice.status = 'Paid';
    } else if (invoice.amountPaid > 0) {
      invoice.status = 'Partial';
    }

    await invoice.save();

    await logAction(
      req.user._id, 'PAYMENT', 'Invoice',
      `Payment of ${amount} recorded for invoice ${req.params.id}`,
      'Info', req.ip
    );

    return sendSuccess(res, invoice, 'Payment recorded successfully');
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports = { createInvoice, getInvoices, recordPayment };
