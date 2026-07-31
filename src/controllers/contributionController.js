import * as contributionService from "../services/contributionService.js";

export const create = async (req, res, next) => {
  try {
    const contribution = await contributionService.createContribution(req.body);

    res.status(201).json({
      success: true,
      message: "Contribution recorded successfully.",
      data: contribution,
    });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const contributions = await contributionService.getContributions();

    res.json({
      success: true,
      data: contributions,
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const contribution = await contributionService.getContributionById(
      req.params.id
    );

    res.json({
      success: true,
      data: contribution,
    });
  } catch (error) {
    next(error);
  }
};

export const getByMember = async (req, res, next) => {
  try {
    const contributions =
      await contributionService.getContributionsByMember(
        req.params.memberId
      );

    res.json({
      success: true,
      data: contributions,
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const contribution =
      await contributionService.updateContribution(
        req.params.id,
        req.body
      );

    res.json({
      success: true,
      message: "Contribution updated successfully.",
      data: contribution,
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await contributionService.deleteContribution(req.params.id);

    res.json({
      success: true,
      message: "Contribution deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};