import prisma from "../config/prisma.js";

// ======================================================
// DEFAULT SETTINGS
// ======================================================
const DEFAULT_SETTINGS = Object.freeze({
  // ----------------------------------------------------
  // Association Information
  // ----------------------------------------------------
  associationName: "Ya Isa Zama Association",

  associationLogo: null,

  phone: "",
  email: "",
  website: "",
  address: "",

  // ----------------------------------------------------
  // Contribution Configuration
  // ----------------------------------------------------
  monthlyContributionAmount: 500,

  // Contribution collection started in December 2024
  contributionStartMonth: 12,
  contributionStartYear: 2024,

  currency: "NGN",

  // ----------------------------------------------------
  // Financial Year Configuration
  // ----------------------------------------------------
  financialYearStart: 2022,
  financialYearEnd: 2027,

  // ----------------------------------------------------
  // Meeting Information
  // ----------------------------------------------------
  meetingDay: "MONTH END",
  meetingTime: "7:00 PM",
  meetingVenue: "",

  // ----------------------------------------------------
  // Association Executives
  // ----------------------------------------------------
  chairmanName: "ZUKRANA ABDURRAHMAN",
  secretaryName: "ALIYU HARUNA",
  treasurerName: "ABDULLAHI HALLIRU ABDULHAMID",

  // ----------------------------------------------------
  // Association Payment Account
  // ----------------------------------------------------
  bankName: "Opay",
  accountName: "Abdullahi Halliru Abdulhamid",
  accountNumber: "7038491180",

  // ----------------------------------------------------
  // Document Number Prefixes
  // ----------------------------------------------------
  receiptPrefix: "RC",
  contributionPrefix: "CON",
  expensePrefix: "EXP",
});

// ======================================================
// INITIALIZE SETTINGS
// ======================================================
export const initializeSettings = async () => {
  let settings = await prisma.setting.findFirst({
    orderBy: {
      id: "asc",
    },
  });

  // ----------------------------------------------------
  // Create default settings if none exist
  // ----------------------------------------------------
  if (!settings) {
    settings = await prisma.setting.create({
      data: DEFAULT_SETTINGS,
    });

    return settings;
  }

  // ----------------------------------------------------
  // Ensure newly introduced contribution settings exist
  // for older database records.
  //
  // This is useful if the Setting record was created
  // before contributionStartMonth / contributionStartYear
  // were added to the schema.
  // ----------------------------------------------------
  const updates = {};

  if (
    settings.contributionStartMonth === null ||
    settings.contributionStartMonth === undefined
  ) {
    updates.contributionStartMonth =
      DEFAULT_SETTINGS.contributionStartMonth;
  }

  if (
    settings.contributionStartYear === null ||
    settings.contributionStartYear === undefined
  ) {
    updates.contributionStartYear =
      DEFAULT_SETTINGS.contributionStartYear;
  }

  // ----------------------------------------------------
  // Apply missing defaults only when necessary
  // ----------------------------------------------------
  if (Object.keys(updates).length > 0) {
    settings = await prisma.setting.update({
      where: {
        id: settings.id,
      },
      data: updates,
    });
  }

  return settings;
};

// ======================================================
// GET SETTINGS
// ======================================================
export const getSettings = async () => {
  return await initializeSettings();
};

