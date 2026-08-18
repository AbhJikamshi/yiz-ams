import {
  createContribution,
  getContributions,
  getContributionById,
  getContributionsByMember,
  updateContribution,
  deleteContribution,
  getContributionOverview,
  getContributionsOverview,
} from "../services/contributionService.js";

// ============================================================
// Helper
// ============================================================

const parseId = (value) => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
};

// ============================================================
// GET ALL CONTRIBUTIONS
// GET /api/contributions
// ============================================================

export const getAll = async (req, res) => {
  try {
    const contributions = await getContributions();

    return res.status(200).json({
      success: true,
      data: contributions,
    });
  } catch (error) {
    console.error("Get contributions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load contributions.",
    });
  }
};

// ============================================================
// GET CONTRIBUTION BY ID
// GET /api/contributions/:id
// ============================================================

export const getById = async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "A valid contribution ID is required.",
      });
    }

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
    console.error("Get contribution by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load contribution.",
    });
  }
};

// ============================================================
// GET CONTRIBUTIONS BY MEMBER
// GET /api/contributions/member/:memberId
// ============================================================

export const getByMember = async (req, res) => {
  try {
    const memberId = parseId(req.params.memberId);

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: "A valid member ID is required.",
      });
    }

    const contributions =
      await getContributionsByMember(memberId);

    return res.status(200).json({
      success: true,
      data: contributions,
    });
  } catch (error) {
    console.error(
      "Get contributions by member error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load member contributions.",
    });
  }
};

// ============================================================
// GET MEMBER CONTRIBUTION OVERVIEW
// GET /api/contributions/overview
// ============================================================

export const getOverview = async (req, res) => {
  try {
    const overview = await getContributionOverview();

    return res.status(200).json({
      success: true,
      data: overview,
    });
  } catch (error) {
    console.error(
      "Get contribution overview error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load contribution overview.",
    });
  }
};

// ============================================================
// GET ADMIN MONTHLY CONTRIBUTION OVERVIEW
// GET /api/contributions/admin-overview
// ============================================================

export const getAdminOverview = async (req, res) => {
  try {
    const overview =
      await getContributionsOverview();

    return res.status(200).json({
      success: true,
      data: overview,
    });
  } catch (error) {
    console.error(
      "Get admin contribution overview error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load admin contribution overview.",
    });
  }
};

// ============================================================
// CREATE CONTRIBUTION
// POST /api/contributions
// ============================================================

export const create = async (req, res) => {
  try {
    const {
      memberId,
      monthNumber,
      year,
      amount,
      status,
      paymentDate,
    } = req.body;

    // -----------------------------
    // Validation
    // -----------------------------

    const parsedMemberId = parseId(memberId);
    const parsedMonth = Number(monthNumber);
    const parsedYear = Number(year);
    const parsedAmount = Number(amount);

    if (!parsedMemberId) {
      return res.status(400).json({
        success: false,
        message: "A valid member ID is required.",
      });
    }

    if (
      !Number.isInteger(parsedMonth) ||
      parsedMonth < 1 ||
      parsedMonth > 12
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Month number must be between 1 and 12.",
      });
    }

    if (
      !Number.isInteger(parsedYear) ||
      parsedYear < 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid year is required.",
      });
    }

    if (
      !Number.isFinite(parsedAmount) ||
      parsedAmount < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid contribution amount is required.",
      });
    }

    const contribution = await createContribution({
      memberId: parsedMemberId,
      monthNumber: parsedMonth,
      year: parsedYear,
      amount: parsedAmount,
      status: status || "PAID",
      paymentDate,
    });

    return res.status(201).json({
      success: true,
      message: "Contribution created successfully.",
      data: contribution,
    });
  } catch (error) {
    console.error(
      "Create contribution error:",
      error
    );

    // Prisma unique constraint
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message:
          "A contribution already exists for this member and month.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create contribution.",
    });
  }
};

// ============================================================
// UPDATE CONTRIBUTION
// PUT /api/contributions/:id
// ============================================================

export const update = async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "A valid contribution ID is required.",
      });
    }

    const {
      monthNumber,
      year,
      amount,
      status,
      paymentDate,
    } = req.body;

    const data = {};

    if (monthNumber !== undefined) {
      const parsedMonth = Number(monthNumber);

      if (
        !Number.isInteger(parsedMonth) ||
        parsedMonth < 1 ||
        parsedMonth > 12
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Month number must be between 1 and 12.",
        });
      }

      data.monthNumber = parsedMonth;
    }

    if (year !== undefined) {
      const parsedYear = Number(year);

      if (
        !Number.isInteger(parsedYear) ||
        parsedYear < 2000
      ) {
        return res.status(400).json({
          success: false,
          message: "A valid year is required.",
        });
      }

      data.year = parsedYear;
    }

    if (amount !== undefined) {
      const parsedAmount = Number(amount);

      if (
        !Number.isFinite(parsedAmount) ||
        parsedAmount < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "A valid amount is required.",
        });
      }

      data.amount = parsedAmount;
    }

    if (status !== undefined) {
      const allowedStatuses = [
        "PAID",
        "PENDING",
        "PARTIAL",
        "WAIVED",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid contribution status.",
        });
      }

      data.status = status;
    }

    if (paymentDate !== undefined) {
      const date = new Date(paymentDate);

      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment date.",
        });
      }

      data.paymentDate = paymentDate;
    }

    const contribution =
      await updateContribution(id, data);

    return res.status(200).json({
      success: true,
      message: "Contribution updated successfully.",
      data: contribution,
    });
  } catch (error) {
    console.error(
      "Update contribution error:",
      error
    );

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Contribution not found.",
      });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message:
          "A contribution already exists for this member and month.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update contribution.",
    });
  }
};

// ============================================================
// DELETE CONTRIBUTION
// DELETE /api/contributions/:id
// ============================================================

export const remove = async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "A valid contribution ID is required.",
      });
    }

    await deleteContribution(id);

    return res.status(200).json({
      success: true,
      message: "Contribution deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete contribution error:",
      error
    );

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Contribution not found.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete contribution.",
    });
  }
};