const BloodStock = require('../models/BloodStock');
const BloodDonor = require('../models/BloodDonor');

const getBloodStock = async (req, res) => {
  try {
    const stock = await BloodStock.find();
    // Initialize stock if empty
    if (stock.length === 0) {
      const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      const initialStock = await BloodStock.insertMany(groups.map(g => ({ bloodGroup: g, units: 0 })));
      return res.status(200).json({ success: true, stock: initialStock });
    }
    res.status(200).json({ success: true, stock });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateBloodStock = async (req, res) => {
  try {
    const { bloodGroup, units, action } = req.body; // action: 'add' or 'subtract'
    const stock = await BloodStock.findOne({ bloodGroup });
    if (!stock) return res.status(404).json({ success: false, message: 'Blood group not found' });

    if (action === 'add') {
      stock.units += Number(units);
    } else {
      if (stock.units < units) return res.status(400).json({ success: false, message: 'Insufficient stock' });
      stock.units -= Number(units);
    }

    await stock.save();
    res.status(200).json({ success: true, stock });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDonors = async (req, res) => {
  try {
    const donors = await BloodDonor.find().sort({ lastDonationDate: -1 });
    res.status(200).json({ success: true, count: donors.length, donors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addDonor = async (req, res) => {
  try {
    const { name, bloodGroup, phone, email, units } = req.body;
    const donationUnits = Number(units || 1);
    const donor = await BloodDonor.create({
      name, bloodGroup, phone, email,
      lastDonationDate: new Date(),
      donations: [{ date: new Date(), units: donationUnits }]
    });
    
    // Also update blood stock
    const stock = await BloodStock.findOne({ bloodGroup });
    if (stock) {
      stock.units += donationUnits;
      await stock.save();
    }

    res.status(201).json({ success: true, donor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getBloodStock, updateBloodStock, getDonors, addDonor };
