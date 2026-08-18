import ExcelJS from "exceljs";

export const generateMemberExcel = async (members) => {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "YIZ-AMS";
  workbook.company = "Ya Isa Zama Association";
  workbook.subject = "Members Report";
  workbook.title = "Members Report";

  const worksheet = workbook.addWorksheet("Members");

  // Title
  worksheet.mergeCells("A1:G1");
  worksheet.getCell("A1").value = "YA ISA ZAMA ASSOCIATION";
  worksheet.getCell("A1").font = {
    bold: true,
    size: 18,
  };
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
  };

  worksheet.mergeCells("A2:G2");
  worksheet.getCell("A2").value = "Members Report";
  worksheet.getCell("A2").font = {
    bold: true,
    size: 14,
  };
  worksheet.getCell("A2").alignment = {
    horizontal: "center",
  };

  worksheet.columns = [
    { header: "Member ID", key: "id", width: 15 },
    { header: "Full Name", key: "name", width: 35 },
    { header: "Phone", key: "phone", width: 20 },
    { header: "Email", key: "email", width: 30 },
    { header: "Address", key: "address", width: 35 },
    { header: "Status", key: "status", width: 15 },
    { header: "Joined Date", key: "joined", width: 20 },
  ];

  const headerRow = worksheet.getRow(4);

  headerRow.values = [
    "Member ID",
    "Full Name",
    "Phone",
    "Email",
    "Address",
    "Status",
    "Joined Date",
  ];

  headerRow.font = {
    bold: true,
    color: {
      argb: "FFFFFFFF",
    },
  };

  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: {
      argb: "1F4E78",
    },
  };

  headerRow.alignment = {
    horizontal: "center",
  };

  members.forEach((member) => {
    worksheet.addRow({
      id: member.id,
      name: member.fullName,
      phone: member.phone ?? "",
      email: member.email ?? "",
      address: member.address ?? "",
      status: member.status,
      joined: new Date(member.createdAt).toLocaleDateString(),
    });
  });

  worksheet.addRow([]);

  const totalRow = worksheet.addRow({
    name: `TOTAL MEMBERS: ${members.length}`,
  });

  totalRow.font = {
    bold: true,
  };

  return workbook;
};