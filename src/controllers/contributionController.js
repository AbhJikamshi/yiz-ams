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
   const contribution =
  await contributionService.getContributionById(
    Number(req.params.id)
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
    Number(req.params.memberId)
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
    Number(req.params.id),
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
    await contributionService.deleteContribution(
  Number(req.params.id)
);

    res.json({
      success: true,
      message: "Contribution deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};