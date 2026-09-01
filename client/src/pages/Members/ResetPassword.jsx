import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  verifyPasswordResetToken,
  resetMemberPassword,
} from "../../services/memberAuthService";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [checking, setChecking] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("Invalid or missing reset token.");
        setChecking(false);
        return;
      }

      try {
        await verifyPasswordResetToken(token);
        setValidToken(true);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "This password reset link is invalid or expired."
        );
      } finally {
        setChecking(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await resetMemberPassword(
        token,
        password
      );

      setMessage(
        response.message || "Password reset successfully."
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/member/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md text-center">
          <p className="text-gray-600">
            Checking reset link...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">

        <h1 className="text-3xl font-bold text-center mb-2">
          Reset Password
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Create a new password for your YIZ-AMS member account.
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 text-green-700 rounded-lg p-3 mb-4">
            {message}
          </div>
        )}

        {validToken && !message && (
          <form onSubmit={handleSubmit} className="space-y-5">

            <input
              type="password"
              placeholder="New Password"
              className="w-full border rounded-lg p-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />

            <input
              type="password"
              placeholder="Confirm New Password"
              className="w-full border rounded-lg p-3"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              minLength={6}
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
              {loading
                ? "Resetting..."
                : "Reset Password"}
            </button>

          </form>
        )}

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