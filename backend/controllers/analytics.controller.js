const Appointment = require('../models/Appointment.model');
const Invoice = require('../models/Invoice');
const Inventory = require('../models/Inventory');
const User = require('../models/User.model');

const getDashboardStats = async (req, res) => {
  try {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const [appointments, revenue, inventoryStatus, users] = await Promise.all([
      Appointment.aggregate([
        { $match: { createdAt: { $gte: last30Days } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Invoice.aggregate([
        { $match: { status: 'Paid', createdAt: { $gte: last30Days } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$totalAmount' } } },
        { $sort: { _id: 1 } }
      ]),
      Inventory.aggregate([
        { $project: { itemName: 1, stockQuantity: 1, threshold: 1, isLow: { $lt: ['$stockQuantity', '$threshold'] } } },
        { $group: { _id: '$isLow', count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        appointmentVolume: appointments,
        revenueTrend: revenue,
        inventoryHealth: inventoryStatus,
        userDistribution: users
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats };
