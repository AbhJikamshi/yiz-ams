import { useState } from "react";
import memberApi from "../../services/memberApi";

export default function MemberStatement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const downloadStatement = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await memberApi.get(
        "/member/statement/pdf",
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data], {
          type: "application/pdf",
        })
      );

      const link = document.createElement("a");

      link.href = url;
      link.download = "Member_Contribution_Statement.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(
        "Statement download error:",
        err
      );

      setError(
        "Unable to download your contribution statement."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-28 pt-20 sm:p-6 sm:pb-28 sm:pt-20 lg:p-8 lg:pb-28 lg:pt-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow p-8">

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Contribution Statement
          </h1>

          <p className="text-gray-600 mb-6">
            View and download your complete contribution
            statement as a professional PDF.
          </p>

          {error && (
            <div className="mb-5 rounded-lg bg-red-100 text-red-700 px-4 py-3">
              {error}
            </div>
          )}

          <button
            onClick={downloadStatement}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            {loading
              ? "Generating Statement..."
              : "Download Statement PDF"}
          </button>

        </div>
      </div>
    </div>
  );
}