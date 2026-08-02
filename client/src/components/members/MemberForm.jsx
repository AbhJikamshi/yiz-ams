import { useState, useEffect } from "react";

const MemberForm = ({
  member,
  onSubmit,
  loading,
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    status: "ACTIVE",
  });

  // ==========================
  // Populate form when editing
  // ==========================
  useEffect(() => {
    if (member) {
      setFormData({
        fullName: member.fullName || "",
        email: member.email || "",
        phone: member.phone || "",
        address: member.address || "",
        status: member.status || "ACTIVE",
      });
    } else {
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        status: "ACTIVE",
      });
    }
  }, [member]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      ...formData,
    };

    data.phone = data.phone.trim();

    if (
      data.phone.length === 10 &&
      !data.phone.startsWith("0")
    ) {
      data.phone = "0" + data.phone;
    }

    const phoneRegex =
      /^(0|\+234)[789][01]\d{8}$/;

    if (!phoneRegex.test(data.phone)) {
      alert(
        "Please enter a valid Nigerian phone number."
      );
      return;
    }

    onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <input
        name="fullName"
        placeholder="Full Name"
        value={formData.fullName}
        onChange={handleChange}
        className="w-full border rounded-lg p-3"
        required
      />

      <input
        name="email"
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="w-full border rounded-lg p-3"
      />

      <input
        name="phone"
        placeholder="Phone Number"
        value={formData.phone}
        onChange={handleChange}
        className="w-full border rounded-lg p-3"
        required
      />

      <textarea
        name="address"
        placeholder="Address"
        value={formData.address}
        onChange={handleChange}
        className="w-full border rounded-lg p-3"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white rounded-lg p-3"
      >
        {loading
          ? "Saving..."
          : member
          ? "Update Member"
          : "Save Member"}
      </button>
    </form>
  );
};

export default MemberForm;