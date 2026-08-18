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

  return value.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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
// STATUS COLORS
// ======================================================

const getStatusColor = (status) => {
  const value = String(
    status || ""
  ).toUpperCase();

  switch (value) {
    case "PAID":
      return "#198754";

    case "APPROVED":
      return "#198754";

    case "PENDING":
      return "#E67E22";

    case "PARTIAL":
      return "#D68910";

    case "OVERDUE":
      return "#C0392B";

    case "WAIVED":
      return "#6C757D";

    default:
      return "#666666";
  }
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
      data?.association ||
      (await prisma.setting.findFirst());

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
      data?.member?.fullName ||
      "Member";

    const safeFileName =
      memberName
        .replace(
          /[^a-zA-Z0-9\s_-]/g,
          ""
        )
        .trim()
        .replace(/\s+/g, "_") ||
      "Member";

    // ==================================================
    // DATA
    // ==================================================

    const summary =
      data?.summary || {};

    const contributionSettings =
      data?.contributionSettings || {};

    const monthlyStatus =
      Array.isArray(data?.monthlyStatus)
        ? data.monthlyStatus
        : [];

    const contributionHistory =
      Array.isArray(
        data?.contributionHistory
      )
        ? data.contributionHistory
        : [];

    const outstandingMonths =
      Array.isArray(
        data?.outstandingMonths
      )
        ? data.outstandingMonths
        : [];

    const pendingMonths =
      Array.isArray(data?.pendingMonths)
        ? data.pendingMonths
        : [];

    const pendingVerification =
      Array.isArray(
        data?.pendingVerification
      )
        ? data.pendingVerification
        : [];

    // ==================================================
    // CREATE PDF
    // ==================================================

    const doc = new PDFDocument({
      size: "A4",
      margin: 45,
      bufferPages: true,
      autoFirstPage: true,
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
    const warningColor = "#E67E22";
    const dangerColor = "#C0392B";
    const whiteColor = "#FFFFFF";

    // ==================================================
    // PAGE DIMENSIONS
    // ==================================================

    const left = 45;

    const right =
      doc.page.width - 45;

    const contentWidth =
      right - left;

    // ==================================================
    // DRAW HEADER
    // ==================================================

    const drawHeader = () => {
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
    };

    // ==================================================
    // DRAW FOOTER
    // ==================================================

    const drawFooter = (
      pageNumber,
      totalPages
    ) => {
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
          `Page ${pageNumber} of ${totalPages}`,
          left,
          footerY + 15,
          {
            width: contentWidth,
            align: "center",
          }
        );
    };

    // ==================================================
    // INITIAL HEADER
    // ==================================================

    drawHeader();

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
      [
        "Contribution Start:",
        contributionSettings
          ?.memberContributionStart
          ?.month || "-",
      ],
    ];

    memberInfo.forEach(
      ([label, value]) => {
        const rowTop = doc.y;

        doc
          .font(boldFont)
          .fontSize(10.5)
          .fillColor(textColor)
          .text(
            label,
            left + 8,
            rowTop + 7,
            {
              width: labelWidth,
            }
          );

        doc
          .font(regularFont)
          .fontSize(10.5)
          .fillColor(textColor)
          .text(
            String(value),
            valueX,
            rowTop,
            {
              width: valueWidth,
            }
          );

        doc.y =
          rowTop + 24;
      }
    );

    const infoBottom = doc.y;

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

    const summaryTop = doc.y;

    const cardGap = 8;

    const cardColumns = 3;

    const cardWidth =
      (contentWidth -
        cardGap * 2) /
      cardColumns;

    const cardHeight = 68;

    const drawSummaryCard = (
      x,
      y,
      label,
      value,
      valueColor = primaryColor
    ) => {
      doc
        .roundedRect(
          x,
          y,
          cardWidth,
          cardHeight,
          8
        )
        .fillColor(secondaryColor)
        .fill();

      doc
        .font(boldFont)
        .fontSize(8)
        .fillColor(mutedColor)
        .text(
          label,
          x + 10,
          y + 10,
          {
            width:
              cardWidth - 20,
          }
        );

      doc
        .font(boldFont)
        .fontSize(15)
        .fillColor(valueColor)
        .text(
          value,
          x + 10,
          y + 30,
          {
            width:
              cardWidth - 20,
          }
        );
    };

    // Row 1

    drawSummaryCard(
      left,
      summaryTop,
      "MONTHLY CONTRIBUTION",
      formatCurrency(
        contributionSettings
          ?.monthlyContributionAmount
      ),
      primaryColor
    );

    drawSummaryCard(
      left +
        cardWidth +
        cardGap,
      summaryTop,
      "TOTAL EXPECTED",
      formatCurrency(
        summary.totalExpected
      ),
      primaryColor
    );

    drawSummaryCard(
      left +
        (cardWidth +
          cardGap) *
          2,
      summaryTop,
      "TOTAL PAID",
      formatCurrency(
        summary.totalPaid
      ),
      successColor
    );

    // Row 2

    const summaryRow2 =
      summaryTop +
      cardHeight +
      8;

    drawSummaryCard(
      left,
      summaryRow2,
      "OUTSTANDING",
      formatCurrency(
        summary.outstandingAmount
      ),
      summary.outstandingAmount >
        0
        ? dangerColor
        : successColor
    );

    drawSummaryCard(
      left +
        cardWidth +
        cardGap,
      summaryRow2,
      "PENDING VERIFICATION",
      formatCurrency(
        summary.pendingAmount
      ),
      summary.pendingAmount >
        0
        ? warningColor
        : successColor
    );

    drawSummaryCard(
      left +
        (cardWidth +
          cardGap) *
          2,
      summaryRow2,
      "COMPLETION",
      `${summary.paymentCompletionPercentage ?? 0}%`,
      primaryColor
    );

    doc.y =
      summaryRow2 +
      cardHeight +
      25;

    // ==================================================
    // ADDITIONAL SUMMARY
    // ==================================================

    doc
      .font(boldFont)
      .fontSize(10)
      .fillColor(textColor)
      .text(
        `Due Months: ${
          summary.totalDueMonths ?? 0
        }`
      );

    doc
      .font(regularFont)
      .fontSize(10)
      .fillColor(mutedColor)
      .text(
        `Paid Months: ${
          summary.paidMonths ?? 0
        }    |    Waived Months: ${
          summary.waivedMonths ?? 0
        }    |    Pending Requests: ${
          summary.pendingRequests ?? 0
        }`
      );

    doc.moveDown(1.1);

    // ==================================================
    // MONTHLY CONTRIBUTION STATEMENT
    // ==================================================

    doc
      .font(boldFont)
      .fontSize(14)
      .fillColor(primaryColor)
      .text(
        "Monthly Contribution Statement"
      );

    doc.moveDown(0.7);

    // ==================================================
    // TABLE CONFIGURATION
    // ==================================================

    const tableHeaderHeight = 28;
    const rowHeight = 27;

    const colMonth = 100;
    const colExpected = 78;
    const colPaid = 72;
    const colPending = 75;
    const colOutstanding = 90;

    const colStatus =
      contentWidth -
      colMonth -
      colExpected -
      colPaid -
      colPending -
      colOutstanding;

    const drawTableHeader = (
      y
    ) => {
      doc
        .rect(
          left,
          y,
          contentWidth,
          tableHeaderHeight
        )
        .fillColor(primaryColor)
        .fill();

      doc
        .font(boldFont)
        .fontSize(7.5)
        .fillColor(whiteColor)

        .text(
          "MONTH",
          left + 5,
          y + 9,
          {
            width:
              colMonth - 10,
          }
        )

        .text(
          "EXPECTED",
          left +
            colMonth +
            5,
          y + 9,
          {
            width:
              colExpected - 10,
            align: "right",
          }
        )

        .text(
          "PAID",
          left +
            colMonth +
            colExpected +
            5,
          y + 9,
          {
            width:
              colPaid - 10,
            align: "right",
          }
        )

        .text(
          "PENDING",
          left +
            colMonth +
            colExpected +
            colPaid +
            5,
          y + 9,
          {
            width:
              colPending - 10,
            align: "right",
          }
        )

        .text(
          "OUTSTANDING",
          left +
            colMonth +
            colExpected +
            colPaid +
            colPending +
            5,
          y + 9,
          {
            width:
              colOutstanding - 10,
            align: "right",
          }
        )

        .text(
          "STATUS",
          left +
            colMonth +
            colExpected +
            colPaid +
            colPending +
            colOutstanding +
            5,
          y + 9,
          {
            width:
              colStatus - 10,
          }
        );
    };

    let currentY = doc.y;

    drawTableHeader(
      currentY
    );

    currentY +=
      tableHeaderHeight;

    // ==================================================
    // MONTHLY ROWS
    // ==================================================

    if (
      monthlyStatus.length === 0
    ) {
      doc
        .rect(
          left,
          currentY,
          contentWidth,
          rowHeight
        )
        .fillColor(whiteColor)
        .fill();

      doc
        .font(regularFont)
        .fontSize(9)
        .fillColor(mutedColor)
        .text(
          "No contribution periods found.",
          left + 8,
          currentY + 8
        );

      currentY += rowHeight;
    } else {
      monthlyStatus.forEach(
        (item, index) => {
          // --------------------------------------------
          // NEW PAGE
          // --------------------------------------------

          if (
            currentY + rowHeight >
            doc.page.height - 105
          ) {
            doc.addPage();

            drawHeader();

            currentY = 145;

            doc
              .font(boldFont)
              .fontSize(12)
              .fillColor(primaryColor)
              .text(
                "Monthly Contribution Statement (Continued)",
                left,
                currentY
              );

            currentY += 20;

            drawTableHeader(
              currentY
            );

            currentY +=
              tableHeaderHeight;
          }

          const background =
            index % 2 === 0
              ? whiteColor
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

          const status =
            String(
              item.status || "-"
            ).toUpperCase();

          // --------------------------------------------
          // MONTH
          // --------------------------------------------

          const monthName =
            item.month ||
            `${
              monthNames[
                item.monthNumber
              ] || "-"
            } ${
              item.year || ""
            }`;

          doc
            .font(regularFont)
            .fontSize(7.8)
            .fillColor(textColor)
            .text(
              monthName,
              left + 5,
              currentY + 8,
              {
                width:
                  colMonth - 10,
              }
            );

          // --------------------------------------------
          // EXPECTED
          // --------------------------------------------

          doc.text(
            formatCurrency(
              item.expectedAmount
            ),
            left +
              colMonth +
              5,
            currentY + 8,
            {
              width:
                colExpected - 10,
              align: "right",
            }
          );

          // --------------------------------------------
          // PAID
          // --------------------------------------------

          doc.text(
            formatCurrency(
              item.paidAmount
            ),
            left +
              colMonth +
              colExpected +
              5,
            currentY + 8,
            {
              width:
                colPaid - 10,
              align: "right",
            }
          );

          // --------------------------------------------
          // PENDING
          // --------------------------------------------

          doc.text(
            formatCurrency(
              item.pendingAmount
            ),
            left +
              colMonth +
              colExpected +
              colPaid +
              5,
            currentY + 8,
            {
              width:
                colPending - 10,
              align: "right",
            }
          );

          // --------------------------------------------
          // OUTSTANDING
          // --------------------------------------------

          doc.text(
            formatCurrency(
              item.outstandingAmount
            ),
            left +
              colMonth +
              colExpected +
              colPaid +
              colPending +
              5,
            currentY + 8,
            {
              width:
                colOutstanding - 10,
              align: "right",
            }
          );

          // --------------------------------------------
          // STATUS
          // --------------------------------------------

          doc
            .font(boldFont)
            .fontSize(7.5)
            .fillColor(
              getStatusColor(
                status
              )
            )
            .text(
              status,
              left +
                colMonth +
                colExpected +
                colPaid +
                colPending +
                colOutstanding +
                5,
              currentY + 8,
              {
                width:
                  colStatus - 10,
              }
            );

          // --------------------------------------------
          // ROW BORDER
          // --------------------------------------------

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
            .strokeColor(
              borderColor
            )
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
        doc.y,
        contentWidth,
        0
      );

    // ==================================================
    // OUTSTANDING SECTION
    // ==================================================

    if (
      outstandingMonths.length > 0
    ) {
      if (
        currentY + 80 >
        doc.page.height - 105
      ) {
        doc.addPage();

        drawHeader();

        currentY = 145;
      }

      currentY += 18;

      doc
        .font(boldFont)
        .fontSize(13)
        .fillColor(dangerColor)
        .text(
          "Outstanding Contributions",
          left,
          currentY
        );

      currentY += 20;

      doc
        .font(regularFont)
        .fontSize(9)
        .fillColor(textColor)
        .text(
          `Total outstanding: ${formatCurrency(
            summary.outstandingAmount
          )}`,
          left,
          currentY
        );

      currentY += 18;

      outstandingMonths
        .slice(0, 12)
        .forEach(
          (item) => {
            if (
              currentY + 20 >
              doc.page.height - 105
            ) {
              doc.addPage();

              drawHeader();

              currentY = 145;
            }

            doc
              .font(regularFont)
              .fontSize(8.5)
              .fillColor(textColor)
              .text(
                `${item.month}: ${formatCurrency(
                  item.amount
                )}`,
                left + 8,
                currentY
              );

            currentY += 17;
          }
        );
    }

    // ==================================================
    // PENDING VERIFICATION
    // ==================================================

    if (
      pendingVerification.length >
      0
    ) {
      if (
        currentY + 90 >
        doc.page.height - 105
      ) {
        doc.addPage();

        drawHeader();

        currentY = 145;
      }

      currentY += 18;

      doc
        .font(boldFont)
        .fontSize(13)
        .fillColor(warningColor)
        .text(
          "Pending Verification",
          left,
          currentY
        );

      currentY += 20;

      doc
        .font(regularFont)
        .fontSize(9)
        .fillColor(textColor)
        .text(
          `Pending amount: ${formatCurrency(
            summary.pendingAmount
          )}`,
          left,
          currentY
        );

      currentY += 20;

      pendingVerification
        .slice(0, 10)
        .forEach(
          (request) => {
            if (
              currentY + 45 >
              doc.page.height - 105
            ) {
              doc.addPage();

              drawHeader();

              currentY = 145;
            }

            doc
              .font(boldFont)
              .fontSize(8.5)
              .fillColor(textColor)
              .text(
                `Reference: ${
                  request.transactionReference ||
                  "-"
                }`,
                left + 8,
                currentY
              );

            currentY += 14;

            doc
              .font(regularFont)
              .fontSize(8.5)
              .fillColor(mutedColor)
              .text(
                `Amount: ${formatCurrency(
                  request.amount
                )}    Date: ${formatDate(
                  request.paymentDate
                )}`,
                left + 8,
                currentY
              );

            currentY += 18;
          }
        );
    }

    // ==================================================
    // PAYMENT HISTORY
    // ==================================================

    if (
      contributionHistory.length >
      0
    ) {
      if (
        currentY + 100 >
        doc.page.height - 105
      ) {
        doc.addPage();

        drawHeader();

        currentY = 145;
      }

      currentY += 15;

      doc
        .font(boldFont)
        .fontSize(13)
        .fillColor(primaryColor)
        .text(
          "Payment History",
          left,
          currentY
        );

      currentY += 22;

      const historyColMonth = 150;
      const historyColAmount = 100;
      const historyColStatus = 85;

      const historyColDate =
        contentWidth -
        historyColMonth -
        historyColAmount -
        historyColStatus;

      const historyHeaderHeight = 27;
      const historyRowHeight = 27;

      const drawHistoryHeader =
        (y) => {
          doc
            .rect(
              left,
              y,
              contentWidth,
              historyHeaderHeight
            )
            .fillColor(primaryColor)
            .fill();

          doc
            .font(boldFont)
            .fontSize(8)
            .fillColor(whiteColor)
            .text(
              "MONTH",
              left + 7,
              y + 9,
              {
                width:
                  historyColMonth - 14,
              }
            )
            .text(
              "AMOUNT",
              left +
                historyColMonth +
                7,
              y + 9,
              {
                width:
                  historyColAmount - 14,
              }
            )
            .text(
              "STATUS",
              left +
                historyColMonth +
                historyColAmount +
                7,
              y + 9,
              {
                width:
                  historyColStatus - 14,
              }
            )
            .text(
              "PAYMENT DATE",
              left +
                historyColMonth +
                historyColAmount +
                historyColStatus +
                7,
              y + 9,
              {
                width:
                  historyColDate - 14,
              }
            );
        };

      drawHistoryHeader(
        currentY
      );

      currentY +=
        historyHeaderHeight;

      contributionHistory.forEach(
        (payment, index) => {
          if (
            currentY +
              historyRowHeight >
            doc.page.height - 105
          ) {
            doc.addPage();

            drawHeader();

            currentY = 145;

            doc
              .font(boldFont)
              .fontSize(12)
              .fillColor(primaryColor)
              .text(
                "Payment History (Continued)",
                left,
                currentY
              );

            currentY += 20;

            drawHistoryHeader(
              currentY
            );

            currentY +=
              historyHeaderHeight;
          }

          const background =
            index % 2 === 0
              ? whiteColor
              : secondaryColor;

          doc
            .rect(
              left,
              currentY,
              contentWidth,
              historyRowHeight
            )
            .fillColor(background)
            .fill();

          const monthName =
            payment.month ||
            `${
              monthNames[
                payment.monthNumber
              ] || "-"
            } ${
              payment.year || ""
            }`;

          const status =
            String(
              payment.status ||
                "-"
            ).toUpperCase();

          doc
            .font(regularFont)
            .fontSize(8.5)
            .fillColor(textColor)
            .text(
              monthName,
              left + 7,
              currentY + 8,
              {
                width:
                  historyColMonth -
                  14,
              }
            )
            .text(
              formatCurrency(
                payment.amount
              ),
              left +
                historyColMonth +
                7,
              currentY + 8,
              {
                width:
                  historyColAmount -
                  14,
              }
            )
            .font(boldFont)
            .fillColor(
              getStatusColor(
                status
              )
            )
            .text(
              status,
              left +
                historyColMonth +
                historyColAmount +
                7,
              currentY + 8,
              {
                width:
                  historyColStatus -
                  14,
              }
            )
            .font(regularFont)
            .fillColor(textColor)
            .text(
              formatDate(
                payment.paymentDate
              ),
              left +
                historyColMonth +
                historyColAmount +
                historyColStatus +
                7,
              currentY + 8,
              {
                width:
                  historyColDate -
                  14,
              }
            );

          doc
            .moveTo(
              left,
              currentY +
                historyRowHeight
            )
            .lineTo(
              right,
              currentY +
                historyRowHeight
            )
            .lineWidth(0.5)
            .strokeColor(
              borderColor
            )
            .stroke();

          currentY +=
            historyRowHeight;
        }
      );
    }

    // ==================================================
    // FOOTERS
    // ==================================================

    const range =
      doc.bufferedPageRange();

    for (
      let pageIndex =
        range.start;
      pageIndex <
      range.start +
        range.count;
      pageIndex++
    ) {
      doc.switchToPage(
        pageIndex
      );

      drawFooter(
        pageIndex -
          range.start +
          1,
        range.count
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