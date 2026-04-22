const Appointment = require('../models/Appointment.model');
const Invoice = require('../models/Invoice');
const Inventory = require('../models/Inventory');
const User = require('../models/User.model');
const mongoose = require('mongoose');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * @route   GET /api/analytics/stats
 * @desc    Get dashboard analytics (scoped by organization)
 */
const getDashboardStats = async (req, res) => {
  try {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const matchQuery = {};
    if (req.user.role !== 'SUPER_ADMIN') {
      matchQuery.organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    } else if (req.query.organizationId) {
      matchQuery.organizationId = new mongoose.Types.ObjectId(req.query.organizationId);
    }

    const [appointments, revenue, inventoryStatus, users] = await Promise.all([
      Appointment.aggregate([
        { $match: { ...matchQuery, createdAt: { $gte: last30Days } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Invoice.aggregate([
        { $match: { ...matchQuery, status: 'Paid', createdAt: { $gte: last30Days } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$totalAmount' } } },
        { $sort: { _id: 1 } }
      ]),
      Inventory.aggregate([
        { $match: matchQuery },
        { $project: { itemName: 1, stockQuantity: 1, threshold: 1, isLow: { $lt: ['$stockQuantity', '$threshold'] } } },
        { $group: { _id: '$isLow', count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $match: matchQuery },
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ])
    ]);

    return sendSuccess(res, {
      appointmentVolume: appointments,
      revenueTrend: revenue,
      inventoryHealth: inventoryStatus,
      userDistribution: users
    }, 'Analytics fetched successfully');
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports = { getDashboardStats };
