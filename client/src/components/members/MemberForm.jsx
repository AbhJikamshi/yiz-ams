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
    contributionStartDate: "",
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
        contributionStartDate: member.contributionStartDate
          ? member.contributionStartDate.slice(0, 10)
          : "",
      });
    } else {
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        status: "ACTIVE",
        contributionStartDate: "",
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

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {/* Full Name */}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Full Name
        </label>

        <input
          name="fullName"
          placeholder="Enter full name"
          value={formData.fullName}
          onChange={handleChange}
          className={inputClass}
          autoComplete="name"
          required
        />
      </div>

      {/* Email */}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Email
        </label>

        <input
          name="email"
          type="email"
          placeholder="Enter email address"
          value={formData.email}
          onChange={handleChange}
          className={inputClass}
          autoComplete="email"
        />
      </div>

      {/* Phone */}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Phone Number
        </label>

        <input
          name="phone"
          type="tel"
          inputMode="tel"
          placeholder="08012345678"
          value={formData.phone}
          onChange={handleChange}
          className={inputClass}
          autoComplete="tel"
          required
        />

        <p className="mt-1 text-xs text-gray-500">
          Enter a valid Nigerian phone number.
        </p>
      </div>

      {/* Address */}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Address
        </label>

        <textarea
          name="address"
          placeholder="Enter member address"
          value={formData.address}
          onChange={handleChange}
          rows={3}
          className={`${inputClass} resize-y`}
        />
      </div>

      {/* Status */}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Status
        </label>

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Contribution Start Date */}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Contribution Start Date
        </label>

        <input
          name="contributionStartDate"
          type="date"
          value={formData.contributionStartDate}
          onChange={handleChange}
          className={inputClass}
        />

        <p className="mt-1 text-xs leading-5 text-gray-500">
          The month from which this member's contribution
          obligations should begin.
        </p>
      </div>

      {/* Submit */}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
