const LabReport = require('../models/LabReport.model');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * @route   GET /api/lab-reports
 * @desc    Get lab reports (scoped)
 */
const getLabReports = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'SUPER_ADMIN') {
      if (req.query.organizationId) query.organizationId = req.query.organizationId;
    } else {
      query.organizationId = req.user.organizationId;
    }

    if (req.user.role === 'PATIENT') query.patient = req.user._id;
    else if (req.user.role === 'DOCTOR') query.orderedBy = req.user._id;

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

    return sendSuccess(res, {
      labReports: reports,
      total,
      page,
      pages: Math.ceil(total / limit)
    }, `Found ${reports.length} reports`);
  } catch (error) {
    return sendError(res, error.message);
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
      patient, 
      orderedBy: req.user._id, 
      organizationId: req.user.organizationId,
      testType, 
      testCode, 
      sampleType, 
      priority
    });
    return sendSuccess(res, report, 'Lab test ordered successfully', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   PATCH /api/lab-reports/:id/result
 * @desc    Upload lab results (Lab Technician only)
 */
const uploadLabResult = async (req, res) => {
  try {
    const report = await LabReport.findById(req.params.id);
    if (!report) return sendError(res, 'Lab report not found', 404);

    // Security check
    if (req.user.role !== 'SUPER_ADMIN' && report.organizationId?.toString() !== req.user.organizationId?.toString()) {
      return sendError(res, 'Access denied', 403);
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

    return sendSuccess(res, report, 'Lab results uploaded successfully');
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports = { getLabReports, orderLabReport, uploadLabResult };
