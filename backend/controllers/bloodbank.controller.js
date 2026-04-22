const BloodStock = require('../models/BloodStock');
const BloodDonor = require('../models/BloodDonor');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * @route   GET /api/bloodbank/stock
 * @desc    Get blood stock (scoped)
 */
const getBloodStock = async (req, res) => {
  try {
    const orgId = req.user.role === 'SUPER_ADMIN' ? req.query.organizationId : req.user.organizationId;
    if (!orgId && req.user.role !== 'SUPER_ADMIN') return sendError(res, 'Organization scope required', 400);

    let stock = await BloodStock.find({ organizationId: orgId });
    
    // Initialize stock if empty for this org
    if (stock.length === 0 && orgId) {
      const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      stock = await BloodStock.insertMany(groups.map(g => ({ 
        organizationId: orgId, 
        bloodGroup: g, 
        units: 0 
      })));
    }
    
    return sendSuccess(res, stock, `Found ${stock.length} blood group stocks`);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   POST /api/bloodbank/stock
 * @desc    Update blood stock
 */
const updateBloodStock = async (req, res) => {
  try {
    const { bloodGroup, units, action } = req.body;
    const orgId = req.user.organizationId;

    const stock = await BloodStock.findOne({ organizationId: orgId, bloodGroup });
    if (!stock) return sendError(res, 'Blood group not found in your organization', 404);

    if (action === 'add') {
      stock.units += Number(units);
    } else {
      if (stock.units < units) return sendError(res, 'Insufficient stock', 400);
      stock.units -= Number(units);
    }

    await stock.save();
    return sendSuccess(res, stock, 'Blood stock updated successfully');
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   GET /api/bloodbank/donors
 * @desc    Get blood donors (scoped)
 */
const getDonors = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'SUPER_ADMIN') {
      if (req.query.organizationId) query.organizationId = req.query.organizationId;
    } else {
      query.organizationId = req.user.organizationId;
    }

    const donors = await BloodDonor.find(query).sort({ lastDonationDate: -1 });
    return sendSuccess(res, donors, `Found ${donors.length} donors`);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   POST /api/bloodbank/donors
 * @desc    Add blood donor and update stock
 */
const addDonor = async (req, res) => {
  try {
    const { name, bloodGroup, phone, email, units } = req.body;
    const donationUnits = Number(units || 1);
    const orgId = req.user.organizationId;

    const donor = await BloodDonor.create({
      name, 
      bloodGroup, 
      phone, 
      email,
      organizationId: orgId,
      lastDonationDate: new Date(),
      donations: [{ date: new Date(), units: donationUnits }]
    });
    
    // Scoped stock update
    const stock = await BloodStock.findOne({ organizationId: orgId, bloodGroup });
    if (stock) {
      stock.units += donationUnits;
      await stock.save();
    }

    return sendSuccess(res, donor, 'Donor added and stock updated', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports = { getBloodStock, updateBloodStock, getDonors, addDonor };
