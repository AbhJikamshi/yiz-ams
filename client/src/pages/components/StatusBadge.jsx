const styles = {
  APPROVED:
    "bg-green-100 text-green-700 border border-green-300",

  PAID:
    "bg-green-100 text-green-700 border border-green-300",

  PENDING:
    "bg-yellow-100 text-yellow-700 border border-yellow-300",

  REJECTED:
    "bg-red-100 text-red-700 border border-red-300",

  PARTIAL:
    "bg-blue-100 text-blue-700 border border-blue-300",

  WAIVED:
    "bg-purple-100 text-purple-700 border border-purple-300",
};

export default function StatusBadge({ status }) {
  const badgeStyle =
    styles[status] ||
    "bg-gray-100 text-gray-700 border border-gray-300";

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${badgeStyle}`}
    >
      {status}
    </span>
  );
}