import api from "./api";

// =====================================================
// FINANCIAL SUMMARY
// =====================================================

export const getFinancialSummary = async () => {
  const { data } = await api.get("/reports/summary");

  return data;
};

// =====================================================
// ADMIN SUMMARY
// =====================================================

export const getAdminSummary = async () => {
  const { data } = await api.get(
    "/reports/admin-summary"
  );

  return data;
};

// =====================================================
// MONTHLY INCOME
// =====================================================

export const getMonthlyIncome = async () => {
  const { data } = await api.get(
    "/reports/monthly-income"
  );

  return data;
};

// =====================================================
// MONTHLY EXPENSES
// =====================================================

export const getMonthlyExpenses = async () => {
  const { data } = await api.get(
    "/reports/monthly-expenses"
  );

  return data;
};

// =====================================================
// OUTSTANDING MEMBERS
// =====================================================

export const getOutstandingMembers = async () => {
  const { data } = await api.get(
    "/reports/outstanding-members"
  );

  return data;
};

// =====================================================
// CONTRIBUTION REPORT
// =====================================================

export const getContributionReport = async (
  filters = {}
) => {
  const { data } = await api.get(
    "/reports/contributions",
    {
      params: filters,
    }
  );

  return data;
};

// =====================================================
// EXPENSE REPORT
// =====================================================

export const getExpenseReport = async (
  filters = {}
) => {
  const { data } = await api.get(
    "/reports/expenses",
    {
      params: filters,
    }
  );

  return data;
};

// =====================================================
// DOWNLOAD FINANCIAL SUMMARY EXCEL
// =====================================================

export const downloadFinancialSummaryExcel =
  async () => {
    const response = await api.get(
      "/reports/summary/excel",
      {
        responseType: "blob",
      }
    );

    return response.data;
  };

// =====================================================
// DOWNLOAD CONTRIBUTION EXCEL
// =====================================================

export const downloadContributionExcel =
  async () => {
    const response = await api.get(
      "/reports/contributions/excel",
      {
        responseType: "blob",
      }
    );

    return response.data;
  };

// =====================================================
// DOWNLOAD EXPENSE EXCEL
// =====================================================

export const downloadExpenseExcel =
  async () => {
    const response = await api.get(
      "/reports/expenses/excel",
      {
        responseType: "blob",
      }
    );

    return response.data;
  };

// =====================================================
// DOWNLOAD MEMBERS EXCEL
// =====================================================

export const downloadMemberExcel =
  async () => {
    const response = await api.get(
      "/reports/members/excel",
      {
        responseType: "blob",
      }
    );

    return response.data;
  };

// =====================================================
// DOWNLOAD MEMBER STATEMENT
// =====================================================

export const downloadMemberStatement =
  async (memberId) => {
    const response = await api.get(
      `/reports/members/${memberId}`,
      {
        responseType: "blob",
      }
    );

    return response.data;
  };

// =====================================================
// DOWNLOAD CONTRIBUTION RECEIPT PDF
// =====================================================

export const downloadReceiptPDF =
  async (contributionId) => {
    const response = await api.get(
      `/reports/receipt/${contributionId}/pdf`,
      {
        responseType: "blob",
      }
    );

    return response.data;
  };