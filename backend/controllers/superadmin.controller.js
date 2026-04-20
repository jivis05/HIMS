const Log = require('../models/Log');
const User = require('../models/User.model');
const Invoice = require('../models/Invoice');

const getLogs = async (req, res) => {
  try {
    const logs = await Log.find()
      .populate('user', 'firstName lastName role')
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSystemStats = async (req, res) => {
  try {
    const [userCount, doctorCount, totalRevenue] = await Promise.all([
      User.countDocuments({ role: 'Patient' }),
      User.countDocuments({ role: 'Doctor' }),
      Invoice.aggregate([
        { $match: { status: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      stats: {
        activePatients: userCount,
        doctorsOnStaff: doctorCount,
        totalRevenue: totalRevenue[0]?.total || 0,
        systemHealth: 'Optimal'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getLogs, getSystemStats };
