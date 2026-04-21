const LabReport = require('../models/LabReport.model');

/**
 * @route   GET /api/lab-reports
 * @desc    Get lab reports (role-aware)
 */
const getLabReports = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Patient') query.patient = req.user._id;
    else if (req.user.role === 'Doctor') query.orderedBy = req.user._id;
    // Lab_Technician and admins see all reports (pending and completed)

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip  = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      LabReport.find(query)
        .populate('patient', 'firstName lastName')
        .populate('orderedBy', 'firstName lastName specialty')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      LabReport.countDocuments(query)
    ]);

    res.status(200).json({ success: true, count: reports.length, total, page, pages: Math.ceil(total / limit), labReports: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/lab-reports
 * @desc    Order a lab test (Doctor only)
 */
const orderLabReport = async (req, res) => {
  try {
    const { patient, testType, testCode, sampleType, priority } = req.body;
    const report = await LabReport.create({
      patient, orderedBy: req.user._id, testType, testCode, sampleType, priority
    });
    res.status(201).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PATCH /api/lab-reports/:id/result
 * @desc    Upload lab results (Lab Technician only)
 */
const uploadLabResult = async (req, res) => {
  try {
    const report = await LabReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Lab report not found.' });
    }
    const { results, remarks, isCritical, reportFileUrl } = req.body;
    report.results = results;
    report.remarks = remarks;
    report.isCritical = isCritical || false;
    report.reportFileUrl = reportFileUrl;
    report.status = 'Completed';
    report.processedBy = req.user._id;
    report.completedAt = new Date();
    await report.save();

    res.status(200).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getLabReports, orderLabReport, uploadLabResult };
