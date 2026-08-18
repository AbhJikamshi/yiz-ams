const MemberSearch = ({ value, onChange }) => {
  return (
    <input
      type="text"
      placeholder="Search members..."
      value={value}
      onChange={onChange}
      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:max-w-md"
    />
  );
};

export default MemberSearch;