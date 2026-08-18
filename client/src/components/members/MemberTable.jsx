const MemberTable = ({
  members,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow">

      {/* ==================================================
          MOBILE MEMBER CARDS
          ================================================== */}

      <div className="space-y-4 p-4 lg:hidden">

        {members.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No members found.
          </div>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >

              {/* MEMBER HEADER */}

              <div className="flex items-start gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                  {(member.fullName || "M")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">

                  <p className="break-words font-bold text-gray-900">
                    {member.fullName}
                  </p>

                  <p className="mt-1 break-all text-sm text-gray-600">
                    {member.phone || "No phone"}
                  </p>

                </div>

                {/* STATUS */}

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    member.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {member.status}
                </span>

              </div>

              {/* EMAIL */}

              <div className="mt-4 rounded-lg bg-gray-50 p-3">

                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Email
                </p>

                <p className="mt-1 break-all text-sm font-medium text-gray-800">
                  {member.email || "No email"}
                </p>

              </div>

              {/* ACTIONS */}

              <div className="mt-4 grid grid-cols-2 gap-3">

                <button
                  type="button"
                  onClick={() => onEdit(member)}
                  className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(member)}
                  className="rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Delete
                </button>

              </div>

            </div>
          ))
        )}

      </div>


      {/* ==================================================
          DESKTOP MEMBER TABLE
          ================================================== */}

      <div className="hidden overflow-x-auto lg:block">

        <table className="min-w-[900px] w-full">

          <thead className="bg-gray-100">

            <tr className="text-left text-sm font-semibold text-gray-600">

              <th className="whitespace-nowrap p-4">
                Name
              </th>

              <th className="whitespace-nowrap p-4">
                Phone
              </th>

              <th className="p-4">
                Email
              </th>

              <th className="whitespace-nowrap p-4">
                Status
              </th>

              <th className="whitespace-nowrap p-4 text-center">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {members.length === 0 ? (

              <tr>

                <td
                  colSpan="5"
                  className="p-8 text-center text-gray-500"
                >
                  No members found.
                </td>

              </tr>

            ) : (

              members.map((member) => (

                <tr
                  key={member.id}
                  className="border-t border-gray-100 transition hover:bg-gray-50"
                >

                  {/* NAME */}

                  <td className="p-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                        {(member.fullName || "M")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <span className="whitespace-nowrap font-medium text-gray-900">
                        {member.fullName}
                      </span>

                    </div>

                  </td>

                  {/* PHONE */}

                  <td className="whitespace-nowrap p-4 text-gray-700">
                    {member.phone || "-"}
                  </td>

                  {/* EMAIL */}

                  <td className="min-w-[240px] p-4">

                    <span className="break-all text-gray-700">
                      {member.email || "-"}
                    </span>

                  </td>

                  {/* STATUS */}

                  <td className="whitespace-nowrap p-4">

                    <span
                      className={`rounded-full px-3 py-1 text-sm ${
                        member.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {member.status}
                    </span>

                  </td>

                  {/* ACTIONS */}

                  <td className="whitespace-nowrap p-4 text-center">

                    <div className="flex justify-center gap-3">

                      <button
                        type="button"
                        onClick={() => onEdit(member)}
                        className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100 hover:text-blue-800"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(member)}
                        className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 hover:text-red-800"
                      >
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default MemberTable;