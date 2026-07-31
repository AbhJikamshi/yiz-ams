export const drawHeader = (doc, settings) => {
  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .text(
      settings?.associationName ?? "YA ISA ZAMA ASSOCIATION",
      {
        align: "center",
      }
    );

  doc
    .moveDown(0.3)
    .fontSize(13)
    .font("Helvetica")
    .text(
      "Association Management System",
      {
        align: "center",
      }
    );

  doc.moveDown();

  doc
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke();

  doc.moveDown();
};