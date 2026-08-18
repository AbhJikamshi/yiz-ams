const MemberModal = ({
  open,
  title,
  children,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4">

      <div className="flex max-h-[95vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-xl">

        {/* HEADER */}

        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-5">

          <h2 className="min-w-0 pr-4 text-xl font-bold text-gray-900 sm:text-2xl">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-xl leading-none text-gray-500 transition hover:bg-red-50 hover:text-red-600"
            aria-label="Close modal"
          >
            ×
          </button>

        </div>

        {/* CONTENT */}

        <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {children}
        </div>

      </div>

    </div>
  );
};

export default MemberModal;
