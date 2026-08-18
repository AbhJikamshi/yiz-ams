const MemberTable = ({
  members,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-4">Name</th>
            <th className="text-left p-4">Phone</th>
            <th className="text-left p-4">Email</th>
            <th className="text-left p-4">Status</th>
            <th className="text-center p-4">Actions</th>
          </tr>
        </thead>

        <tbody>
          {members.length === 0 ? (
            <tr>
              <td
                colSpan="5"
                className="text-center p-8 text-gray-500"
              >
                No members found.
              </td>
            </tr>
          ) : (
            members.map((member) => (
              <tr
                key={member.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-4 font-medium">
                  {member.fullName}
                </td>

                <td className="p-4">
                  {member.phone}
                </td>

                <td className="p-4">
                  {member.email || "-"}
                </td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      member.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {member.status}
                  </span>
                </td>

                <td className="p-4 text-center space-x-3">
                  <button
                    onClick={() => onEdit(member)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => onDelete(member)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MemberTable;