import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import memberApi from "../../services/memberApi";
import { useMemberAuth } from "../../contexts/MemberAuthContext";
// ======================================================
// HELPERS
// ======================================================

const formatDate = (date) => {
  if (!date) return "Not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return parsed.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) return "M";

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
};

const getStatusStyle = (status) => {
  switch (String(status || "").toUpperCase()) {
    case "ACTIVE":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "INACTIVE":
      return "border-slate-200 bg-slate-100 text-slate-600";

    case "SUSPENDED":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-blue-200 bg-blue-50 text-blue-700";
  }
};

// ======================================================
// INFO ITEM
// ======================================================

const InfoItem = ({ label, value, icon }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  </div>
);

// ======================================================
// INPUT FIELD
// ======================================================

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  disabled = false,
}) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {label}
    </label>

    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
          : "border-slate-300 bg-white text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      }`}
    />
  </div>
);

// ======================================================
// MEMBER PROFILE
// ======================================================

export default function MemberProfile() {
  const navigate = useNavigate();
  const { logout } = useMemberAuth();
  // ====================================================
  // MEMBER DATA
  // ====================================================

  const [member, setMember] = useState(null);
  // ====================================================
  // LOGOUT
  // ====================================================

  const handleLogout = () => {
    logout();

    navigate("/member/login", {
      replace: true,
    });
  };
  // ====================================================
  // LOADING / SAVING STATES
  // ====================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] =
    useState(false);

  // ====================================================
  // GENERAL ALERTS
  // ====================================================

  const [error, setError] = useState("");

  // ====================================================
  // TOAST
  // ====================================================

  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: "",
  });

  // ====================================================
  // PROFILE FORM
  // ====================================================

  const [form, setForm] = useState({
    phone: "",
    email: "",
    address: "",
  });

  // ====================================================
  // PASSWORD FORM
  // ====================================================

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ====================================================
  // SHOW TOAST
  // ====================================================

  const showToast = (type, message) => {
    setToast({
      show: true,
      type,
      message,
    });

    setTimeout(() => {
      setToast({
        show: false,
        type: "",
        message: "",
      });
    }, 4000);
  };

  // ====================================================
  // LOAD PROFILE
  // ====================================================

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await memberApi.get(
        "/member/profile"
      );

      const profile = response.data?.data;

      setMember(profile || null);

      if (profile) {
        setForm({
          phone: profile.phone || "",
          email: profile.email || "",
          address: profile.address || "",
        });
      }
    } catch (err) {
      console.error("Profile Error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    loadProfile();
  }, []);

  // ====================================================
  // PROFILE INPUT CHANGE
  // ====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ====================================================
  // PASSWORD INPUT CHANGE
  // ====================================================

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ====================================================
  // UPDATE MEMBER PROFILE
  //
  // Member can update:
  // - Phone
  // - Email
  // - Address
  //
  // Member CANNOT update:
  // - Full Name
  // - Member ID
  // - Status
  // - Contribution records
  // ====================================================

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const response = await memberApi.put(
        "/member/profile",
        {
          phone: form.phone,
          email: form.email,
          address: form.address,
        }
      );

      const updatedMember = response.data?.data;

      setMember((prev) => ({
        ...prev,
        ...updatedMember,
      }));

      setForm({
        phone: updatedMember?.phone || "",
        email: updatedMember?.email || "",
        address: updatedMember?.address || "",
      });

      showToast(
        "success",
        "Your profile information has been updated successfully."
      );
    } catch (err) {
      console.error("Update Profile Error:", err);

      showToast(
        "error",
        err?.response?.data?.message ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // ====================================================
  // CHANGE MEMBER PASSWORD
  // ====================================================

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setError("");

    // ----------------------------------------------
    // Validate current password
    // ----------------------------------------------

    if (!passwordForm.currentPassword) {
      showToast(
        "error",
        "Please enter your current password."
      );
      return;
    }

    // ----------------------------------------------
    // Validate new password
    // ----------------------------------------------

    if (!passwordForm.newPassword) {
      showToast(
        "error",
        "Please enter a new password."
      );
      return;
    }

    // ----------------------------------------------
    // Validate confirmation
    // ----------------------------------------------

    if (!passwordForm.confirmPassword) {
      showToast(
        "error",
        "Please confirm your new password."
      );
      return;
    }

    // ----------------------------------------------
    // Check password match
    // ----------------------------------------------

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      showToast(
        "error",
        "New password and confirmation do not match."
      );
      return;
    }

    // ----------------------------------------------
    // Minimum password length
    // ----------------------------------------------

    if (passwordForm.newPassword.length < 6) {
      showToast(
        "error",
        "New password must be at least 6 characters long."
      );
      return;
    }

    // ----------------------------------------------
    // Send request
    // ----------------------------------------------

    try {
      setChangingPassword(true);

      const response = await memberApi.put(
        "/member/profile/change-password",
        {
          currentPassword:
            passwordForm.currentPassword,
          newPassword:
            passwordForm.newPassword,
        }
      );

      // --------------------------------------------
      // Clear password fields
      // --------------------------------------------

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // --------------------------------------------
      // Success toast
      // --------------------------------------------

      showToast(
        "success",
        response.data?.message ||
          "Password changed successfully."
      );
    } catch (err) {
      console.error(
        "Change Password Error:",
        err
      );

      // --------------------------------------------
      // Backend error
      // --------------------------------------------

      const message =
        err?.response?.data?.message ||
        "Unable to change your password.";

      showToast("error", message);
    } finally {
      setChangingPassword(false);
    }
  };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl animate-pulse space-y-6">
          <div className="h-32 rounded-3xl bg-slate-200" />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-24 rounded-2xl bg-slate-200" />
            <div className="h-24 rounded-2xl bg-slate-200" />
            <div className="h-24 rounded-2xl bg-slate-200" />
            <div className="h-24 rounded-2xl bg-slate-200" />
          </div>

          <div className="h-64 rounded-3xl bg-slate-200" />
        </div>
      </div>
    );
  }

  // ====================================================
  // PROFILE NOT FOUND
  // ====================================================

  if (!member) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-2xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl font-bold text-red-600">
            !
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Unable to load profile
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error || "Member profile not found."}
          </p>

          <button
            onClick={loadProfile}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ====================================================
  // PROFILE DATA
  // ====================================================

  const fullName = member.fullName || "Member";
  const initials = getInitials(fullName);

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <>
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-6">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div>
            <p className="text-sm font-semibold text-blue-600">
              Account
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              My Profile
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage your personal account information and
              security.
            </p>
          </div>

          {/* ==================================================
              PROFILE HERO
          ================================================== */}

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="h-28 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600" />

            <div className="px-6 pb-6 sm:px-8">

              <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                <div className="flex items-end gap-4">

                  {/* Avatar */}

                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border-4 border-white bg-blue-100 text-2xl font-bold text-blue-700 shadow-lg">
                    {initials}
                  </div>

                  <div className="pb-1">

                    <h2 className="text-2xl font-bold text-slate-900">
                      {fullName}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Ya Isa Zama Association Member
                    </p>

                  </div>

                </div>

                {/* Status */}

                <span
                  className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${getStatusStyle(
                    member.status
                  )}`}
                >
                  <span className="h-2 w-2 rounded-full bg-current" />

                  {member.status || "ACTIVE"}
                </span>

              </div>

            </div>
          </div>

          {/* ==================================================
              PERSONAL INFORMATION
          ================================================== */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <div className="mb-6">

              <h2 className="text-xl font-bold text-slate-900">
                Personal Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                You can update your phone, email and address.
                Your official name cannot be changed here.
              </p>

            </div>

            <form
              onSubmit={handleSaveProfile}
              className="space-y-6"
            >

              {/* FULL NAME - READ ONLY */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>

                <input
                  type="text"
                  value={member.fullName || ""}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Your official association name cannot be
                  changed from your member account.
                </p>

              </div>

              {/* PHONE + EMAIL */}

              <div className="grid gap-5 md:grid-cols-2">

                <InputField
                  label="Phone Number"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="08012345678"
                />

                <InputField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                />

              </div>

              {/* ADDRESS */}

              <InputField
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter your address"
              />

              {/* SAVE */}

              <div className="flex justify-end">

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {saving
                    ? "Saving..."
                    : "Save Profile Changes"}
                </button>

              </div>

            </form>

          </div>

          {/* ==================================================
              MEMBERSHIP INFORMATION
          ================================================== */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <div className="mb-6">

              <h2 className="text-xl font-bold text-slate-900">
                Membership Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                These details are controlled by the
                association.
              </p>

            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <InfoItem
                label="Member ID"
                value={
                  member.id
                    ? `#${member.id}`
                    : "Not available"
                }
                icon="#"
              />

              <InfoItem
                label="Joined"
                value={formatDate(member.createdAt)}
                icon="D"
              />

              <InfoItem
                label="Account Status"
                value={member.status || "ACTIVE"}
                icon="✓"
              />

            </div>

          </div>

          {/* ==================================================
              ACCOUNT SECURITY
          ================================================== */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <div className="mb-6">

              <h2 className="text-xl font-bold text-slate-900">
                Account Security
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Change your member account password.
              </p>

            </div>

            <form
              onSubmit={handleChangePassword}
              className="space-y-5"
            >

              {/* CURRENT PASSWORD */}

              <InputField
                label="Current Password"
                name="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
              />

              {/* NEW + CONFIRM */}

              <div className="grid gap-5 md:grid-cols-2">

                <InputField
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Minimum 6 characters"
                />

                <InputField
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Repeat new password"
                />

              </div>

              {/* CHANGE PASSWORD */}

              <div className="flex justify-end">

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {changingPassword
                    ? "Changing Password..."
                    : "Change Password"}
                </button>

              </div>

            </form>

          </div>

         {/* ==================================================
              SIGN OUT
          ================================================== */}

          <div className="rounded-3xl border border-red-200 bg-white p-6 shadow-sm sm:p-8">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Sign Out
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Sign out of your YIZ-AMS member account on this device.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-red-600
                  px-6
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-red-700
                  focus:outline-none
                  focus:ring-2
                  focus:ring-red-300
                  focus:ring-offset-2
                "
              >
                <span className="text-base">
                  🚪
                </span>

                Logout
              </button>

            </div>

          </div>

          {/* ==================================================
              ADMIN CONTROL NOTICE
          ================================================== */}

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">

            <h3 className="text-sm font-bold text-blue-900">
              Membership information
            </h3>

            <p className="mt-1 text-sm leading-6 text-blue-700">
              Your full name, Member ID, membership status
              and contribution records are controlled by
              the association administrator. Contact the
              administrator if any of these records need
              correction.
            </p>

          </div>

        </div>
      </div>

      {/* ==================================================
          TOAST NOTIFICATION
      ================================================== */}

      {toast.show && (
        <div
          className={`fixed right-5 top-5 z-[9999] w-[min(420px,calc(100vw-40px))] rounded-2xl border bg-white px-5 py-4 shadow-2xl ${
            toast.type === "success"
              ? "border-emerald-200"
              : "border-red-200"
          }`}
        >

          <div className="flex items-start gap-4">

            {/* ICON */}

            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                toast.type === "success"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {toast.type === "success" ? "✓" : "!"}
            </div>

            {/* MESSAGE */}

            <div className="min-w-0 flex-1">

              <p
                className={`text-sm font-bold ${
                  toast.type === "success"
                    ? "text-emerald-800"
                    : "text-red-800"
                }`}
              >
                {toast.type === "success"
                  ? "Success"
                  : "Unable to complete request"}
              </p>

              <p className="mt-1 text-sm leading-5 text-slate-600">
                {toast.message}
              </p>

            </div>

            {/* CLOSE */}

            <button
              type="button"
              onClick={() =>
                setToast({
                  show: false,
                  type: "",
                  message: "",
                })
              }
              className="text-xl leading-none text-slate-400 transition hover:text-slate-700"
              aria-label="Close notification"
            >
              ×
            </button>

          </div>

        </div>
      )}
    </>
  );
}