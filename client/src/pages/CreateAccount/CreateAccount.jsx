import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerMember } from "../../services/memberAuthService";

const CreateAccount = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!form.password) {
      setError("Please create a password.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await registerMember({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim().toLowerCase(),
        address: form.address.trim(),
        password: form.password,
      });

      navigate("/member/login", {
        replace: true,
        state: {
          message:
            "Account created successfully. You can now log in.",
          email: form.email.trim().toLowerCase(),
        },
      });
    } catch (err) {
      console.error("Registration error:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to create your account. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 px-4 py-8">
      <div className="mx-auto flex min-h-[90vh] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">

          {/* Left Section */}
          <div className="hidden bg-gradient-to-br from-emerald-700 to-emerald-900 p-10 text-white lg:flex lg:flex-col lg:justify-center">
            <div className="mb-8">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl backdrop-blur">
                YIZ
              </div>

              <h1 className="text-4xl font-bold leading-tight">
                Join Your Association
              </h1>

              <p className="mt-4 text-lg leading-8 text-emerald-100">
                Create your YIZ-AMS member account and manage your
                association activities from one place.
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold">
                    Manage Contributions
                  </h3>
                  <p className="text-sm text-emerald-100">
                    Make payments and track your contribution history.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold">
                    View Your Records
                  </h3>
                  <p className="text-sm text-emerald-100">
                    Access your statements, payments and profile.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold">
                    Stay Connected
                  </h3>
                  <p className="text-sm text-emerald-100">
                    Receive association announcements and notifications.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-6 sm:p-10">
            <div className="mx-auto max-w-xl">
              <div className="mb-8">
                <Link
                  to="/"
                  className="mb-6 inline-flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-900"
                >
                  ← Back to Welcome
                </Link>

                <h2 className="text-3xl font-bold text-slate-900">
                  Create New Account
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Register as a member to access YIZ-AMS.
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Full Name */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    disabled={loading}
                  />
                </div>

                {/* Phone + Email */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="08012345678"
                      autoComplete="tel"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Enter your address"
                    rows="3"
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    disabled={loading}
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-20 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      disabled={loading}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => !prev)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-emerald-700"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Confirm Password
                  </label>

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-20 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      disabled={loading}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((prev) => !prev)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-emerald-700"
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-emerald-700 px-5 py-3.5 font-semibold text-white shadow-lg transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Creating Account..."
                    : "Create Account"}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  to="/member/login"
                  className="font-semibold text-emerald-700 hover:text-emerald-900"
                >
                  Member Login
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateAccount;