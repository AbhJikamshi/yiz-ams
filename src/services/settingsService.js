import prisma from "../config/prisma.js";

const DEFAULT_SETTINGS = Object.freeze({
  associationName: "Ya Isa Zama Association",
  monthlyContributionAmount: 500,
  currency: "NGN",

  financialYearStart: 2022,
  financialYearEnd: 2027,

  meetingDay: "MONTH END",
  meetingTime: "7:00 PM",
  meetingVenue: "",

  chairmanName: "ZUKRANA ABDURRAHMAN",
  secretaryName: "ALIYU HARUNA",
  treasurerName: "ABDULLAHI HALLIRU ABDULHAMID",

  phone: "",
  email: "",
  website: "",
  address: "",

  receiptPrefix: "RC",
  contributionPrefix: "CON",
  expensePrefix: "EXP",
});

// ===============================
// Initialize Settings
// ===============================
export const initializeSettings = async () => {
  let settings = await prisma.setting.findFirst();

  if (!settings) {
    settings = await prisma.setting.create({
      data: DEFAULT_SETTINGS,
    });
  }

  return settings;
};

// ===============================
// Get Settings
// ===============================
export const getSettings = async () => {
  return await initializeSettings();
};

// ===============================
// Update Settings
// ===============================
export const updateSettings = async (data) => {
  const settings = await initializeSettings();

  return await prisma.setting.update({
    where: {
      id: settings.id,
    },
    data,
  });
};