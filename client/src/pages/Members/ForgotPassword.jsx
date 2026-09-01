import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../../services/memberAuthService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await requestPasswordReset(email);

      setMessage(
        response.message ||
          "If an account with that email exists, a password reset link has been sent."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to process password reset request."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">

        <h1 className="text-3xl font-bold text-center mb-2">
          Forgot Password?
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Enter your member email to receive a password reset link.
        </p>

        {message && (
          <div className="bg-green-100 text-green-700 rounded-lg p-3 mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full border rounded-lg p-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            to="/member/login"
            className="text-blue-600 hover:underline"
          >
            Back to Member Login
          </Link>
        </div>

      </div>
    </div>
  );
}