const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['Consultation', 'Lab Test', 'Pharmacy', 'Other'], required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId } // Optional link to Appointment/LabReport/Prescription
});

const invoiceSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The receptionist/admin who generated it
  items: [invoiceItemSchema],
  totalAmount: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  status: { type: String, enum: ['Unpaid', 'Partial', 'Paid', 'Canceled'], default: 'Unpaid' },
  payments: [{
    amount: { type: Number, required: true },
    method: { type: String, enum: ['Cash', 'Credit Card', 'Insurance', 'UPI'], required: true },
    date: { type: Date, default: Date.now },
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  dueDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
