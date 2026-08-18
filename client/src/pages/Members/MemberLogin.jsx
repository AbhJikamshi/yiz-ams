import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMemberAuth } from "../../contexts/MemberAuthContext";
import memberApi from "../../services/memberApi";

export default function MemberLogin() {
  const navigate = useNavigate();
  const { login } = useMemberAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full border rounded-lg p-3"
            value={form.password}
            onChange={handleChange}
            required
          />

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