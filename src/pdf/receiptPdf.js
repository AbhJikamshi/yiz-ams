import PDFDocument from "pdfkit";

import { formatCurrency } from "../utils/formatCurrency.js";
import { formatDate } from "../utils/formatDate.js";
import { getMonthName } from "../utils/monthName.js";
import { receiptNumber } from "../utils/receiptNumber.js";

export const generateReceiptPDF = (res, contribution) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename=${receiptNumber(contribution.id)}.pdf`
  );

  doc.pipe(res);

  // ===========================
  // Header
  // ===========================

  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .text("YA ISA ZAMA ASSOCIATION", {
      align: "center",
    });

  doc
    .moveDown(0.3)
    .fontSize(15)
    .font("Helvetica")
    .text("OFFICIAL CONTRIBUTION RECEIPT", {
      align: "center",
    });

  doc.moveDown();

  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();

  doc.moveDown();

  // ===========================
  // Receipt Information
  // ===========================

  doc.font("Helvetica-Bold");
  doc.text("Receipt Number:", 50, doc.y);

  doc.font("Helvetica");
  doc.text(receiptNumber(contribution.id), 180, doc.y - 15);

  doc.font("Helvetica-Bold");
  doc.text("Generated:", 50, doc.y + 10);

  doc.font("Helvetica");
  doc.text(formatDate(contribution.createdAt), 180, doc.y - 15);

  doc.moveDown(2);

  // ===========================
  // Member Details
  // ===========================

  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("Member Information");

  doc.moveDown(0.5);

  doc.fontSize(12);

  doc.font("Helvetica-Bold");
  doc.text("Name:");

  doc.font("Helvetica");
  doc.text(contribution.member.fullName);

  doc.moveDown();

  doc.font("Helvetica-Bold");
  doc.text("Contribution Amount:");

  doc.font("Helvetica");
  doc.text(formatCurrency(contribution.amount));

  doc.moveDown();

  doc.font("Helvetica-Bold");
  doc.text("Contribution Month:");

  doc.font("Helvetica");
  doc.text(
    `${getMonthName(contribution.monthNumber)} ${contribution.year}`
  );

  doc.moveDown();

  doc.font("Helvetica-Bold");
  doc.text("Status:");

  doc.font("Helvetica");
  doc.text(contribution.status);

  doc.moveDown(2);

  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();

  doc.moveDown();

  doc
    .font("Helvetica")
    .fontSize(12)
    .text(
      "Thank you for supporting Ya Isa Zama Association.",
      {
        align: "center",
      }
    );

  doc.moveDown(4);

  doc.text("__________________________", {
    align: "right",
  });

  doc.text("Treasurer Signature", {
    align: "right",
  });

  doc.end();
};