// ======================================================
// GET MEMBER SETTINGS
// ======================================================
export const getMemberSettings = async () => {
  const settings = await initializeSettings();

  return {
    associationName: settings.associationName,
    associationLogo: settings.associationLogo,
    monthlyContributionAmount:
      Number(settings.monthlyContributionAmount) || 0,
    currency: settings.currency || "NGN",

    bankName: settings.bankName,
    accountName: settings.accountName,
    accountNumber: settings.accountNumber,
  };
};
// ======================================================
// UPDATE SETTINGS
// ======================================================
export const updateSettings = async (data) => {
  const settings = await initializeSettings();

  // ----------------------------------------------------
  // Build a clean update object.
  //
  // This prevents unrelated / invalid frontend fields
  // from accidentally being sent to Prisma.
  // ----------------------------------------------------
  const updateData = {};

  // ----------------------------------------------------
  // Association Information
  // ----------------------------------------------------
  if (data.associationName !== undefined) {
    updateData.associationName =
      data.associationName;
  }

  if (data.phone !== undefined) {
    updateData.phone = data.phone;
  }

  if (data.email !== undefined) {
    updateData.email = data.email;
  }

  if (data.website !== undefined) {
    updateData.website = data.website;
  }

  if (data.address !== undefined) {
    updateData.address = data.address;
  }

  // ----------------------------------------------------
  // Contribution Configuration
  // ----------------------------------------------------
  if (
    data.monthlyContributionAmount !== undefined
  ) {
    updateData.monthlyContributionAmount =
      Number(data.monthlyContributionAmount);
  }

  if (data.contributionStartMonth !== undefined) {
    const month = Number(
      data.contributionStartMonth
    );

    if (month < 1 || month > 12) {
      throw new Error(
        "Contribution start month must be between 1 and 12."
      );
    }

    updateData.contributionStartMonth = month;
  }

  if (data.contributionStartYear !== undefined) {
    const year = Number(
      data.contributionStartYear
    );

    if (year < 1900 || year > 2100) {
      throw new Error(
        "Contribution start year must be between 1900 and 2100."
      );
    }

    updateData.contributionStartYear = year;
  }

  if (data.currency !== undefined) {
    updateData.currency = data.currency;
  }

  // ----------------------------------------------------
  // Financial Year
  // ----------------------------------------------------
  if (data.financialYearStart !== undefined) {
    updateData.financialYearStart =
      Number(data.financialYearStart);
  }

  if (data.financialYearEnd !== undefined) {
    updateData.financialYearEnd =
      Number(data.financialYearEnd);
  }

  // ----------------------------------------------------
  // Validate Financial Year
  // ----------------------------------------------------
  const financialYearStart =
    updateData.financialYearStart ??
    settings.financialYearStart;

  const financialYearEnd =
    updateData.financialYearEnd ??
    settings.financialYearEnd;

  if (
    financialYearStart !== null &&
    financialYearEnd !== null &&
    Number(financialYearStart) >
      Number(financialYearEnd)
  ) {
    throw new Error(
      "Financial year start cannot be greater than financial year end."
    );
  }

  // ----------------------------------------------------
  // Meeting Information
  // ----------------------------------------------------
  if (data.meetingDay !== undefined) {
    updateData.meetingDay = data.meetingDay;
  }

  if (data.meetingTime !== undefined) {
    updateData.meetingTime = data.meetingTime;
  }

  if (data.meetingVenue !== undefined) {
    updateData.meetingVenue =
      data.meetingVenue;
  }

  // ----------------------------------------------------
  // Association Executives
  // ----------------------------------------------------
  if (data.chairmanName !== undefined) {
    updateData.chairmanName =
      data.chairmanName;
  }

  if (data.secretaryName !== undefined) {
    updateData.secretaryName =
      data.secretaryName;
  }

  if (data.treasurerName !== undefined) {
    updateData.treasurerName =
      data.treasurerName;
  }

  // ----------------------------------------------------
  // Payment Account
  // ----------------------------------------------------
  if (data.bankName !== undefined) {
    updateData.bankName = data.bankName;
  }

  if (data.accountName !== undefined) {
    updateData.accountName =
      data.accountName;
  }

  if (data.accountNumber !== undefined) {
    updateData.accountNumber =
      data.accountNumber;
  }

  // ----------------------------------------------------
  // Document Prefixes
  // ----------------------------------------------------
  if (data.receiptPrefix !== undefined) {
    updateData.receiptPrefix =
      data.receiptPrefix;
  }

  if (data.contributionPrefix !== undefined) {
    updateData.contributionPrefix =
      data.contributionPrefix;
  }

  if (data.expensePrefix !== undefined) {
    updateData.expensePrefix =
      data.expensePrefix;
  }

  // ----------------------------------------------------
  // Save Settings
  // ----------------------------------------------------
  return await prisma.setting.update({
    where: {
      id: settings.id,
    },
    data: updateData,
  });
};

// ======================================================
// UPDATE ASSOCIATION LOGO
// ======================================================
export const updateAssociationLogo = async (
  logoPath
) => {
  const settings = await initializeSettings();

  return await prisma.setting.update({
    where: {
      id: settings.id,
    },
    data: {
      associationLogo: logoPath,
    },
  });
};