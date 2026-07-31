import {
  createContribution,
  getContributions,
  getContributionById,
  getContributionsByMember,
  updateContribution,
  deleteContribution,
} from "../services/contributionService.js";

// ===============================
// Create Contribution
// ===============================
export const create = async (req, res, next) => {
  try {
    const contribution = await createContribution(req.body);

    return res.status(201).json({
      success: true,
      message: "Contribution recorded successfully.",
      data: contribution,
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// Get All Contributions
// ===============================
export const getAll = async (req, res, next) => {
  try {
    const contributions = await getContributions();

    return res.status(200).json({
      success: true,
      data: contributions,
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// Get Contribution by ID
// ===============================
export const getById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const contribution = await getContributionById(id);

    if (!contribution) {
      return res.status(404).json({
        success: false,
        message: "Contribution not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: contribution,
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// Get Contributions by Member
// ===============================
export const getByMember = async (req, res, next) => {
  try {
    const memberId = Number(req.params.memberId);

    const contributions = await getContributionsByMember(memberId);

    return res.status(200).json({
      success: true,
      data: contributions,
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// Update Contribution
// ===============================
export const update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const contribution = await updateContribution(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Contribution updated successfully.",
      data: contribution,
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// Delete Contribution
// ===============================
export const remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    await deleteContribution(id);

    return res.status(200).json({
      success: true,
      message: "Contribution deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};