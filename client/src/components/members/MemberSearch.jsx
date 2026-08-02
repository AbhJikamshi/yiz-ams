const MemberSearch = ({ value, onChange }) => {
  return (
    <input
      type="text"
      placeholder="Search members..."
      value={value}
      onChange={onChange}
      className="border rounded-lg px-4 py-2 w-80"
    />
  );
};

export default MemberSearch;