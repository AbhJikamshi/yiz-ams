const DeleteMemberModal = ({
  open,
  member,
  loading,
  onClose,
  onConfirm,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">

        <h2 className="text-xl font-bold text-red-600">
          Delete Member
        </h2>

        <p className="mt-4 text-gray-600">
          Are you sure you want to delete
        </p>

        <p className="font-semibold text-lg mt-2">
          {member?.fullName}?
        </p>

        <p className="text-gray-500 mt-4">
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3 mt-8">

          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2 rounded-lg border"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>

        </div>

      </div>
    </div>
  );
};

export default DeleteMemberModal;