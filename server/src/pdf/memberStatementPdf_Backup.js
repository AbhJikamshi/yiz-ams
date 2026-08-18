import PDFDocument from "pdfkit";
import fs from "fs";
import prisma from "../config/prisma.js";

// ======================================================
// FILE PATHS
// ======================================================

const FONT_REGULAR = "C:/Windows/Fonts/segoeui.ttf";
const FONT_BOLD = "C:/Windows/Fonts/segoeuib.ttf";

// ======================================================
// MONTH NAMES
// ======================================================

const monthNames = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// ======================================================
// HELPERS
// ======================================================

const formatCurrency = (amount) => {
  return `₦${Number(amount ?? 0).toLocaleString(
    "en-NG",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
};

const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "-";
  }

  return value.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const formatGeneratedDate = () => {
  return new Date().toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

// ======================================================
// PDF GENERATOR
// ======================================================

export const generateMemberStatementPDF = async (
  res,
  data
) => {
  try {
    // ==================================================
    // LOAD SETTINGS
    // ==================================================

    const settings =
      await prisma.setting.findFirst();

    const associationName =
      settings?.associationName ||
      "YA ISA ZAMA ASSOCIATION";

    // ==================================================
    // CURRENT LOGO
    // ==================================================

    let logoPath = null;

    if (settings?.associationLogo) {
      if (
        settings.associationLogo.startsWith("/")
      ) {
        logoPath =
          `${process.cwd()}/src${settings.associationLogo}`;
      } else {
        logoPath =
          settings.associationLogo;
      }
    }

    if (
      logoPath &&
      !fs.existsSync(logoPath)
    ) {
      console.warn(
        "Association logo file not found:",
        logoPath
      );

      logoPath = null;
    }

    // ==================================================
    // MEMBER
    // ==================================================

    const memberName =
      data?.member?.fullName || "Member";

    const safeFileName = memberName
      .replace(
        /[^a-zA-Z0-9\s-_]/g,
        ""
      )
      .trim()
      .replace(/\s+/g, "_");

    // ==================================================
    // CREATE PDF
    // ==================================================

    const doc = new PDFDocument({
      size: "A4",
      margin: 45,
      bufferPages: true,
    });

    // ==================================================
    // RESPONSE
    // ==================================================

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Member_Statement_${safeFileName}.pdf`
    );

    doc.pipe(res);

    // ==================================================
    // FONTS
    // ==================================================

    const regularFont =
      fs.existsSync(FONT_REGULAR)
        ? FONT_REGULAR
        : "Helvetica";

    const boldFont =
      fs.existsSync(FONT_BOLD)
        ? FONT_BOLD
        : "Helvetica-Bold";

    // ==================================================
    // COLORS
    // ==================================================

    const primaryColor = "#1F4E78";
    const secondaryColor = "#F3F6F9";
    const borderColor = "#D9E1E8";
    const textColor = "#222222";
    const mutedColor = "#666666";
    const successColor = "#198754";

    // ==================================================
    // PAGE
    // ==================================================

    const left = 45;
    const right =
      doc.page.width - 45;

    const contentWidth =
      right - left;

    // ==================================================
    // HEADER
    // ==================================================

    if (logoPath) {
      try {
        doc.image(
          logoPath,
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

    const headerStartX =
      left + 90;

    const headerWidth =
      contentWidth - 90;

    doc
      .font(boldFont)
      .fontSize(18)
      .fillColor(primaryColor)
      .text(
        associationName,
        headerStartX,
        42,
        {
          width: headerWidth,
          align: "center",
        }
      );

    doc
      .font(boldFont)
      .fontSize(15)
      .fillColor(textColor)
      .text(
        "MEMBER CONTRIBUTION STATEMENT",
        headerStartX,
        68,
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

    // ==================================================
    // MEMBER INFORMATION
    // ==================================================

    doc
      .font(boldFont)
      .fontSize(14)
      .fillColor(primaryColor)
      .text("Member Information");

    doc.moveDown(0.7);

    const infoTop = doc.y;

    const labelWidth = 115;

    const valueX =
      left +
      labelWidth +
      10;

    const valueWidth =
      contentWidth -
      labelWidth -
      10;

    const memberInfo = [
      [
        "Member Name:",
        memberName,
      ],
      [
        "Phone:",
        data?.member?.phone || "-",
      ],
      [
        "Email:",
        data?.member?.email || "-",
      ],
      [
        "Status:",
        data?.member?.status || "-",
      ],
    ];

    memberInfo.forEach(
      ([label, value]) => {
        doc
          .font(boldFont)
          .fontSize(10.5)
          .fillColor(textColor)
          .text(
            label,
            left + 8,
            doc.y + 7,
            {
              width: labelWidth,
            }
          );

        doc
          .font(regularFont)
          .fontSize(10.5)
          .fillColor(textColor)
          .text(
            value,
            valueX,
            doc.y,
            {
              width: valueWidth,
            }
          );

        doc.y += 24;
      }
    );

    const infoBottom =
      doc.y;

    doc
      .rect(
        left,
        infoTop,
        contentWidth,
        infoBottom -
          infoTop +
          2
      )
      .lineWidth(0.5)
      .strokeColor(borderColor)
      .stroke();

    // ==================================================
    // CONTRIBUTION SUMMARY
    // ==================================================

    doc.moveDown(1.2);

    doc
      .font(boldFont)
      .fontSize(14)
      .fillColor(primaryColor)
      .text("Contribution Summary");

    doc.moveDown(0.7);

    const summaryTop =
      doc.y;

    const cardGap = 10;

    const cardWidth =
      (contentWidth -
        cardGap) /
      2;

    const cardHeight = 75;

    // Total payments

    doc
      .roundedRect(
        left,
        summaryTop,
        cardWidth,
        cardHeight,
        8
      )
      .fillColor(secondaryColor)
      .fill();

    doc
      .font(boldFont)
      .fontSize(9)
      .fillColor(mutedColor)
      .text(
        "TOTAL PAYMENTS",
        left + 12,
        summaryTop + 12
      );

    doc
      .font(boldFont)
      .fontSize(24)
      .fillColor(primaryColor)
      .text(
        String(
          data?.summary
            ?.totalPayments ?? 0
        ),
        left + 12,
        summaryTop + 30
      );

    // Total amount paid

    const paidX =
      left +
      cardWidth +
      cardGap;

    doc
      .roundedRect(
        paidX,
        summaryTop,
        cardWidth,
        cardHeight,
        8
      )
      .fillColor(secondaryColor)
      .fill();

    doc
      .font(boldFont)
      .fontSize(9)
      .fillColor(mutedColor)
      .text(
        "TOTAL AMOUNT PAID",
        paidX + 12,
        summaryTop + 12
      );

    doc
      .font(boldFont)
      .fontSize(19)
      .fillColor(successColor)
      .text(
        formatCurrency(
          data?.summary?.totalPaid
        ),
        paidX + 12,
        summaryTop + 34
      );

    doc.y =
      summaryTop +
      cardHeight +
      25;

    // ==================================================
    // PAYMENT HISTORY
    // ==================================================

    doc
      .font(boldFont)
      .fontSize(14)
      .fillColor(primaryColor)
      .text("Payment History");

    doc.moveDown(0.7);

    const tableTop =
      doc.y;

    const colMonth = 150;
    const colAmount = 105;
    const colStatus = 85;

    const colDate =
      contentWidth -
      colMonth -
      colAmount -
      colStatus;

    const rowHeight = 30;

    // ==================================================
    // TABLE HEADER
    // ==================================================

    doc
      .rect(
        left,
        tableTop,
        contentWidth,
        rowHeight
      )
      .fillColor(primaryColor)
      .fill();

    doc
      .font(boldFont)
      .fontSize(9)
      .fillColor("#FFFFFF")
      .text(
        "MONTH",
        left + 8,
        tableTop + 9,
        {
          width:
            colMonth - 16,
        }
      )
      .text(
        "AMOUNT",
        left +
          colMonth +
          8,
        tableTop + 9,
        {
          width:
            colAmount - 16,
        }
      )
      .text(
        "STATUS",
        left +
          colMonth +
          colAmount +
          8,
        tableTop + 9,
        {
          width:
            colStatus - 16,
        }
      )
      .text(
        "PAYMENT DATE",
        left +
          colMonth +
          colAmount +
          colStatus +
          8,
        tableTop + 9,
        {
          width:
            colDate - 16,
        }
      );

    let currentY =
      tableTop +
      rowHeight;

    // ==================================================
    // PAYMENTS
    // ==================================================

    if (!data?.payments?.length) {
      doc
        .rect(
          left,
          currentY,
          contentWidth,
          rowHeight
        )
        .fillColor("#FFFFFF")
        .fill();

      doc
        .font(regularFont)
        .fontSize(10)
        .fillColor(mutedColor)
        .text(
          "No payments found.",
          left + 8,
          currentY + 9
        );

      currentY += rowHeight;
    } else {
      data.payments.forEach(
        (payment, index) => {
          // --------------------------------------------
          // NEW PAGE ONLY WHEN REALLY NECESSARY
          // --------------------------------------------

          if (
            currentY >
            doc.page.height - 120
          ) {
            doc.addPage();

            currentY = 55;
          }

          const background =
            index % 2 === 0
              ? "#FFFFFF"
              : secondaryColor;

          doc
            .rect(
              left,
              currentY,
              contentWidth,
              rowHeight
            )
            .fillColor(background)
            .fill();

          doc
            .font(regularFont)
            .fontSize(9.5)
            .fillColor(textColor)
            .text(
              `${
                monthNames[
                  payment.monthNumber
                ] || "-"
              } ${
                payment.year || ""
              }`,
              left + 8,
              currentY + 9,
              {
                width:
                  colMonth - 16,
              }
            )
            .text(
              formatCurrency(
                payment.amount
              ),
              left +
                colMonth +
                8,
              currentY + 9,
              {
                width:
                  colAmount - 16,
              }
            )
            .text(
              payment.status ||
                "-",
              left +
                colMonth +
                colAmount +
                8,
              currentY + 9,
              {
                width:
                  colStatus - 16,
              }
            )
            .text(
              formatDate(
                payment.paymentDate
              ),
              left +
                colMonth +
                colAmount +
                colStatus +
                8,
              currentY + 9,
              {
                width:
                  colDate - 16,
              }
            );

          doc
            .moveTo(
              left,
              currentY +
                rowHeight
            )
            .lineTo(
              right,
              currentY +
                rowHeight
            )
            .lineWidth(0.5)
            .strokeColor(borderColor)
            .stroke();

          currentY +=
            rowHeight;
        }
      );
    }

    // ==================================================
    // TABLE BORDER
    // ==================================================

    doc
      .rect(
        left,
        tableTop,
        contentWidth,
        currentY -
          tableTop
      )
      .lineWidth(0.5)
      .strokeColor(borderColor)
      .stroke();

    // ==================================================
    // FOOTERS
    // ==================================================

    const range =
      doc.bufferedPageRange();

    for (
      let pageIndex = range.start;
      pageIndex <
      range.start + range.count;
      pageIndex++
    ) {
      doc.switchToPage(
        pageIndex
      );

      // IMPORTANT:
      // Keep this safely inside the
      // page's printable area.
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
          `Generated on ${formatGeneratedDate()}`,
          right -
            contentWidth / 2,
          footerY,
          {
            width:
              contentWidth / 2,
            align: "right",
          }
        );

      doc
        .font(regularFont)
        .fontSize(8)
        .fillColor(mutedColor)
        .text(
          `Page ${
            pageIndex -
            range.start +
            1
          } of ${range.count}`,
          left,
          footerY + 15,
          {
            width:
              contentWidth,
            align: "center",
          }
        );
    }

    // ==================================================
    // FINISH
    // ==================================================

    doc.end();
  } catch (error) {
    console.error(
      "Member statement PDF generation error:",
      error
    );

    throw error;
  }
};