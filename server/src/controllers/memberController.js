import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";

// ======================================
// Shared member fields (hide password)
// ======================================
const memberSelect = {
  id: true,
  fullName: true,
  phone: true,
  email: true,
  address: true,
  status: true,
  contributionStartDate: true,
  createdAt: true,
  updatedAt: true,
};

// ===============================
// Get All Members
// ===============================
export const getMembers = async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: memberSelect,
    });

    return res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// ===============================
// Get Member by ID
// ===============================
export const getMemberById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const member = await prisma.member.findUnique({
      where: {
        id,
      },
      select: memberSelect,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: member,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// ===============================
// Create Member
// ===============================
export const createMember = async (req, res) => {
  try {
    const {
  fullName,
  phone,
  email,
  address,
  password,
  contributionStartDate,
} = req.body;

    if (!fullName || !phone) {
      return res.status(400).json({
        success: false,
        message: "Full name and phone are required.",
      });
    }

    let hashedPassword = null;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

   const member = await prisma.member.create({
  data: {
    fullName,
    phone,
    email,
    address,
    password: hashedPassword,

    contributionStartDate:
      contributionStartDate
        ? new Date(contributionStartDate)
        : null,
  },

  select: memberSelect,
});

    return res.status(201).json({
      success: true,
      message: "Member created successfully.",
      data: member,
    });

  } catch (error) {
    console.error(error);

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Phone or email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// ============================================================
// UPDATE MEMBER
// ============================================================

export const updateMember = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      fullName,
      phone,
      email,
      address,
      status,
      password,
      contributionStartDate,
    } = req.body;

    const memberId = Number(id);

    if (!Number.isInteger(memberId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid member ID",
      });
    }

    const existingMember =
      await prisma.member.findUnique({
        where: {
          id: memberId,
        },
      });

    if (!existingMember) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    const data = {};

    if (fullName !== undefined) {
      data.fullName = fullName.trim();
    }

    if (phone !== undefined) {
      data.phone =
        phone?.trim() || null;
    }

    if (email !== undefined) {
      data.email =
        email?.trim() || null;
    }

    if (address !== undefined) {
      data.address =
        address?.trim() || null;
    }

    if (status !== undefined) {
      data.status = status;
    }

    if (password !== undefined) {
      data.password =
        password?.trim() || null;
    }

    // --------------------------------------------------------
    // Contribution Start Date
    // --------------------------------------------------------

    if (
      contributionStartDate !== undefined
    ) {
      if (
        contributionStartDate === null ||
        contributionStartDate === ""
      ) {
        data.contributionStartDate = null;
      } else {
        const date =
          new Date(contributionStartDate);

        if (Number.isNaN(date.getTime())) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid contribution start date",
          });
        }

        data.contributionStartDate =
          date;
      }
    }

    const member =
      await prisma.member.update({
        where: {
          id: memberId,
        },

        data,
      });

    return res.json({
      success: true,
      message: "Member updated successfully",
      data: member,
    });
  } catch (error) {
    console.error(
      "UPDATE MEMBER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update member",
      error: error.message,
    });
  }
};

// ===============================
// Delete Member
// ===============================
export const deleteMember = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.member.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Member deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// ===============================
// Reset Member Password (ADMIN)
// ===============================
export const resetMemberPassword = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const member = await prisma.member.findUnique({
      where: {
        id,
      },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.member.update({
      where: {
        id,
      },
      data: {
        password: hashedPassword, // Change to passwordHash if that's your schema
      },
    });

    return res.status(200).json({
      success: true,
      message: "Member password reset successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};