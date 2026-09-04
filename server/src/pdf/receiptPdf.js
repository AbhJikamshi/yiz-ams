import PDFDocument from "pdfkit";
import fs from "fs";
import prisma from "../config/prisma.js";

import { receiptNumber } from "../utils/receiptNumber.js";
import { getMonthName } from "../utils/monthName.js";

// ======================================================
// FILE PATHS
// ======================================================

const FONT_REGULAR = "C:/Windows/Fonts/segoeui.ttf";
const FONT_BOLD = "C:/Windows/Fonts/segoeuib.ttf";

// ======================================================
// HELPERS
// ======================================================

const NAIRA = "\u20A6";

const currency = (amount) => {
  return `${NAIRA}${Number(amount ?? 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const safeDate = (date) => {
  if (!date) {
    return "-";
  }

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "-";
  }

  return value.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ======================================================
// GET CURRENT ASSOCIATION SETTINGS
// ======================================================

const getAssociationSettings = async () => {
  try {
    const settings = await prisma.setting.findFirst({
      select: {
        associationName: true,
        associationLogo: true,
      },
    });

    return settings;
  } catch (error) {
    console.error(
      "Failed to load association settings:",
      error.message
    );

    return null;
  }
};

// ======================================================
// GET CURRENT ASSOCIATION LOGO PATH
// ======================================================

const getAssociationLogoPath = (associationLogo) => {
  if (!associationLogo) {
    return null;
  }

  let logoPath;

  if (associationLogo.startsWith("/")) {
    logoPath = `${process.cwd()}/src${associationLogo}`;
  } else {
    logoPath = associationLogo;
  }

  if (!fs.existsSync(logoPath)) {
    console.warn(
      "Association logo file not found:",
      logoPath
    );

    return null;
  }

  return logoPath;
};

// ======================================================
// PDF GENERATOR
// ======================================================

export const generateReceiptPDF = async (
  res,
  contribution
) => {
  // ====================================================
  // SETTINGS
  // ====================================================

  const settings =
    await getAssociationSettings();

  const associationName =
    settings?.associationName ||
    "YA ISA ZAMA ASSOCIATION";

  const associationLogo =
    getAssociationLogoPath(
      settings?.associationLogo
    );

  // ====================================================
  // CREATE PDF
  // ====================================================

  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    bufferPages: true,
  });

  // ====================================================
  // RESPONSE HEADERS
  // ====================================================

  res.setHeader(
    "Content-Type",
    "application/pdf"
  );

  res.setHeader(
    "Content-Disposition",
    `inline; filename=${receiptNumber(
      contribution.id
    )}.pdf`
  );

  doc.pipe(res);

  // ====================================================
  // FONTS
  // ====================================================

  const regularFont = fs.existsSync(FONT_REGULAR)
    ? FONT_REGULAR
    : "C:/Windows/Fonts/arial.ttf";

  const boldFont = fs.existsSync(FONT_BOLD)
    ? FONT_BOLD
    : "C:/Windows/Fonts/arialbd.ttf";

  // ====================================================
  // COLORS
  // ====================================================

  const primaryColor = "#1F4E78";
  const secondaryColor = "#F3F6F9";
  const borderColor = "#D9E1E8";
  const textColor = "#222222";
  const mutedColor = "#666666";
  const successColor = "#198754";

  // ====================================================
  // PAGE DIMENSIONS
  // ====================================================

  const left = 50;
  const right = doc.page.width - 50;
  const contentWidth = right - left;

  // ====================================================
  // HEADER
  // ====================================================

  if (associationLogo) {
    try {
      doc.image(
        associationLogo,
        left,
        35,
        {
          fit: [75, 75],
          align: "left",
          valign: "center",
        }
      );
    } catch (error) {
      console.error(
        "Unable to load association logo:",
        error.message
      );
    }
  }

  const headerX = left + 90;
  const headerWidth =
    contentWidth - 90;

  doc
    .font(boldFont)
    .fontSize(19)
    .fillColor(primaryColor)
    .text(
      associationName.toUpperCase(),
      headerX,
      43,
      {
        width: headerWidth,
        align: "center",
      }
    );

  doc
    .font(boldFont)
    .fontSize(14)
    .fillColor(textColor)
    .text(
      "OFFICIAL CONTRIBUTION RECEIPT",
      headerX,
      70,
      {
        width: headerWidth,
        align: "center",
      }
    );

  doc
    .moveTo(left, 120)
    .lineTo(right, 120)
    .lineWidth(1)
    .strokeColor(primaryColor)
    .stroke();

  doc.y = 140;

  // ====================================================
  // RECEIPT DETAILS
  // ====================================================

  const detailsTop = doc.y;

  doc
    .roundedRect(
      left,
      detailsTop,
      contentWidth,
      65,
      8
    )
    .fillColor(secondaryColor)
    .fill();

  const infoY = detailsTop + 13;

  doc
    .font(boldFont)
    .fontSize(10)
    .fillColor(mutedColor)
    .text(
      "RECEIPT NUMBER",
      left + 15,
      infoY
    );

  doc
    .font(boldFont)
    .fontSize(13)
    .fillColor(primaryColor)
    .text(
      receiptNumber(contribution.id),
      left + 15,
      infoY + 18
    );

  doc
    .font(boldFont)
    .fontSize(10)
    .fillColor(mutedColor)
    .text(
      "GENERATED",
      right - 150,
      infoY,
      {
        width: 135,
        align: "right",
      }
    );

  doc
    .font(regularFont)
    .fontSize(11)
    .fillColor(textColor)
    .text(
      safeDate(contribution.createdAt),
      right - 150,
      infoY + 19,
      {
        width: 135,
        align: "right",
      }
    );

  doc.y = detailsTop + 95;

  // ====================================================
  // MEMBER INFORMATION
  // ====================================================

  doc
    .font(boldFont)
    .fontSize(14)
    .fillColor(primaryColor)
    .text("Member Information");

  doc.moveDown(0.8);

  const memberInfo = [
    [
      "Name",
      contribution?.member?.fullName || "-",
    ],
    [
      "Contribution Amount",
      currency(contribution?.amount),
    ],
    [
      "Contribution Month",
      `${getMonthName(
        contribution?.monthNumber
      )} ${contribution?.year || ""}`,
    ],
    [
      "Status",
      contribution?.status || "-",
    ],
  ];

  const rowHeight = 42;
  let rowY = doc.y;

  memberInfo.forEach(
    ([label, value], index) => {
      const background =
        index % 2 === 0
          ? "#FFFFFF"
          : secondaryColor;

      doc
        .rect(
          left,
          rowY,
          contentWidth,
          rowHeight
        )
        .fillColor(background)
        .fill();

      doc
        .font(boldFont)
        .fontSize(10)
        .fillColor(mutedColor)
        .text(
          label.toUpperCase(),
          left + 15,
          rowY + 8
        );

      doc
        .font(
          label === "Status" &&
          value === "PAID"
            ? boldFont
            : regularFont
        )
        .fontSize(12)
        .fillColor(
          label === "Status" &&
          value === "PAID"
            ? successColor
            : textColor
        )
        .text(
          value,
          left + 15,
          rowY + 22
        );

      doc
        .moveTo(
          left,
          rowY + rowHeight
        )
        .lineTo(
          right,
          rowY + rowHeight
        )
        .lineWidth(0.5)
        .strokeColor(borderColor)
        .stroke();

      rowY += rowHeight;
    }
  );

  doc
    .rect(
      left,
      doc.y,
      contentWidth,
      rowY - doc.y
    )
    .lineWidth(0.5)
    .strokeColor(borderColor)
    .stroke();

  doc.y = rowY + 30;

  // ====================================================
  // THANK YOU
  // ====================================================

  doc
    .font(boldFont)
    .fontSize(13)
    .fillColor(primaryColor)
    .text(
      "Thank You",
      {
        align: "center",
      }
    );

  doc.moveDown(0.5);

  doc
    .font(regularFont)
    .fontSize(11)
    .fillColor(textColor)
    .text(
      `Thank you for supporting ${associationName}.`,
      {
        align: "center",
      }
    );

  // ====================================================
  // TREASURER SIGNATURE
  // ====================================================

  doc.moveDown(4);

  doc
    .font(regularFont)
    .fontSize(10)
    .fillColor(textColor)
    .text(
      "________________________________________",
      {
        align: "right",
      }
    );

  doc
    .font(boldFont)
    .fontSize(10)
    .fillColor(textColor)
    .text(
      "Treasurer Signature",
      {
        align: "right",
      }
    );

  // ====================================================
  // FOOTER
  // IMPORTANT: Keep footer safely above bottom margin.
  // ====================================================

  const range =
    doc.bufferedPageRange();

  for (
    let pageIndex = range.start;
    pageIndex <
    range.start + range.count;
    pageIndex++
  ) {
    doc.switchToPage(pageIndex);

    // Safely above the bottom page boundary
    const footerY =
      doc.page.height - 72;

    doc
      .moveTo(
        left,
        footerY - 10
      )
      .lineTo(
        right,
        footerY - 10
      )
      .lineWidth(0.5)
      .strokeColor(borderColor)
      .stroke();

    doc
      .font(regularFont)
      .fontSize(8.5)
      .fillColor(mutedColor)
      .text(
        associationName,
        left,
        footerY,
        {
          width:
            contentWidth / 2,
          align: "left",
        }
      );

    doc
      .font(regularFont)
      .fontSize(8.5)
      .fillColor(mutedColor)
      .text(
        `Receipt ${receiptNumber(
          contribution.id
        )}`,
        right -
          contentWidth / 2,
        footerY,
        {
          width:
            contentWidth / 2,
          align: "right",
        }
      );
  }

  // ====================================================
  // FINISH
  // ====================================================

  doc.end();
};