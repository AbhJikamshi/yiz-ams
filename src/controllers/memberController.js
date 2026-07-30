import prisma from "../config/prisma.js";

// ===============================
// Get All Members
// ===============================
export const getMembers = async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      orderBy: {
        createdAt: "desc",
      },
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
    const { fullName, phone, email } = req.body;

    const member = await prisma.member.create({
      data: {
        fullName,
        phone,
        email,
      },
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
        message: "Phone number already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// ===============================
// Update Member
// ===============================
export const updateMember = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { fullName, phone, email } = req.body;

    const member = await prisma.member.update({
      where: {
        id,
      },
      data: {
        fullName,
        phone,
        email,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Member updated successfully.",
      data: member,
    });
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Phone number already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
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