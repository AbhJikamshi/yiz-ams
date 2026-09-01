import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMemberAuth } from "../../contexts/MemberAuthContext";
import memberApi from "../../services/memberApi";

export default function MemberLogin() {
  const navigate = useNavigate();
  const { login } = useMemberAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      console.log("Submitting login:", form);

      const response = await memberApi.post(
        "/member-auth/login",
        form
      );

      console.log("Login response:", response.data);

      login(
        response.data.member,
        response.data.token
      );

      navigate("/member/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">

        <h1 className="text-3xl font-bold text-center mb-2">
          Member Login
        </h1>

        <p className="text-center text-gray-500 mb-8">
          YIZ Association
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className="w-full border rounded-lg p-3"
            value={form.email}
            onChange={handleChange}
            required
          />

         <div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    name="password"
    placeholder="Password"
    className="w-full border rounded-lg p-3 pr-12"
    value={form.password}
    onChange={handleChange}
    required
  />

  <button
  type="button"
  onClick={() => setShowPassword((prev) => !prev)}
  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
  aria-label={showPassword ? "Hide password" : "Show password"}
>
  {showPassword ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a16.16 16.16 0 0 1-3.08 4.19" />
      <path d="M6.61 6.61A16.16 16.16 0 0 0 2 12s3 7 10 7a10.43 10.43 0 0 0 4.08-.81" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )}
</button>
</div>

<div className="text-right -mt-3">
  <Link
    to="/member/forgot-password"
    className="text-sm text-blue-600 hover:underline"
  >
    Forgot Password?
  </Link>
</div>

<button

            type="submit"
            disabled={loading}
            className={`w-full rounded-lg p-3 text-white font-semibold ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>

      </div>
    </div>
  );
}